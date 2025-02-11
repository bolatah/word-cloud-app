import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordCloudAddingDialogComponent } from './word-adding-dialog.component';

describe('WordCloudAddingDialogComponent', () => {
  let component: WordCloudAddingDialogComponent;
  let fixture: ComponentFixture<WordCloudAddingDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordCloudAddingDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordCloudAddingDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
