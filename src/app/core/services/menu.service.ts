import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class MenuService {
  private readonly current = new BehaviorSubject<string | null>(null);
  public readonly current$ = this.current.asObservable();

  constructor() {
    // Close menus on any document click (menu toggles and buttons stop propagation)
    fromEvent(document, 'click').subscribe(() => this.close());
  }

  open(id: string) {
    this.current.next(id);
  }

  close() {
    this.current.next(null);
  }

  toggle(id: string) {
    const cur = this.current.getValue();
    this.current.next(cur === id ? null : id);
  }

  get value() {
    return this.current.getValue();
  }
}
