import { Injectable, signal } from '@angular/core';

export interface Alert {
  id: number;
  type: 'success' | 'info' | 'warning' | 'danger' | 'normal';
  title: string;
  message: string;
  icon?: string;
  duration?: number;
}

@Injectable({ providedIn: 'root' })
export class AlertService {
  alerts = signal<Alert[]>([]);
  private idCounter = 0;

  addAlert({ type, title, message, icon, duration = 5000 }: {
    type: Alert['type'];
    title: string;
    message: string;
    icon?: string;
    duration?: number;
  }) {
    if (!icon) {
      icon = this.getDefaultIcon(type);
    }

    const newAlert: Alert = {
      id: ++this.idCounter,
      type,
      title,
      message,
      icon,
      duration
    };

    this.alerts.update(alerts => [...alerts, newAlert]);

    // Eliminar automàticament després de la durada
    setTimeout(() => this.removeAlert(newAlert.id), duration);
  }


  removeAlert(id: number) {
    this.alerts.update(alerts => alerts.filter(a => a.id !== id));
  }

  private getDefaultIcon(type: Alert['type']): string {
    switch (type) {
      case 'success': return 'bi-check-circle-fill';
      case 'info': return 'bi-info-circle-fill';
      case 'warning': return 'bi-exclamation-triangle-fill';
      case 'danger': return 'bi-times-circle-fill';
      case 'normal': return 'bi-bell';
      default: return 'bi-bell-fill';
    }
  }
}
