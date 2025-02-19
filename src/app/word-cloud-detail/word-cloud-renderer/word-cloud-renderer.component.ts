import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from "@angular/core";
import { Settings } from "../../word-cloud-settings-dialog/word-cloud-settings-dialog.component";
import * as d3 from "d3";
import cloud from "d3-cloud";
import { Subject } from "rxjs";

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
  selector: "app-word-cloud-renderer",
  standalone: true,
  imports: [],
  templateUrl: "./word-cloud-renderer.component.html",
  styleUrl: "./word-cloud-renderer.component.css",
})
export class WordCloudRendererComponent implements OnChanges {
  @ViewChild("wordCloudContainer", { static: true })
  wordCloudContainer!: ElementRef;
  @Input() words: Word[] = [];
  @Input() settings!: Settings;
  @Output() wordUpdated = new EventEmitter<{
    oldText: string;
    newText: string;
  }>();
  @Output() wordDeleted = new EventEmitter<string>();
  private resizeObserver!: ResizeObserver;
  selectedWord: { text: string; x: number; y: number } | null = null;
  private wordEditSubject = new Subject<WordEdit>();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["words"] || changes["settings"]) {
      console.log(changes);
      this.renderWordCloud();
    }
  }
  ngAfterViewInit(): void {
    this.resizeObserver = new ResizeObserver(() => {
      this.renderWordCloud();
    });

    this.resizeObserver.observe(this.wordCloudContainer.nativeElement);
  }
  private renderWordCloud = (): void => {
    const container = this.wordCloudContainer.nativeElement;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const svgWidth = container.clientWidth - margin.left - margin.right || 800;
    const svgHeight =
      container.clientHeight - margin.top - margin.bottom || 600;
    if (!this.settings || !this.words) {
      return;
    }
    const { fontSize, fontType, colorScheme, singleColor } = this.settings;
    let layout = cloud()
      .size([svgWidth, svgHeight])
      .spiral("archimedean")
      .words(this.words.map((word) => ({ text: word.text })))
      .padding(5)
      .rotate(() => 0)
      .font(fontType)
      .fontSize(fontSize);
    layout.start();

    const self = this;

    const dragHandler = d3
      .drag<SVGForeignObjectElement, Word>()
      .on("start", function () {
        d3.select(this).raise();
      })
      .on("drag", function (event, d: Word) {
        d.x = Math.max(
          0,
          Math.min(
            event.x,
            svgWidth -
              WordCloudRendererComponent.calculateWordDimensions(
                d,
                fontSize,
              ).width
          )
        );
        d.y = Math.max(
          0,
          Math.min(
            event.y,
            svgHeight -
              WordCloudRendererComponent.calculateWordDimensions(
                d,
                fontSize,
              ).height
          )
        );
        d3.select(this).attr("x", d.x).attr("y", d.y);
      });

    const svg = d3
      .select(container)
      .html("")
      .append("svg")
      .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
      .style("overflow", "hidden");

    this.words.forEach((word) => {
      const { x, y } = WordCloudRendererComponent.generateUniqueCoordinates(
        this.words,
        svgWidth,
        svgHeight,
        30
      );
      word.x = x as number;
      word.y = y as number;
    });

    svg
      .append("g")
      .attr("tabIndex", "0")
      .selectAll("foreignObject")
      .data(this.words)
      .enter()
      .append("foreignObject")
      .style("font-family", fontType)
      .style("font-size", fontSize)
      .attr("text-anchor", "middle")
      .attr("x", (d) =>
        Math.max(
          0,
          Math.min(
            d.x,
            svgWidth -
              WordCloudRendererComponent.calculateWordDimensions(
                d,
                fontSize,
              ).width
          )
        )
      )
      .attr("y", (d) =>
        Math.max(
          0,
          Math.min(
            d.y,
            svgHeight -
              WordCloudRendererComponent.calculateWordDimensions(
                d,
                fontSize,
              ).height
          )
        )
      )
      .attr(
        "width",
        (d) =>
          WordCloudRendererComponent.calculateWordDimensions(
            d,
            fontSize,
          ).width
      )
      .attr(
        "height",
        (d) =>
          WordCloudRendererComponent.calculateWordDimensions(
            d,
            fontSize,
          ).height
      )
      .call(dragHandler)
      .append("xhtml:div")
      .style("color", (d, i) =>
        singleColor
          ? singleColor
          : WordCloudRendererComponent.getColor(
              i,
              this.words.length,
              colorScheme
            )
      )
      .on("mouseover", function () {
        d3.select(this)
          .style("border", "1px solid black")
          .style("border-radius", "4px");
        d3.select(this).select(".delete-button").style("visibility", "visible");
      })
      .on("mouseout", function () {
        d3.select(this).style("border", "none").style("padding", "0");
        d3.select(this).select(".delete-button").style("visibility", "hidden");
      })
      .each(function (d) {
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
          .on("click", (event) => self.selectWord(d))
          .on("blur", (event) => self.changeWord(d, event.target))
          .on("keydown", (event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              self.changeWord(d, event.target);
              event.target.blur();
            }
          });

        const secondDiv = containerDiv
          .append("div")
          .style("position", "relative");

        const deleteButton = secondDiv
          .append("button")
          .attr("class", "delete-button")
          .attr("title", "Delete Word")
          .attr("role", "button")
          .style("background", "transparent")
          .style("border", "none")
          .style("cursor", "pointer")
          .style("color", "red")
          .style("visibility", "hidden")
          .style("display", "flex")
          .style("align-items", "center")
          .style("justify-content", "center")
          .style("position", "absolute")
          .style("top", 0)
          .style("right", 0)
          .style("margin", "2px")
          .style("font-size", "10px")
          .style("padding", "0")
          .style("line-height", "1")
          .append("span")
          .text("❌")
          .on("click", (event: MouseEvent) => {
            event.stopPropagation();
            self.deleteWord(d.text);
          });
      });
  };

  deleteWord(wordToDelete: string): void {
    const updatedWords = (this.words ?? []).filter(
      (word) => word.text !== wordToDelete
    );
    const svg = d3.select(this.wordCloudContainer.nativeElement).select("svg");
    svg.selectAll("foreignObject").data(updatedWords).exit().remove();
    this.wordDeleted.emit(wordToDelete);
  }

  selectWord(word: Word): void {
    this.selectedWord = { text: word.text, x: word.x, y: word.y };
  }

  changeWord(word: Word, textElement: HTMLInputElement): void {
    const newText = textElement.value?.trim();
    if (newText && newText !== word.text) {
      this.wordEditSubject.next({ oldText: word.text, newText });
      this.wordUpdated.emit({ oldText: word.text, newText });
    }
    this.selectedWord = null;
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private static calculateWordDimensions(
    word: Word,
    fontSize: number
  ): { width: number; height: number } {
    const validFontSize = fontSize > 0 ? fontSize : 30;
    const wordLength = word.text?.length || 1;
    return {
      width: Math.min(
        wordLength > 2
          ? wordLength * validFontSize * 0.7 + 20
          : wordLength * validFontSize + 20
      ),
      height: validFontSize * 1.5,
    };
  }

  private static generateUniqueCoordinates(
    words: Word[],
    width: number,
    height: number,
    minDistance: number
  ): { x: number; y: number } {
    let x = 0,
      y = 0,
      collisionDetected = true;

    while (collisionDetected) {
      x = Math.random() * width;
      y = Math.random() * height;
      collisionDetected = words.some((word) => {
        const dx = x - word.x;
        const dy = y - word.y;
        return Math.sqrt(dx * dx + dy * dy) < minDistance;
      });
    }

    return { x, y };
  }

  private static getColor(
    index: number,
    length: number,
    scheme: string
  ): string {
    switch (scheme) {
      case "random":
        return d3.schemeCategory10[index % 10];
      case "gradient":
        return d3.interpolateRainbow(index / length);
      case "monochrome":
        return `rgb(${Math.floor(255 * (index / length))}, ${Math.floor(
          255 * (index / length)
        )}, ${Math.floor(255 * (index / length))})`;
      case "pastel":
        return `rgb(${
          255 - Math.floor(255 * (index / length))
        }, 255, ${Math.floor(255 * (index / length))})`;
      case "vibrant":
        return [
          "#FF5733",
          "#33FF57",
          "#3357FF",
          "#FF33A1",
          "#FF8C33",
          "#33FFF5",
        ][index % 6];
      case "dark":
        return `rgb(${100 + Math.floor((index / length) * 100)}, ${
          100 + Math.floor((index / length) * 100)
        }, ${100 + Math.floor((index / length) * 100)})`;
      default:
        return "black";
    }
  }
}
