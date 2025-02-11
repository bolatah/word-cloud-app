import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordCloudSettingsDialogComponent } from './word-cloud-settings-dialog.component';

describe('WordCloudSettingsDialogComponent', () => {
  let component: WordCloudSettingsDialogComponent;
  let fixture: ComponentFixture<WordCloudSettingsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordCloudSettingsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordCloudSettingsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
