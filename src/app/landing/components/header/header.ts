import { AlertService } from './../../../core/services/alert';
import { Component, inject } from '@angular/core';
import { RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [RouterModule, RouterLinkActive],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header {
  private alertService = inject(AlertService);
  welcome() {
    this.alertService.addAlert({
      type: 'success',
      title: 'Welcome to the Dashboard',
      message: 'You can now access your dashboard to manage your projects and settings.',
      icon: 'bi-person-raised-hand',
      duration: 10500 // 1.5 seconds
    });
  }
}
