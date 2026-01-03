import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/components/header/header';
import { WorkoutService } from './core/services/workout.service';
import { pipe, takeUntil } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly workoutService = inject(WorkoutService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly userId = '007'; // TODO: get from auth service

  ngOnInit(): void {
    // Load active session on app initialization
    this.workoutService
      .getActiveSession$(this.userId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((session) => {
        this.workoutService.setActiveSession(session);
      });
  }
}
