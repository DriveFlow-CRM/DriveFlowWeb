import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardGuardService } from './core/guards/dashboard-guard.service';
import { LoadingBarComponent } from './shared/components/loading-bar/loading-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingBarComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'DriveFlowWeb';

  constructor(private dashboardGuard: DashboardGuardService) {}

  ngOnInit(): void {
    // Check if we need to redirect on application start
    this.dashboardGuard.checkAuthAndRedirect();
  }
}
