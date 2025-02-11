import { Component, inject, OnInit } from "@angular/core";
import {
  MatDialog,
  MatDialogModule,
  MatDialogRef,
} from "@angular/material/dialog";
import { MatButtonModule } from "@angular/material/button";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { MatIconModule } from "@angular/material/icon";
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { Store, select } from "@ngrx/store";
import { debounceTime, map, Observable, of, take } from "rxjs";
import { addWordCloud, loadWordCloudById } from "../state/word-cloud.actions";
import { selectAllWordClouds } from "../state/word-cloud.selectors";

@Component({
  selector: "app-word-cloud-dialog",
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: "./word-cloud-dialog.component.html",
  styleUrls: ["./word-cloud-dialog.component.css"],
})
export class WordCloudDialogComponent implements OnInit {
  readonly dialog = inject(MatDialog);
  wordCloudForm!: FormGroup<{
    name: FormControl<string | null>;
    category: FormControl<string | null>;
    words?: FormControl<string>;
  }>;
  // existingWordClouds$!: Observable<any[]>;

  constructor(
    private dialogRef: MatDialogRef<WordCloudDialogComponent>,
    private formBuilder: FormBuilder,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.wordCloudForm = this.formBuilder.group({
      name: ["", [Validators.required], [this.duplicateValidator("name")]],
      category: [
        "",
        [Validators.required],
        [this.duplicateValidator("category")],
      ],
    });
  }

  private duplicateValidator(field: "name" | "category"): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value || control.value.trim() === "") {
        return of(null);
      }

      return this.store.pipe(
        select(selectAllWordClouds),
        debounceTime(300),
        take(1),
        map((wordClouds) => {
          const isDuplicate = wordClouds.some(
            (cloud) => cloud[field] === control.value.trim()
          );
          return isDuplicate ? { duplicate: true } : null;
        })
      );
    };
  }

  onSubmit(): void {
    if (this.wordCloudForm.valid) {
      const { name, category } = this.wordCloudForm.value  ;
      if (!name || !category) {
        return;
      }
      const words = this.wordCloudForm.value.words ;
      const wordsArray = words ? words.split(",").map((word: string) => word.trim()) : [];
      const wordCloud = {
        name,
        category,
        words: wordsArray,
      };
      try {
        this.store.dispatch(
          addWordCloud({wordCloud })
        );
        this.dialogRef.close(true);
      } catch (error) {
        console.error("Failed to add cloud:", error);
      }
    }
  }
}
