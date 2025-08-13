import { Component, inject } from '@angular/core';
import { AlertService } from '../../../core/services/alert';
@Component({
  selector: 'app-alert',
  imports: [],
  templateUrl: './alert.html',
  styleUrl: './alert.css'
})
export class Alert {
  private alertService = inject(AlertService);

  alerts = this.alertService.alerts;

  close(id: number) {
    this.alertService.removeAlert(id);
  }
}
