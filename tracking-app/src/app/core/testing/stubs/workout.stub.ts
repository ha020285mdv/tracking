import { Status } from '../../enums/status.enum';
import { Workout } from '../../models/workout.model';

export const mockWorkout = (): Workout => structuredClone(MOCK_WORKOUT);

const MOCK_WORKOUT: Workout = {
  id: 1,
  name: 'Push Day A',
  exercises: [
    {
      id: 1,
      name: 'Bench Press',
      sets: [
        { id: 1, weight: 60, reps: 8, status: Status.Completed },
        { id: 2, weight: 65, reps: 6, status: Status.Completed },
        { id: 3, weight: 70, reps: 5, status: Status.Completed },
        { id: 4, weight: 70, reps: 5, status: Status.Completed },
      ],
    },
    {
      id: 2,
      name: 'Overhead Press',
      sets: [
        { id: 1, weight: 40, reps: 10, status: Status.Completed },
        { id: 2, weight: 42, reps: 8, status: Status.Active },
        { id: 3, weight: 42, reps: 8, status: Status.Pending },
      ],
    },
    {
      id: 3,
      name: 'Incline Dumbbell Press',
      sets: [
        { id: 1, weight: 22, reps: 12, status: Status.Pending },
        { id: 2, weight: 22, reps: 10, status: Status.Pending },
        { id: 3, weight: 22, reps: 10, status: Status.Pending },
      ],
    },
    {
      id: 4,
      name: 'Tricep Pushdowns',
      sets: [
        { id: 1, weight: 25, reps: 15, status: Status.Active },
        { id: 2, weight: 27, reps: 12, status: Status.Pending },
        { id: 3, weight: 30, reps: 10, status: Status.Pending },
      ],
    },
    {
      id: 5,
      name: 'Push-ups',
      sets: [
        { id: 1, weight: null, reps: 20, status: Status.Pending },
        { id: 2, weight: null, reps: 15, status: Status.Pending },
        { id: 3, weight: null, reps: 12, status: Status.Pending },
      ],
    },
  ],
};
