import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutsList } from './workouts-page';

describe('WorkoutsList', () => {
  let component: WorkoutsList;
  let fixture: ComponentFixture<WorkoutsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutsList],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutsList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
