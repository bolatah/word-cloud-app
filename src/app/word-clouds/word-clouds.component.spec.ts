import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WordCloudsComponent } from './word-clouds.component';

describe('WordCloudsComponent', () => {
  let component: WordCloudsComponent;
  let fixture: ComponentFixture<WordCloudsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WordCloudsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WordCloudsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
