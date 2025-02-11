// word-cloud.actions.ts
import { createAction, props } from "@ngrx/store";
import { WordCloud, WordCloudAdding } from "../word-cloud.model";

export const loadWordClouds = createAction("[WordCloud] Load Word Clouds");

export const loadWordCloudsSuccess = createAction(
  "[WordCloud] Load Word Clouds Success",
  props<{ wordClouds: WordCloud[] }>()
);

export const loadWordCloudsFailure = createAction(
  "[WordCloud] Load Word Clouds Failure",
  props<{ error: any }>()
);

// Action to load a specific word cloud by ID
export const loadWordCloudById = createAction(
  "[WordCloud] Load Word Cloud by ID",
  props<{ id: number }>()
);

export const loadWordCloudByIdSuccess = createAction(
  "[WordCloud] Load Word Cloud by ID Success",
  props<{ wordCloud: WordCloud }>()
);

export const loadWordCloudByIdFailure = createAction(
  "[WordCloud] Load Word Cloud by ID Failure",
  props<{ error: any }>()
);

export const addWordCloud = createAction(
  "[WordCloud] Add Word Cloud",
  props<{ wordCloud: WordCloudAdding }>()
);

export const addWordCloudSuccess = createAction(
  "[WordCloud] Add Word Cloud Success",
  props<{ wordCloud: WordCloud}>()
);

export const addWordCloudFailure = createAction(
  "[WordCloud] Add Word Cloud Failure",
  props<{ error: any }>()
);

export const updateWordCloud = createAction(
  "[WordCloud] Update Word Cloud",
  props<{ wordCloud: WordCloud }>()
);

export const updateWordCloudSuccess = createAction(
  "[WordCloud] Update Word Cloud Success",
  props<{ wordCloud: WordCloud }>()
);

export const updateWordCloudFailure = createAction(
  "[WordCloud] Update Word Cloud Failure",
  props<{ error: any }>()
);

export const deleteWordCloud = createAction(
  "[WordCloud] Delete Word Cloud",
  props<{ id: number }>()
);

export const deleteWordCloudSuccess = createAction(
  "[WordCloud] Delete Word Cloud Success",
  props<{ id: number }>()
);

export const deleteWordCloudFailure = createAction(
  "[WordCloud] Delete Word Cloud Failure",
  props<{ error: any }>()
);
