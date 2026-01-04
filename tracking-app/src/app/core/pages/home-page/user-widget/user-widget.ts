import { Component, inject } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-user-widget',
  imports: [],
  templateUrl: './user-widget.html',
  styleUrl: './user-widget.scss',
})
export class UserWidget {
  private readonly authService = inject(AuthService);

  get user(): User | null {
    return this.authService.currentUser();
  }
}
