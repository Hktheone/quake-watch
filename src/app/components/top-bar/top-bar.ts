import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { StateService } from '../../services/state-service';
import { ThemeService } from '../../services/theme-service';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBar {
  stateService = inject(StateService);
  private themeService = inject(ThemeService);

  isDarkMode = this.themeService.isDarkMode$;
  currentTime = signal('');

  ngOnInit() {
    this.updateTime();
    setInterval(() => this.updateTime(), 1000);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  private updateTime() {
    this.currentTime.set(
      new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    );
  }
}
