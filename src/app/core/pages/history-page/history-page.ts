import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WorkoutHistory } from '../../models/workout-history.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ExerciseCard } from '../../components/exercise-card/exercise-card';

@Component({
  selector: 'app-history-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ExerciseCard],
  templateUrl: './history-page.html',
  styleUrl: './history-page.scss',
})
export class HistoryPage {
  private readonly route = inject(ActivatedRoute);

  protected readonly history = toSignal(
    this.route.data.pipe(map((data) => data['history'] as WorkoutHistory | null)),
    { initialValue: null },
  );

  protected readonly durationLabel = computed(() => {
    const h = this.history();
    if (!h?.duration) return '—';
    const mins = Math.round(h.duration / 60);
    return `${mins} min`;
  });
}
