import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { StudentFileService, FileStats, MistakeStats, MovingAverage } from '../../../../../../core/services/student-file.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { StudentFile, StudentFileDetails } from '../../../../../../models/interfaces/student-file.model';

interface FileWithProgress extends StudentFile {
  lessonsCompleted?: number;
  lessonsRequired?: number;
  progressPercentage?: number;
}

@Component({
  selector: 'app-file-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatButtonToggleModule,
    FormsModule
  ],
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {
  files: FileWithProgress[] = [];
  loading: boolean = true;
  studentId: string = '';
  
  // Stats
  statsLoading: boolean = true;
  statsError: string = '';
  selectedTimeRange: 'all' | 'month' = 'all';
  chartData: MovingAverage[] = [];
  totalSessions: number = 0;
  averageScore: number = 0;

  constructor(
    private studentFileService: StudentFileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadStudentData();
  }

  loadStudentData(): void {
    const userData = this.authService.getUserData();
    if (userData?.userId) {
      this.studentId = userData.userId;
      this.loadFiles();
      this.loadStats();
    }
  }

  loadFiles(): void {
    this.loading = true;
    this.studentFileService.getStudentFiles(this.studentId)
      .subscribe({
        next: (data) => {
          this.files = data;
          this.loading = false;
          // Load details for each file to get progress
          this.loadFileDetails();
        },
        error: (error) => {
          console.error('Error loading files:', error);
          this.loading = false;
        }
      });
  }

  loadFileDetails(): void {
    if (this.files.length === 0) return;

    const detailRequests = this.files.map(file =>
      this.studentFileService.getFileDetails(file.fileId).pipe(
        catchError(() => of(null))
      )
    );

    forkJoin(detailRequests).subscribe({
      next: (details) => {
        this.files = this.files.map((file, index) => {
          const detail = details[index] as StudentFileDetails | null;
          if (detail) {
            const lessonsCompleted = detail.appointmentsCompleted || 0;
            const lessonsRequired = 30; // Default or could come from API
            return {
              ...file,
              lessonsCompleted,
              lessonsRequired,
              progressPercentage: Math.min(Math.round((lessonsCompleted / lessonsRequired) * 100), 100)
            };
          }
          return file;
        });
      },
      error: (error) => {
        console.error('Error loading file details:', error);
      }
    });
  }

  loadStats(): void {
    this.statsLoading = true;
    this.statsError = '';

    const options: { from?: string; to?: string } = {};
    
    if (this.selectedTimeRange === 'month') {
      const now = new Date();
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      options.from = monthAgo.toISOString().split('T')[0];
      options.to = now.toISOString().split('T')[0];
    }

    this.studentFileService.getMistakeStats(this.studentId, options)
      .subscribe({
        next: (data) => {
          this.processStatsData(data);
          this.statsLoading = false;
        },
        error: (error) => {
          console.error('Error loading stats:', error);
          this.statsError = 'Nu s-au putut încărca statisticile';
          this.statsLoading = false;
        }
      });
  }

  processStatsData(data: FileStats[] | MistakeStats): void {
    let allMovingAverages: MovingAverage[] = [];

    if (Array.isArray(data)) {
      // Multiple files - combine moving averages
      data.forEach(fileStats => {
        if (fileStats.stats?.movingAverage) {
          allMovingAverages = [...allMovingAverages, ...fileStats.stats.movingAverage];
        }
      });
      // Sort by date
      allMovingAverages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calculate total sessions
      this.totalSessions = data.reduce((total, fs) => total + (fs.stats?.series?.length || 0), 0);
    } else {
      // Single file stats
      allMovingAverages = data.movingAverage || [];
      this.totalSessions = data.series?.length || 0;
    }

    this.chartData = allMovingAverages;
    
    // Calculate average score
    if (this.chartData.length > 0) {
      const sum = this.chartData.reduce((acc, item) => acc + item.avg, 0);
      this.averageScore = Math.round(sum / this.chartData.length);
    } else {
      this.averageScore = 0;
    }
  }

  onTimeRangeChange(): void {
    this.loadStats();
  }

  getStatusClass(status: string): string {
    if (status?.toUpperCase() === 'APPROVED') {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-gray-100 text-gray-800';
  }

  getStatusLabel(status: string): string {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'Aprobat';
      case 'PENDING':
        return 'În așteptare';
      case 'ACTIVE':
        return 'Activ';
      case 'COMPLETED':
        return 'Finalizat';
      case 'ARCHIVED':
        return 'Arhivat';
      default:
        return status || 'N/A';
    }
  }

  getLicenseTypeColor(type: string): string {
    switch (type) {
      case 'A':
        return '#EF4444';
      case 'B':
        return '#3B82F6';
      case 'C':
        return '#10B981';
      case 'D':
        return '#F59E0B';
      default:
        return '#64748B';
    }
  }

  // Chart helpers
  getChartMaxValue(): number {
    if (this.chartData.length === 0) return 100;
    return Math.max(...this.chartData.map(d => d.avg)) * 1.2;
  }

  getChartPoints(): string {
    if (this.chartData.length === 0) return '';
    
    const width = 100;
    const height = 60;
    const maxValue = this.getChartMaxValue();
    
    return this.chartData.map((point, index) => {
      const x = (index / (this.chartData.length - 1 || 1)) * width;
      const y = height - (point.avg / maxValue) * height;
      return `${x},${y}`;
    }).join(' ');
  }

  getChartAreaPoints(): string {
    if (this.chartData.length === 0) return '';
    
    const width = 100;
    const height = 60;
    const maxValue = this.getChartMaxValue();
    
    const linePoints = this.chartData.map((point, index) => {
      const x = (index / (this.chartData.length - 1 || 1)) * width;
      const y = height - (point.avg / maxValue) * height;
      return `${x},${y}`;
    });

    return `0,${height} ${linePoints.join(' ')} ${width},${height}`;
  }

  formatChartDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' });
  }
}
