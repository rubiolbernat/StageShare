import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type NotificationType = 'success' | 'info' | 'warning' | 'danger' | 'normal';

export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  icon?: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  private notifications: Notification[] = [];
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  private nextId = 1;

  constructor() { }

  getNotifications(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  addNotification(type: NotificationType, title: string, message: string, icon?: string, duration: number = 5000): void {
    const notification: Notification = {
      id: this.nextId++,
      type,
      title,
      message,
      icon,
      duration
    };

    if (!notification.icon) {
      notification.icon = this.getDefaultIcon(type);
    }

    this.notifications.push(notification);
    this.notificationsSubject.next([...this.notifications]);

    setTimeout(() => {
      this.removeNotification(notification.id);
    }, duration);
  }

  removeNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notificationsSubject.next([...this.notifications]);
  }

  private getDefaultIcon(type: NotificationType): string {
    switch (type) {
      case 'success': return 'fa-check-circle';
      case 'info': return 'fa-info-circle';
      case 'warning': return 'fa-exclamation-triangle';
      case 'danger': return 'fa-times-circle';
      case 'normal': return 'fa-info-circle';
      default: return 'fa-bell';
    }
  }

  // Convenience methods
  success(title: string, message: string, duration?: number): void {
    this.addNotification('success', title, message, undefined, duration);
  }

  info(title: string, message: string, duration?: number): void {
    this.addNotification('info', title, message, undefined, duration);
  }

  warning(title: string, message: string, duration?: number): void {
    this.addNotification('warning', title, message, undefined, duration);
  }

  danger(title: string, message: string, duration?: number): void {
    this.addNotification('danger', title, message, undefined, duration);
  }

  normal(title: string, message: string, icon?: string, duration?: number): void {
    this.addNotification('normal', title, message, icon, duration);
  }
}
