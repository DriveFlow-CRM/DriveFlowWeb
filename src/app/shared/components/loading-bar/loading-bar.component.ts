import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { LoadingService } from '../../../core/services/loading.service';

/**
 * Top progress bar component (YouTube/GitHub style).
 * Shows a thin animated progress bar at the top of the page during loading.
 * 
 * Usage:
 * Add to app.component.html:
 * ```html
 * <app-loading-bar></app-loading-bar>
 * <router-outlet></router-outlet>
 * ```
 */
@Component({
  selector: 'app-loading-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-bar-container" *ngIf="isLoading" role="progressbar" aria-label="Se încarcă...">
      <div class="loading-bar"></div>
    </div>
  `,
  styles: [`
    .loading-bar-container {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      z-index: 9999;
      overflow: hidden;
      background-color: rgba(68, 217, 230, 0.2);
    }

    .loading-bar {
      height: 100%;
      width: 30%;
      background: linear-gradient(
        90deg,
        var(--color-primary, #44D9E6) 0%,
        var(--color-primary-dark, #2A878F) 50%,
        var(--color-primary, #44D9E6) 100%
      );
      animation: loading-animation 1.5s ease-in-out infinite;
      border-radius: 0 2px 2px 0;
    }

    @keyframes loading-animation {
      0% {
        transform: translateX(-100%);
        width: 30%;
      }
      50% {
        width: 60%;
      }
      100% {
        transform: translateX(400%);
        width: 30%;
      }
    }
  `]
})
export class LoadingBarComponent implements OnInit, OnDestroy {
  isLoading = false;
  private destroy$ = new Subject<void>();

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    this.loadingService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.isLoading = state.isLoading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
