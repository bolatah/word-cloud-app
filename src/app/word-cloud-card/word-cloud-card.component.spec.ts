import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordCloudCardComponent } from './word-cloud-card.component';

describe('WordCloudCardComponent', () => {
  let component: WordCloudCardComponent;
  let fixture: ComponentFixture<WordCloudCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordCloudCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordCloudCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
