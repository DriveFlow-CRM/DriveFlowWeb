import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { StudentFileService } from '../../../../../../core/services/student-file.service';
import { AuthService } from '../../../../../../core/services/auth.service';
import { StudentFile } from '../../../../../../models/interfaces/student-file.model';

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
    MatProgressSpinnerModule
  ],
  templateUrl: './file-list.component.html',
  styleUrls: ['./file-list.component.css']
})
export class FileListComponent implements OnInit {
  files: StudentFile[] = [];
  loading: boolean = true;
  studentId: string = '';

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
    }
  }

  loadFiles(): void {
    this.loading = true;
    this.studentFileService.getStudentFiles(this.studentId)
      .subscribe({
        next: (data) => {
          this.files = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading files:', error);
          this.loading = false;
        }
      });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'active':
        return 'bg-blue-200 text-blue-800';
      case 'completed':
        return 'bg-green-200 text-green-800';
      case 'rejected':
        return 'bg-red-200 text-red-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  }
}
