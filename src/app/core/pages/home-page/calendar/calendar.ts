import { Component, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SharedCalendar } from '../../../../shared/components/calendar/calendar';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [RouterLink, SharedCalendar],
  templateUrl: './calendar.html',
  styleUrl: './calendar.scss',
})
export class Calendar {
  protected readonly calendar = viewChild.required(SharedCalendar);

  goToCurrentMonth(): void {
    this.calendar().goToCurrentMonth();
  }
}
