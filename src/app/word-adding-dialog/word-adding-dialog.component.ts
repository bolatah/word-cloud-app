import {
  AfterViewChecked,
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from "@angular/core";
import {
  AbstractControl,
  FormControl,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { WordCloud } from "../word-cloud.model";
import { Store } from "@ngrx/store";
import { updateWordCloud } from "../state/word-cloud.actions";
import { ReactiveFormsModule } from "@angular/forms";
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  switchMap,
  take,
  timer,
} from "rxjs";
import { selectWordCloudById } from "../state/word-cloud.selectors";
import { AsyncPipe } from "@angular/common";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: "app-word-adding-dialog",
  standalone: true,
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
  ],
  templateUrl: "./word-adding-dialog.component.html",
  styleUrl: "./word-adding-dialog.component.css",
})
export class WordAddingDialogComponent implements OnInit, AfterViewInit {
  private _duplicateWordError$ = new BehaviorSubject<boolean>(false);
  private _duplicateTextError$ = new BehaviorSubject<boolean>(false);
  wordCloud$!: Observable<WordCloud>;
  wordSource = [
    {
      title: "Word",
      value: "word",
    },
    {
      title: "Text",
      value: "text",
    },
  ];
  newWordControl: FormControl;
  wordSourceControl: FormControl;
  newTextControl: FormControl;
  duplicateWordError$ = this._duplicateWordError$.asObservable();
  duplicateTextError$ = this._duplicateTextError$.asObservable();

  constructor(
    private store: Store,
    private cdr: ChangeDetectorRef,
    public readonly dialogRef: MatDialogRef<WordAddingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { id: string }
  ) {
    this.wordSourceControl = new FormControl(this.wordSource[0].value);
    this.newWordControl = new FormControl(
      "",
      [Validators.minLength(2)],
      [this.delayedRequiredValidator]
    );
    this.newTextControl = new FormControl(
      "",
      [Validators.minLength(5)],
      [this.delayedRequiredValidator]
    );
  }

  ngOnInit(): void {
    const id = this.data.id;
    this.wordCloud$ = this.store.select(selectWordCloudById(id));

    this.newWordControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((newWord : string) =>
          this.wordCloud$.pipe(
            map((wordCloud) => wordCloud.words?.includes(newWord?.trim() ?? ""))
          )
        )
      )
      .subscribe((isDuplicate ) =>
        this._duplicateWordError$.next(isDuplicate as boolean)
      );

    this.newTextControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((newText : string) =>
          this.wordCloud$.pipe(
            map((wordCloud) => {
              const newWordsArray = (newText?.split(" ") ?? []).map(
                (word) => word.trim()
              );
              return newWordsArray.some((word) =>
                (wordCloud.words ?? []).includes(word)
              );
            })
          )
        )
      )
      .subscribe((isDuplicate: boolean) => this._duplicateTextError$.next(isDuplicate));
  }

  ngAfterViewInit(): void {
    this.wordSourceControl.valueChanges.subscribe(() => {
      this.cdr.detectChanges();
    });
  }
  closeAddDialog() {
    this.dialogRef.close();
  }

  addWord(): void {
    if (this.newWordControl.valid && !this._duplicateWordError$.getValue()) {
      this.wordCloud$
        .pipe(
          filter((wordCloud) => !!wordCloud),
          take(1),
        )
        .subscribe((wordCloud) => {
          let newWord = this.newWordControl.value?.trim();
        newWord = newWord.replace(/[^\w\s]/g, "");
          const updatedWords = [
            ...(wordCloud.words ?? []),
            newWord,
          ] as string[];

          this.store.dispatch(
            updateWordCloud({
              wordCloud: {
                id: wordCloud.id,
                name: wordCloud.name || "",
                category: wordCloud.category || "",
                words: updatedWords,
              },
            })
          );
          this.newWordControl.reset();
          this.dialogRef.close();
        });
    }
  }

  addText(): void {
    if (this.newTextControl.valid && !this._duplicateTextError$.getValue()) {
      this.wordCloud$.pipe(take(1)).subscribe((wordCloud) => {
        let newText = this.newTextControl.value?.trim() as string;
  
        // Remove punctuation and split words
        const newWordsArray = newText
          .replace(/[^\w\s]/g, "") // Remove punctuation
          .split(" ")
          .map((word) => word.trim())
          .filter((word) => word.length > 0); // Remove empty words
  
        if (newWordsArray.length > 0) {
          const updatedWords = [...(wordCloud.words ?? []), ...newWordsArray];
  
          this.store.dispatch(
            updateWordCloud({
              wordCloud: {
                id: wordCloud.id,
                name: wordCloud.name || "",
                category: wordCloud.category || "",
                words: updatedWords,
              },
            })
          );
        }
        this.newTextControl.reset();
        this.dialogRef.close();
      });
    }
  }
  

  private delayedRequiredValidator(
    control: AbstractControl
  ): Observable<ValidationErrors | null> {
    return timer(1000).pipe(
      map(() => (control.value ? null : { required: true }))
    );
  }
}
