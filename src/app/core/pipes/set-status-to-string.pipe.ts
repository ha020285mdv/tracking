import type { PipeTransform } from '@angular/core';
import { Pipe } from '@angular/core';
import { Status } from '../enums/status.enum';

const STATUS_LABEL: Record<Status, string> = {
  [Status.Completed]: 'Completed',
  [Status.Pending]: 'Pending',
  [Status.NotStarted]: 'Not Started',
  [Status.Active]: '',
};

@Pipe({
  name: 'setStatusToString',
  standalone: true,
})
export class SetStatusToStringPipe implements PipeTransform {
  transform(value: Status | null | undefined): string {
    return value ? STATUS_LABEL[value] : '';
  }
}
