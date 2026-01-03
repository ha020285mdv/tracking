import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveWorkout } from './session-page';

describe('ActiveWorkout', () => {
  let component: ActiveWorkout;
  let fixture: ComponentFixture<ActiveWorkout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveWorkout],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveWorkout);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
