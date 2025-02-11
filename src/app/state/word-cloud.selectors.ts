import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WordCloudState } from './word-cloud.reducer';

export const selectWordCloudState =
  createFeatureSelector<WordCloudState>('wordClouds');

export const selectAllWordClouds = createSelector(
  selectWordCloudState,
  (state: WordCloudState) => Object.values(state.wordClouds)
);

export const selectLoading = createSelector(
  selectWordCloudState,
  (state: WordCloudState) => state.loading
);

export const selectError = createSelector(
  selectWordCloudState,
  (state: WordCloudState) => state.error
);

export const selectWordCloudById = (id: string) =>
  createSelector(selectWordCloudState, (state: WordCloudState) => 
    state.wordClouds[id]
  );
