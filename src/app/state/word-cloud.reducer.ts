// word-cloud.reducer.ts
import { createReducer, on } from "@ngrx/store";
import * as WordCloudActions from "./word-cloud.actions";
import { WordCloud } from "../word-cloud.model";

export interface WordCloudState {
  wordClouds: { [id: string]: WordCloud };
  error: string | null;
  loading: boolean;
}

export const initialState: WordCloudState = {
  wordClouds: {},
  error: null,
  loading: false,
};

export const wordCloudReducer = createReducer(
  initialState,
  on(WordCloudActions.loadWordClouds, (state) => ({
    ...state,
    loading: true,
  })),
  on(WordCloudActions.loadWordCloudsSuccess, (state, { wordClouds }) => ({
    ...state,
    wordClouds: wordClouds.reduce(
      (acc, wc) => ({ ...acc, [wc.id]: wc }),
      {} 
    ),
    loading: false,
  })),
  on(WordCloudActions.loadWordCloudsFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  })),
  on(WordCloudActions.addWordCloudSuccess, (state, { wordCloud }) => ({
    ...state,
    wordClouds: {
      ...state.wordClouds,
      [wordCloud.id] : wordCloud,
    },
  })),
  on(WordCloudActions.updateWordCloudSuccess, (state, { wordCloud }) => ({
    ...state,
    wordClouds: {
      ...state.wordClouds,
      [wordCloud.id ]: { ...state.wordClouds[wordCloud.id], ...wordCloud },
    },
  })),
  on(WordCloudActions.deleteWordCloudSuccess, (state, { id }) => {
    const { [id]: deleted, ...remainingWordClouds } = state.wordClouds;
    return {
      ...state,
      wordClouds: remainingWordClouds,
    };
  }),
  on(WordCloudActions.loadWordCloudByIdSuccess, (state, { wordCloud }) => ({
    ...state,
    wordClouds: {
      ...state.wordClouds,
      [wordCloud.id]: wordCloud,
    },
  })),

  on(
    WordCloudActions.addWordCloudFailure,
    WordCloudActions.updateWordCloudFailure,
    WordCloudActions.deleteWordCloudFailure,
    (state, { error }) => ({
      ...state,
      error,
    })
  )
);
