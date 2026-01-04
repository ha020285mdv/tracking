import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { WorkoutHistory } from '../../models/workout-history.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-history-page',
  imports: [],
  templateUrl: './history-page.html',
  styleUrl: './history-page.scss',
})
export class HistoryPage {
  private readonly route = inject(ActivatedRoute);

  protected readonly workout = toSignal(
    this.route.data.pipe(map((data) => data['history'] as WorkoutHistory[])),
    { initialValue: [] }
  );
}
