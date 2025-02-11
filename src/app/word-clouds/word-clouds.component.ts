import { Component, OnInit } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatCardModule } from "@angular/material/card";
import { WordCloud } from "../word-cloud.model";
import { WordCloudCardComponent } from "../word-cloud-card/word-cloud-card.component";
import { MatDialog } from "@angular/material/dialog";
import { WordCloudDialogComponent } from "../word-cloud-dialog/word-cloud-dialog.component";
import { AsyncPipe, CommonModule } from "@angular/common";
import { Observable, Subject } from "rxjs";
import { Store } from "@ngrx/store";
import {
  selectAllWordClouds,
  selectLoading,
} from "../state/word-cloud.selectors";
import { loadWordCloudById, loadWordClouds } from "../state/word-cloud.actions";
import { AppState } from "../state/app.state";
import { MatIconModule } from "@angular/material/icon";

@Component({
  selector: "app-word-clouds",
  standalone: true,
  imports: [
    MatCardModule,
    MatIconModule,
    WordCloudCardComponent,
    MatButtonModule,
    AsyncPipe,
    CommonModule,
  ],
  templateUrl: "./word-clouds.component.html",
  styleUrl: "./word-clouds.component.css",
})
export class WordCloudsComponent implements OnInit {
  wordClouds$: Observable<WordCloud[]>;
  loading$: Observable<boolean>;
  selectedWordCloud: WordCloud | null = null;
  constructor(private dialog: MatDialog, private store: Store<AppState>) {
    this.wordClouds$ = this.store.select(selectAllWordClouds);
    this.loading$ = this.store.select(selectLoading);
  }

  ngOnInit(): void {
    this.store.dispatch(loadWordClouds());
  }

  openAddWordCloudDialog(): void {
    const dialogRef = this.dialog.open(WordCloudDialogComponent, {
      disableClose: true,
    });
  }

 
}
