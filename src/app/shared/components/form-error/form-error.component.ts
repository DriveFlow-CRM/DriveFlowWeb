import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Romanian error messages for form validation
 */
export const VALIDATION_MESSAGES: Record<string, string | ((params: any) => string)> = {
  required: 'Acest câmp este obligatoriu.',
  email: 'Introduceți o adresă de email validă.',
  minlength: (params: { requiredLength: number }) => 
    `Acest câmp trebuie să conțină minim ${params.requiredLength} caractere.`,
  maxlength: (params: { requiredLength: number }) => 
    `Acest câmp trebuie să conțină maxim ${params.requiredLength} caractere.`,
  min: (params: { min: number }) => 
    `Valoarea minimă este ${params.min}.`,
  max: (params: { max: number }) => 
    `Valoarea maximă este ${params.max}.`,
  pattern: 'Formatul introdus nu este valid.',
  passwordMismatch: 'Parolele nu coincid.',
  invalidDate: 'Data introdusă nu este validă.',
  invalidPhone: 'Numărul de telefon nu este valid.',
  invalidCNP: 'CNP-ul introdus nu este valid.',
  invalidLicensePlate: 'Numărul de înmatriculare nu este valid.',
  futureDate: 'Data nu poate fi în viitor.',
  pastDate: 'Data nu poate fi în trecut.',
  dateRange: 'Data de început trebuie să fie înainte de data de sfârșit.',
  uniqueEmail: 'Această adresă de email este deja folosită.',
  weakPassword: 'Parola este prea slabă. Folosiți litere mari, mici, cifre și caractere speciale.',
};

/**
 * Custom field name mappings (Romanian)
 */
export const FIELD_NAMES: Record<string, string> = {
  email: 'Email',
  password: 'Parolă',
  confirmPassword: 'Confirmare parolă',
  firstName: 'Prenume',
  lastName: 'Nume',
  phone: 'Telefon',
  phoneNumber: 'Număr de telefon',
  cnp: 'CNP',
  address: 'Adresă',
  city: 'Oraș',
  county: 'Județ',
  postcode: 'Cod poștal',
  licensePlate: 'Număr înmatriculare',
  brand: 'Marcă',
  model: 'Model',
  year: 'An fabricație',
  color: 'Culoare',
  date: 'Data',
  startDate: 'Data de început',
  endDate: 'Data de sfârșit',
  time: 'Ora',
  description: 'Descriere',
  name: 'Nume',
  title: 'Titlu',
};

/**
 * Reusable form field error component.
 * Displays validation errors in Romanian.
 * 
 * Usage:
 * ```html
 * <mat-form-field>
 *   <mat-label>Email</mat-label>
 *   <input matInput formControlName="email">
 *   <app-form-error [control]="form.get('email')" fieldName="email"></app-form-error>
 * </mat-form-field>
 * ```
 */
@Component({
  selector: 'app-form-error',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="form-error" *ngIf="shouldShowError" role="alert">
      <span class="material-icons error-icon">error_outline</span>
      <span class="error-text">{{ errorMessage }}</span>
    </div>
  `,
  styles: [`
    .form-error {
      display: flex;
      align-items: center;
      gap: 4px;
      color: var(--color-error, #EF4444);
      font-size: 12px;
      margin-top: 4px;
      animation: fadeIn 0.2s ease-in-out;
    }

    .error-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .error-text {
      flex: 1;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `]
})
export class FormErrorComponent {
  /**
   * The form control to check for errors
   */
  @Input() control: AbstractControl | null = null;

  /**
   * Field name for contextual error messages (optional)
   */
  @Input() fieldName: string = '';

  /**
   * Custom error messages (override defaults)
   */
  @Input() customMessages: Record<string, string> = {};

  /**
   * Whether to show errors only when touched (default: true)
   */
  @Input() showOnTouched: boolean = true;

  /**
   * Whether to show errors only when dirty (default: false)
   */
  @Input() showOnDirty: boolean = false;

  /**
   * Check if error should be displayed
   */
  get shouldShowError(): boolean {
    if (!this.control) return false;
    
    const hasErrors = this.control.invalid;
    const isTouched = this.control.touched;
    const isDirty = this.control.dirty;

    if (this.showOnTouched && !isTouched) return false;
    if (this.showOnDirty && !isDirty) return false;

    return hasErrors;
  }

  /**
   * Get the error message to display
   */
  get errorMessage(): string {
    if (!this.control || !this.control.errors) return '';

    const errors = this.control.errors;
    const errorKey = Object.keys(errors)[0];
    const errorValue = errors[errorKey];

    // Check custom messages first
    if (this.customMessages[errorKey]) {
      return this.customMessages[errorKey];
    }

    // Get message from default messages
    const message = VALIDATION_MESSAGES[errorKey];
    
    if (!message) {
      // Fallback for unknown error types
      return `Eroare de validare: ${errorKey}`;
    }

    // Handle function-based messages (with parameters)
    if (typeof message === 'function') {
      return message(errorValue);
    }

    return message;
  }

  /**
   * Get localized field name
   */
  get localizedFieldName(): string {
    return FIELD_NAMES[this.fieldName] || this.fieldName;
  }
}

/**
 * Helper function to get validation error message
 * @param control Form control
 * @param fieldName Optional field name for context
 */
export function getValidationErrorMessage(
  control: AbstractControl | null,
  fieldName?: string
): string {
  if (!control || !control.errors) return '';

  const errors = control.errors;
  const errorKey = Object.keys(errors)[0];
  const errorValue = errors[errorKey];

  const message = VALIDATION_MESSAGES[errorKey];
  
  if (!message) {
    return `Eroare de validare: ${errorKey}`;
  }

  if (typeof message === 'function') {
    return message(errorValue);
  }

  return message;
}
