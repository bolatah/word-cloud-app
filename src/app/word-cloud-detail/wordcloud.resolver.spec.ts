import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { wordcloudResolver } from './wordcloud.resolver';

describe('wordcloudResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => wordcloudResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
