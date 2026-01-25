import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Loading state interface
 */
export interface LoadingState {
  isLoading: boolean;
  requestCount: number;
}

/**
 * Centralized loading state management service.
 * Tracks HTTP requests and manual loading states.
 * 
 * Features:
 * - Automatic request counting for concurrent HTTP calls
 * - Manual show/hide control for non-HTTP operations
 * - Observable loading state for components
 */
@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({
    isLoading: false,
    requestCount: 0
  });

  /**
   * Observable loading state
   */
  loading$: Observable<LoadingState> = this.loadingSubject.asObservable();

  /**
   * Observable for simple boolean loading check
   */
  get isLoading$(): Observable<boolean> {
    return new Observable<boolean>(observer => {
      this.loadingSubject.subscribe(state => {
        observer.next(state.isLoading);
      });
    });
  }

  /**
   * Current loading state
   */
  get isLoading(): boolean {
    return this.loadingSubject.value.isLoading;
  }

  /**
   * Increment request count (call when HTTP request starts)
   */
  startLoading(): void {
    const currentState = this.loadingSubject.value;
    this.loadingSubject.next({
      isLoading: true,
      requestCount: currentState.requestCount + 1
    });
  }

  /**
   * Decrement request count (call when HTTP request completes)
   */
  stopLoading(): void {
    const currentState = this.loadingSubject.value;
    const newCount = Math.max(0, currentState.requestCount - 1);
    this.loadingSubject.next({
      isLoading: newCount > 0,
      requestCount: newCount
    });
  }

  /**
   * Force show loading (for non-HTTP operations)
   */
  show(): void {
    this.startLoading();
  }

  /**
   * Force hide loading (for non-HTTP operations)
   */
  hide(): void {
    this.stopLoading();
  }

  /**
   * Reset loading state (force hide all)
   */
  reset(): void {
    this.loadingSubject.next({
      isLoading: false,
      requestCount: 0
    });
  }
}
