import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordCloudDialogComponent } from './word-cloud-dialog.component';

describe('WordCloudDialogComponent', () => {
  let component: WordCloudDialogComponent;
  let fixture: ComponentFixture<WordCloudDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordCloudDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordCloudDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
