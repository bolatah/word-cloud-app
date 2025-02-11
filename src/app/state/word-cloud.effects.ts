import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import * as WordCloudActions from "./word-cloud.actions";
import { catchError, map, mergeMap, Observable, of, tap } from "rxjs";
import { WordCloudService } from "../word-cloud.service";
import { WordCloud } from "../word-cloud.model";
import { Action } from "@ngrx/store";

export abstract class Wrapper {
  constructor(protected readonly actions$: Actions) {}
}

@Injectable({
  providedIn: "root",
})
export class WordCloudEffects extends Wrapper {
  constructor(actions$: Actions, private wordCloudService: WordCloudService) {
    super(actions$);
  }
  logActions$ = createEffect(
    () =>
      this.actions$.pipe(
        tap((action: Action) => {
          console.log("Dispatched action: ", action);
        })
      ),
    { dispatch: false }
  );

  loadWordClouds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WordCloudActions.loadWordClouds),
      mergeMap(() =>
        this.wordCloudService.fetchWordClouds().pipe(
          map((wordClouds) =>
            WordCloudActions.loadWordCloudsSuccess({ wordClouds })
          ),
          catchError((error) =>
            of(WordCloudActions.loadWordCloudsFailure({ error }))
          )
        )
      )
    )
  );
  addWordCloud$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WordCloudActions.addWordCloud),
      mergeMap(({ wordCloud }) =>
        this.wordCloudService.addCloud(wordCloud).pipe(
          map((createdWordCloud) => 
            WordCloudActions.addWordCloudSuccess({
              wordCloud: createdWordCloud,
            }),
          ),
          catchError((error) =>
            of(WordCloudActions.addWordCloudFailure({ error }))
          )
        )
      )
    )
  );
  updateWordCloud$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WordCloudActions.updateWordCloud),
      mergeMap(({ wordCloud }) => {
        return this.wordCloudService.updateCloud(wordCloud).pipe(
        //  tap(() => console.log(wordCloud)),
          map(() =>
            WordCloudActions.updateWordCloudSuccess({ wordCloud: wordCloud })
          ),
          catchError((error) =>
            of(WordCloudActions.updateWordCloudFailure({ error }))
          )
        );
      })
    )
  );
  deleteWordCloud$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WordCloudActions.deleteWordCloud),
      mergeMap(({ id }) =>
        this.wordCloudService.deleteCloud(id).pipe(
          map(() => WordCloudActions.deleteWordCloudSuccess({ id })),
          catchError((error) =>
            of(WordCloudActions.deleteWordCloudFailure({ error }))
          )
        )
      )
    )
  );
  loadWordCloudById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(WordCloudActions.loadWordCloudById),
      mergeMap(({ id }) =>
        this.wordCloudService.getWordCloudById(id).pipe(
          map((wordCloud) =>
            WordCloudActions.loadWordCloudByIdSuccess({ wordCloud })
          ),
          catchError((error) =>
            of(WordCloudActions.loadWordCloudByIdFailure({ error }))
          )
        )
      )
    )
  );
}
