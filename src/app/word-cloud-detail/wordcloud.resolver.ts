import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { WordCloud } from '../word-cloud.model';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectWordCloudById } from '../state/word-cloud.selectors';
import { catchError, filter, map, of, switchMap, take, tap } from 'rxjs';
import { Router } from '@angular/router';
import { loadWordCloudById } from '../state/word-cloud.actions';

export const wordcloudResolver: ResolveFn<WordCloud> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {

  const id = route.paramMap.get('id')!;
  const store = inject(Store);
  return store.select(selectWordCloudById(id)).pipe(
    switchMap((wordCloud) => {
      console.log(wordCloud)
      if (!wordCloud) {
        store.dispatch(loadWordCloudById({ id: parseInt(id) }));
        return store.select(selectWordCloudById(id)).pipe(
          filter((loadedCloud) => !!loadedCloud), 
          take(1)
        );
      }
      return of(wordCloud); 
    })
  );
};
