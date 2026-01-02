import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetActive } from './set-active';

describe('SetActive', () => {
  let component: SetActive;
  let fixture: ComponentFixture<SetActive>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetActive]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetActive);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
