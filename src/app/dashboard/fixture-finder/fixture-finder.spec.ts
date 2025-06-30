import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixtureFinder } from './fixture-finder';

describe('FixtureFinder', () => {
  let component: FixtureFinder;
  let fixture: ComponentFixture<FixtureFinder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixtureFinder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FixtureFinder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
