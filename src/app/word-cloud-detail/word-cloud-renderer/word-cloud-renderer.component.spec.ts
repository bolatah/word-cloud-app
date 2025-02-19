import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordCloudRendererComponent } from './word-cloud-renderer.component';

describe('WordCloudRendererComponent', () => {
  let component: WordCloudRendererComponent;
  let fixture: ComponentFixture<WordCloudRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordCloudRendererComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordCloudRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
