import {
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
  BehaviorSubject,
  filter,
  Observable,
  shareReplay,
  Subject,
  take,
  takeUntil,
} from "rxjs";
import { selectWordCloudById } from "../state/word-cloud.selectors";
import { AsyncPipe } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { WordCloudService } from "../word-cloud.service";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import {
  Settings,
  WordCloudSettingsDialogComponent,
} from "../word-cloud-settings-dialog/word-cloud-settings-dialog.component";
import { WordAddingDialogComponent } from "../word-adding-dialog/word-adding-dialog.component";
import { WordCloudRendererComponent } from "./word-cloud-renderer/word-cloud-renderer.component";

interface Word {
  text: string;
  x: number;
  y: number;
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
    WordCloudRendererComponent,
  ],
  templateUrl: "./word-cloud-detail.component.html",
  styleUrls: ["./word-cloud-detail.component.css"],
})
export class WordCloudDetailComponent implements OnInit {
  @ViewChild("wordCloudParentContainer", { static: false })
  wordCloudContainer!: ElementRef;
  private settingsSubject = new BehaviorSubject<Settings>({
    fontSize: 18,
    fontType: "Arial",
    colorScheme: "single-color",
    singleColor: "#0d0d0d",
  });
  private wordCloud!: WordCloud;
  private destroy$ = new Subject<void>();
  words: Word[] = [];
  addDialogRef!: MatDialogRef<any>;
  settingsDialogRef!: MatDialogRef<any>;
  wordCloud$!: Observable<WordCloud>;
  settings!: Settings;

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
      this.wordCloud$ = this.store.select(selectWordCloudById(id)).pipe(
        filter((wordCloud): wordCloud is WordCloud => !!wordCloud),
        shareReplay(1)
      );
    }

    this.wordCloud$.pipe(takeUntil(this.destroy$)).subscribe((wordCloud) => {
      this.wordCloud = wordCloud;
      this.words = this.wordCloud.words?.map<Word>((word) => ({
        text: word,
        x: 0,
        y: 0,
      })) as Word[];

      this.settingsSubject
        .pipe(takeUntil(this.destroy$))
        .subscribe((settings) => {
          this.settings = settings;
        });
    });
  }

  openWordAddingDialog(): void {
    const id = this.route.snapshot.paramMap.get("id")!;
    this.addDialogRef = this.dialog.open(WordAddingDialogComponent, {
      disableClose: true,
      data: { id },
    });
  }
  closeWordAddingDialog(): void {
    this.addDialogRef.close();
  }

  openSettingsDialog(): void {
    const dialogRef = this.dialog.open(WordCloudSettingsDialogComponent, {
      data: this.settingsSubject.value,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.settingsSubject.next({ ...result });
      }
    });
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

  deleteWord(wordToDelete: string): void {
    const updatedWords = (this.wordCloud.words ?? []).filter(
      (word) => word !== wordToDelete
    );

    this.store.dispatch(
      updateWordCloud({
        wordCloud: {
          id: this.wordCloud.id,
          name: this.wordCloud.name,
          category: this.wordCloud.category,
          words: updatedWords,
        },
      })
    );
  }

  updateWord(oldText: string, newText: string): void {
    const updatedWords =
      this.wordCloud.words?.map((word) =>
        word === oldText ? newText : word
      ) ?? [];

    this.store.dispatch(
      updateWordCloud({
        wordCloud: {
          id: this.wordCloud.id,
          name: this.wordCloud.name,
          category: this.wordCloud.category,
          words: updatedWords,
        },
      })
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

    const svgRect = svgElement.getBoundingClientRect();
    const svgWidth = svgElement.scrollWidth || svgRect.width;
    const svgHeight = svgElement.scrollHeight || svgRect.height;
    const viewBox =
      svgElement.getAttribute("viewBox") || `0 0 ${svgWidth} ${svgHeight}`;
    svgElement.setAttribute("viewBox", viewBox);
    svgElement.setAttribute("width", `${svgWidth}px`);
    svgElement.setAttribute("height", `${svgHeight}px`);
    svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBase64 =
      "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    canvas.width = svgWidth;
    canvas.height = svgHeight;

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
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
