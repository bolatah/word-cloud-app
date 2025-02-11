import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from "@angular/core";
import { WordCloud } from "../word-cloud.model";
import { Store } from "@ngrx/store";
import {
  updateWordCloud,
  deleteWordCloud,
  loadWordCloudById,
} from "../state/word-cloud.actions";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  Observable,
  Subject,
  take,
} from "rxjs";
import { selectWordCloudById } from "../state/word-cloud.selectors";
import { AsyncPipe } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import cloud from "d3-cloud";
import * as d3 from "d3";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { WordCloudService } from "../word-cloud.service";
import { BaseType } from "d3";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import {
  Settings,
  WordCloudSettingsDialogComponent,
} from "../word-cloud-settings-dialog/word-cloud-settings-dialog.component";
import { WordAddingDialogComponent } from "../word-adding-dialog/word-adding-dialog.component";

interface Word {
  text: string;
  x: number;
  y: number;
}
interface WordEdit {
  oldText: string;
  newText: string;
}

@Component({
  selector: "app-word-cloud-detail",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: "./word-cloud-detail.component.html",
  styleUrls: ["./word-cloud-detail.component.css"],
})
export class WordCloudDetailComponent implements OnInit, AfterViewInit {
  @ViewChild("wordCloudContainer", { static: false })
  wordCloudContainer!: ElementRef;
  private wordEditSubject = new Subject<WordEdit>();
  addDialogRef!: MatDialogRef<any>;
  settingsDialogRef!: MatDialogRef<any>;
  wordCloud$!: Observable<WordCloud>;
  selectedWord: { text: string; x: number; y: number } | null = null;
  settingsData: Settings = {
    fontSize: 30,
    fontType: "Arial",
    colorScheme: "single-color",
    singleColor: "#0d0d0d",
  };

