import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './overview.component.html',
  styleUrl: './overview.component.css'
})
export class OverviewComponent implements OnInit, AfterViewInit {
  constructor(private cdr: ChangeDetectorRef) {
    console.log('OverviewComponent initialized');
  }

  ngOnInit(): void {
    console.log('Overview component OnInit - checking if content renders');
    // Force refresh to ensure content renders
    setTimeout(() => {
      console.log('Manual ChangeDetection triggered');
      this.cdr.detectChanges();
    }, 0);
  }

  ngAfterViewInit(): void {
    console.log('Overview component AfterViewInit');
    // Check if DOM elements are properly rendered
    setTimeout(() => {
      const container = document.querySelector('.overview-container');
      console.log('Overview container found:', !!container);

      // Check for material icons
      const icons = document.querySelectorAll('.material-icons');
      console.log('Material icons found:', icons.length);

      // Force another change detection cycle after view init
      this.cdr.detectChanges();
    }, 100);
  }
}
