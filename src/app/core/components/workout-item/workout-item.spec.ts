import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkoutsListItem } from './workout-item';

describe('WorkoutsListItem', () => {
  let component: WorkoutsListItem;
  let fixture: ComponentFixture<WorkoutsListItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkoutsListItem],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkoutsListItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
