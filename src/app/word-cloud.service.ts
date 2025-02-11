import { Injectable } from "@angular/core";
import { catchError, from, map, Observable, tap, throwError } from "rxjs";
import { WordCloud, WordCloudAdding } from "./word-cloud.model";
import { DatabaseRow } from "../global";
import { ofType } from "@ngrx/effects";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class WordCloudService {
  constructor(private router: Router) {
    this.initializeDatabase();
  }

  initializeDatabase(): Observable<void> {
    if (!window.electron || !window.electron.getDbPath) {
      console.error("Electron API is not available");
      return throwError(() => new Error("Electron API is not available"));
    }
    return from(window.electron.initializeDatabase()).pipe(
      catchError((error) => {
        console.error("Error initializing database:", error);
        return throwError(() => new Error(error));
      })
    );
  }

  fetchWordClouds(): Observable<WordCloud[]> {
    return from(window.electron.getClouds()).pipe(
      map((rows) => rows.map((row) => this.mapRowToWordCloud(row))),
      catchError((error) => {
        console.error("Error fetching word clouds:", error);
        return throwError(() => new Error(error));
      })
    );
  }

  addCloud(wordCloud: WordCloudAdding): Observable<WordCloud> {
    const { name, category, words } = wordCloud;
    return from(window.electron.addCloud({ name, category, words })).pipe(
      map((response) => {
        this.router.navigate([`/word-clouds/${response.id}`]);
        return {
          id: response.id,
          name: wordCloud.name,
          category: wordCloud.category,
          words: wordCloud.words,
        };
      }),
      catchError((error) => {
        console.error("Error saving cloud:", error);
        return throwError(() => new Error(error));
      })
    );
  }

  updateCloud(wordCloud: WordCloud): Observable<WordCloud> {
    return from(window.electron.updateCloud(wordCloud)).pipe(
      catchError((error) => {
        console.error("Error updating cloud:", error);
        return throwError(() => new Error(error));
      })
    );
  }

  deleteCloud(id: number): Observable<void> {
    return from(window.electron.deleteCloud(id)).pipe(
      catchError((error) => {
        console.error("Error deleting cloud:", error);
        return throwError(() => new Error(error));
      })
    );
  }

  getWordCloudById(id: number): Observable<WordCloud> {
    return from(window.electron.getCloud(id)).pipe(
      catchError((error) => {
        console.error("Error getting cloud:", error);
        return throwError(() => new Error(error));
      })
    );
  }

  setWallpaperFromWordCloud(base64Image: string): void {
    if (!window.electron || !window.electron.setWallpaper) {
      console.error("Electron API is not available");
      return;
    }
    try {
      window.electron.setWallpaper(base64Image);
    } catch (error) {
      console.error("Error setting wallpaper:", error);
    }
  }

  private mapRowToWordCloud(row: DatabaseRow): WordCloud {
    return {
      id: row.id,
      name: row.name,
      category: row.category,
      words: this.parseWords(row.words),
    };
  }

  private parseWords(wordsString: string): string[] {
    try {
      const parsedWords = JSON.parse(wordsString);
      return Array.isArray(parsedWords) ? parsedWords : [];
    } catch (error) {
      console.error("Error parsing words:", error);
      return [];
    }
  }
}
