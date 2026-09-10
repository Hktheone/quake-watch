import { Injectable, signal, computed } from '@angular/core';

interface Alert {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  timestamp: Date;
}

interface AppState {
  alerts: Alert[];
}

@Injectable({ providedIn: 'root' })
export class StateService {
  private state = signal<AppState>({ alerts: [] });

  alerts = computed(() => this.state().alerts);

  addAlert(alert: Omit<Alert, 'id' | 'timestamp'>) {
    const newAlert: Alert = {
      ...alert,
      id: Math.random().toString(36),
      timestamp: new Date()
    };
    this.state.update(s => ({
      ...s,
      alerts: [newAlert, ...s.alerts].slice(0, 5)
    }));

    setTimeout(() => this.removeAlert(newAlert.id), 5000);
  }

  removeAlert(id: string) {
    this.state.update(s => ({
      ...s,
      alerts: s.alerts.filter(a => a.id !== id)
    }));
  }

  clearAlerts() {
    this.state.update(s => ({ ...s, alerts: [] }));
  }
}