  constructor(
    private store: Store,
    private route: ActivatedRoute,
    private router: Router,
    private wordCloudService: WordCloudService,
    private readonly dialog: MatDialog
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get("id")!;
    if (id) {
      this.store.dispatch(loadWordCloudById({ id: parseInt(id, 10) }));
      this.wordCloud$ = this.store.select(selectWordCloudById(id));
    }
    this.wordEditSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged((prev, curr) => prev.newText === curr.newText)
      )
      .subscribe(({ oldText, newText }) => {
        this.updateWord(oldText, newText);
      });
    window.addEventListener("resize", this.onResize.bind(this));
  }

  ngAfterViewInit(): void {
    this.wordCloud$.subscribe(() => this.applySettings(this.settingsData));
  }

  onResize(): void {
    const container = this.wordCloudContainer.nativeElement;
    const svg = d3.select(container).select("svg");
    svg
      .attr("width", container.offsetWidth)
      .attr("height", container.offsetHeight)
      .attr(
        "viewBox",
        `0 0 ${container.offsetWidth} ${container.offsetHeight}`
      );

    this.applySettings(this.settingsData);
  }

  openAddDialog(): void {
    const id = this.route.snapshot.paramMap.get("id")!;
    this.addDialogRef = this.dialog.open(WordAddingDialogComponent, {
      disableClose: true,
      data: { id },
    });
  }

  openSettingsDialog(): void {
    const dialogRef = this.dialog.open(WordCloudSettingsDialogComponent, {
      data: this.settingsData,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.applySettings(result);
        this.settingsData = { ...result };
      }
    });
  }

  applySettings(settings: Settings): void {
    const fontSize = settings.fontSize || 30;
    const fontType = settings.fontType || "Arial";
    const colorScheme = settings.colorScheme || "random";
    const singleColor =
      colorScheme === "single-color" ? settings.singleColor : "";

    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width =
      this.wordCloudContainer.nativeElement.offsetWidth -
      margin.left -
      margin.right;
    const height =
      this.wordCloudContainer.nativeElement.offsetHeight -
      margin.top -
      margin.bottom;

    this.wordCloud$
      .pipe(
        filter((wordCloud): wordCloud is WordCloud => !!wordCloud),
        take(1)
      )
      .subscribe((wordCloud) => {
        const layout = cloud()
          .size([width, height])
          .spiral("rectangular")
          .words((wordCloud.words ?? []).map((word) => ({ text: word })))
          .padding(20)
          .rotate(() => (Math.random() < 0.5 ? 0 : 90))
          .font(fontType)
          .fontSize(() => fontSize)
          .on("end", (words: { text: string; x: number; y: number }[]) =>
            this.draw(words, { fontSize, fontType, colorScheme, singleColor })
          );

        layout.start();
      });
  }

  closeAddDialog(): void {
    this.addDialogRef.close();
  }

  deleteWordCloud(): void {
    if (confirm("Are you sure you want to delete this word cloud?")) {
      this.wordCloud$
        .pipe(
          filter((wordCloud): wordCloud is WordCloud => !!wordCloud),
          take(1)
        )
        .subscribe((wordCloud) => {
          this.store.dispatch(deleteWordCloud({ id: wordCloud?.id as number }));
          this.router.navigate(["/word-clouds"]);
        });
    }
  }

  closeDetails(): void {
    this.router.navigate(["/word-clouds"]);
  }

  private draw = (words: Word[], settings: Settings): void => {
    if (!settings) {
      return;
    }
    const { fontSize, fontType, colorScheme, singleColor } = settings;
    const self = this;
    const dragHandler = d3
      .drag<SVGForeignObjectElement, Word>()
      .on("start", function (event, d) {
        d3.select(this).raise();
      })
      .on("drag", function (event, d: any) {
        d.x = event.x;
        d.y = event.y;
        d3.select(this).attr("x", d.x).attr("y", d.y);
      });

    const svg = d3
      .select(this.wordCloudContainer.nativeElement)
      .html("")
      .append("svg")
      .attr("width", this.wordCloudContainer.nativeElement.offsetWidth - 20)
      .attr("height", this.wordCloudContainer.nativeElement.offsetHeight - 20)
      .attr(
        "viewBox",
        `0 0 ${this.wordCloudContainer.nativeElement.offsetWidth} ${this.wordCloudContainer.nativeElement.offsetHeight}`
      )
      .attr("preserveAspectRatio", "xMidYMid meet");

    svg
      .append("g")
      .attr("transform", "translate(1000,400)")
      .selectAll("foreignObject")
      .data(words)
      .enter()
      .append("foreignObject")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y)
      .attr("width", (d) => {
        const validFontSize = fontSize > 0 ? fontSize : 30;
        const wordLength = d.text?.length || 1;
        const width =
          wordLength > 2
            ? wordLength * validFontSize * 0.7 + 10
            : wordLength * validFontSize + 10;
        return width;
      })
      .attr("height", (d) => {
        const validFontSize = fontSize > 0 ? fontSize : 30;
        const defaultHeight = validFontSize * 1.2;
        return defaultHeight;
      })
      .call(dragHandler)
      .append("xhtml:div")
      .style("font-size", `${fontSize}px`)
      .style("font-family", fontType)
      .style("color", (d, i) => {
        return singleColor
          ? singleColor
          : self.getColor(i, words.length, colorScheme);
      })
      .on("mouseover", function (this: BaseType) {
        d3.select(this)
          .style("border", "1px solid black")
          .style("padding", "2px")
          .style("border-radius", "4px");

        d3.select(this).select(".delete-button").style("visibility", "visible");
      })
      .on("mouseout", function (this: BaseType) {
        d3.select(this).style("border", "none").style("padding", "0");

        d3.select(this).select(".delete-button").style("visibility", "hidden");
      })
      .each(function (this: BaseType, d: any, index: number) {
        const containerDiv = d3
          .select(this)
          .style("width", "100%")
          .style("height", "100%")
          .style("display", "flex")
          .style("justify-content", "flex-end");

        const firstDiv = containerDiv
          .append("div")
          .style("width", "100%")
          .style("height", "100%");

        firstDiv
          .append("input")
          .attr("type", "text")
          .attr("value", d.text)
          .style("width", "100%")
          .style("border", "none")
          .style("background", "transparent")
          .style("text-align", "center")
          .on("click", (event) => {
            self.selectWord(d);
          })
          .on("blur", (event) => self.applyTextChange(d, event.target))
          .on("keydown", (event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              self.applyTextChange(d, event.target);
            }
          });

        const secondDiv = containerDiv.append("div");

        secondDiv
          .append("button")
          .attr("class", "delete-button")
          .attr("title", "Delete Word")
          .style("background", "transparent")
          .style("border", "none")
          .style("cursor", "pointer")
          .style("color", "red")
          .style("width", "50%")
          .style("height", "50%")
          .style("visibility", "hidden")
          .style("display", "flex")
          .append("span")
          .attr("class", "material-icons")
          .text("delete")
          .on("click", () => self.deleteWord(d.text));
      });
  };

  private deleteWord(wordToDelete: string): void {
    this.wordCloud$
      .pipe(
        filter((wordCloud): wordCloud is WordCloud => !!wordCloud),
        take(1)
      )
      .subscribe((wordCloud) => {
        const updatedWords = (wordCloud.words ?? []).filter(
          (word) => word !== wordToDelete
        );
        this.store.dispatch(
          updateWordCloud({
            wordCloud: {
              id: wordCloud.id,
              name: wordCloud.name,
              category: wordCloud.category,
              words: updatedWords,
            },
          })
        );
      });
  }

  private selectWord(word: Word): void {
    this.selectedWord = { text: word.text, x: word.x, y: word.y };
  }

  private applyTextChange(word: Word, textElement: HTMLInputElement): void {
    const newText = textElement.value?.trim();
    if (newText && newText !== word.text) {
      this.wordEditSubject.next({ oldText: word.text, newText });
      this.updateWord(word.text, newText);
      //  this.drawWordCloud();
    }
    this.selectedWord = null;
    const svg = d3.select(this.wordCloudContainer.nativeElement).select("svg");
    svg.selectAll(".editable-overlay").remove();
  }

  private updateWord(oldText: string, newText: string): void {
    this.wordCloud$
      .pipe(
        filter((wordCloud): wordCloud is WordCloud => !!wordCloud),
        take(1)
      )
      .subscribe((wordCloud) => {
        const updatedWords =
          wordCloud.words?.map((word) => (word === oldText ? newText : word)) ??
          [];

        this.store.dispatch(
          updateWordCloud({
            wordCloud: {
              id: wordCloud.id,
              name: wordCloud.name,
              category: wordCloud.category,
              words: updatedWords,
            },
          })
        );
      });
  }

  private getColor(index: number, length: number, scheme: string): string {
    console.log(`Applying color scheme: ${scheme}, index: ${index}`);
    switch (scheme) {
      case "random":
        return d3.schemeCategory10[index % 10];

      case "gradient":
        return d3.interpolateRainbow(index / length);

      case "monochrome":
        const grayScale = Math.floor(255 * (index / length));
        return `rgb(${grayScale}, ${grayScale}, ${grayScale})`;

      case "pastel":
        const pastelScale = Math.floor(255 * (index / length));
        return `rgb(${255 - pastelScale}, ${255}, ${pastelScale})`;

      case "vibrant":
        const vibrantColors = [
          "#FF5733",
          "#33FF57",
          "#3357FF",
          "#FF33A1",
          "#FF8C33",
          "#33FFF5",
        ];
        return vibrantColors[index % vibrantColors.length];

      case "dark":
        const darkScale = Math.floor(100 + (index / length) * 100);
        return `rgb(${darkScale}, ${darkScale}, ${darkScale})`;

      case "single-color":
        if (!this.settingsData || !this.settingsData.singleColor) {
          console.warn("singleColor is not defined in settingsData");
          return "black";
        }
        console.log(this.settingsData.singleColor);
        return this.settingsData.singleColor;

      default:
        return "black";
    }
  }

  setAsWallpaper(wordCloudContainer: HTMLDivElement): void {
    const svgElement = wordCloudContainer.querySelector("svg");
    if (!svgElement) {
      console.error("SVG element not found.");
      return;
    }

    const allElements = svgElement.querySelectorAll("*");
    allElements.forEach((el) => {
      const computedStyle = window.getComputedStyle(el);
      ["color", "fill", "stroke", "font-size", "font-family"].forEach(
        (prop) => {
          const value = computedStyle.getPropertyValue(prop);
          if (value) {
            el.setAttribute(
              "style",
              `${el.getAttribute("style") || ""}${prop}:${value};`
            );
          }
        }
      );
    });

    // Ensure SVG dimensions are set
    const svgRect = svgElement.getBoundingClientRect();
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const svgWidth = svgRect.width - margin.left - margin.right;
    const svgHeight = svgRect.height - margin.top - margin.bottom;

    svgElement.setAttribute("width", `${svgWidth}px`);
    svgElement.setAttribute("height", `${svgHeight}px`);
    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    // Serialize the SVG
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    // Convert SVG to Base64 and set as image source
    const svgBase64 =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();

    img.onload = () => {
      canvas.width = svgWidth;
      canvas.height = svgHeight;
      ctx.drawImage(img, 0, 0);
      const base64Image = canvas.toDataURL("image/png");
      this.wordCloudService.setWallpaperFromWordCloud(base64Image);
    };

    img.onerror = (error) => {
      console.error("Error loading image:", error);
    };

    img.src = svgBase64;
  }
}
