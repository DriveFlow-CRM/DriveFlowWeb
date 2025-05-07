import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DashboardGuardService } from './core/guards/dashboard-guard.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'DriveFlowWeb';

  constructor(private dashboardGuard: DashboardGuardService) {}

  ngOnInit(): void {
    // Check if we need to redirect on application start
    this.dashboardGuard.checkAuthAndRedirect();
  }
}
