import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { Status } from '../enums/status.enum';

@Pipe({
  name: 'setStatusToString',
  standalone: true,
})
export class SetStatusToStringPipe implements PipeTransform {
  transform(value: Status): string {
    if (!value) {
      return '';
    }
    if (value === Status.Completed) {
      return 'Completed';
    }
    if (value === Status.Pending) {
      return 'Pending';
    }
    if (value === Status.NotStarted) {
      return 'Not Started';
    }
    return '';
  }
}
