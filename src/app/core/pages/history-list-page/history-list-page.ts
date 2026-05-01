import { Component, computed, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SharedCalendar } from '../../../shared/components/calendar/calendar';

@Component({
  selector: 'app-history-list-page',
  standalone: true,
  imports: [CommonModule, RouterLink, SharedCalendar],
  templateUrl: './history-list-page.html',
  styleUrl: './history-list-page.scss',
})
export class HistoryListPage {
  protected readonly calendar = viewChild.required(SharedCalendar);

  protected readonly monthLabel = computed(() => this.calendar().monthLabel());
  protected readonly monthHistory = computed(() => this.calendar().monthHistory());
  protected readonly isCurrentMonth = computed(() => this.calendar().isCurrentMonth());

  goToCurrentMonth(): void {
    this.calendar().goToCurrentMonth();
  }

  protected formatDuration(seconds: number | undefined): string {
    if (!seconds) return '—';
    const mins = Math.round(seconds / 60);
    return `${mins} min`;
  }
}
