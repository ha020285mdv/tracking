import { Component, computed, input, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { Workout } from '../../models/workout.model';
import { RouterLink } from '@angular/router';
import { MenuService } from '../../services/menu.service';

@Component({
  selector: 'app-workout-item',
  imports: [CommonModule, RouterLink],
  templateUrl: './workout-item.html',
  styleUrl: './workout-item.scss',
})
export class WorkoutItem {
  public readonly workout = input.required<Workout>();

  public readonly exerciseCount = computed(() => this.workout().exercises.length);
  public readonly setsCount = computed(() =>
    this.workout().exercises.reduce((acc, exercise) => acc + exercise.sets.length, 0),
  );

  @Output() public readonly makeFavorite = new EventEmitter<Workout>();
  @Output() public readonly edit = new EventEmitter<Workout>();
  @Output() public readonly delete = new EventEmitter<Workout>();

  private readonly menuService = inject(MenuService);
  private readonly currentSignal = toSignal(this.menuService.current$, { initialValue: null });
  public readonly isMenuOpen = computed(() => this.currentSignal() === this.workout().id);

  public onToggleMenu(event: Event) {
    event.stopPropagation();
    this.menuService.toggle(this.workout().id);
  }

  public onMakeFavorite(event: Event) {
    event.stopPropagation();
    this.makeFavorite.emit(this.workout());
    this.menuService.close();
  }

  public onEdit(event: Event) {
    event.stopPropagation();
    this.edit.emit(this.workout());
    this.menuService.close();
  }

  public onDelete(event: Event) {
    event.stopPropagation();
    this.delete.emit(this.workout());
    this.menuService.close();
  }
}
