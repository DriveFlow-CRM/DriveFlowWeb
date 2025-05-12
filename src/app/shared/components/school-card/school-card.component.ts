import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { School, SchoolListing } from '../../../core/models/school.model';

@Component({
  selector: 'app-school-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './school-card.component.html',
  styleUrl: './school-card.component.css'
})
export class SchoolCardComponent {
  @Input() school!: School | SchoolListing;

  getSchoolUrl(): string {
    return `/schools/${this.getSchoolId()}`;
  }

  getSchoolImage(): string {
    return 'assets/images/default-school.jpg';
  }

  getStatusClass(): string {
    const status = this.getStatusValue().toLowerCase();
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'restricted':
        return 'bg-orange-100 text-orange-800';
      case 'demo':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(): string {
    const status = this.getStatusValue();
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  private getStatusValue(): string {
    return String(this.school.status);
  }

  getSchoolSlug(): string {
    return this.school.name.toLowerCase().replace(/\s+/g, '-');
  }

  getSchoolId(): string {
    if ('autoSchoolId' in this.school) {
      return this.school.autoSchoolId.toString();
    }
    return this.school.id.toString();
  }
}
