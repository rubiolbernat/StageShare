import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Loads } from './loads';

describe('Loads', () => {
  let component: Loads;
  let fixture: ComponentFixture<Loads>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Loads]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Loads);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
