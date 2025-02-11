import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordCloudDetailComponent } from './word-cloud-detail.component';

describe('WordCloudDetailComponent', () => {
  let component: WordCloudDetailComponent;
  let fixture: ComponentFixture<WordCloudDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordCloudDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordCloudDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
