# DriveFlowWeb Coding Standards

This document defines the coding standards and architectural patterns for the DriveFlowWeb application.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Routing Standards](#routing-standards)
3. [Authentication](#authentication)
4. [Component Structure](#component-structure)
5. [Styling Standards](#styling-standards)
6. [State Management](#state-management)
7. [Error Handling](#error-handling)
8. [Data Models](#data-models)

## Project Structure

The project follows a feature-based architecture with clear separation of concerns:

```
src/
├── app/
│   ├── core/           # Core services, guards, interceptors
│   ├── features/       # Feature modules
│   ├── layouts/        # Layout components
│   ├── models/         # Interfaces and data models
│   ├── shared/         # Shared components, directives, pipes
│   └── store/          # NgRx state management
```

### Feature Organization

Each feature module should follow this structure:

```
features/
├── feature-name/
│   ├── pages/          # Routable components (pages)
│   ├── components/     # Feature-specific components
│   ├── services/       # Feature-specific services (if not in core)
│   └── models/         # Feature-specific models (if not in global models)
```

## Routing Standards

- **Lazy loading**: Use lazy-loaded routes for all feature modules
- **Role-based access**: Implement route guards for authorization
- **URL Structure**:
  - Public routes: `/`, `/auth`, `/school/:id/:name`
  - Dashboard routes: `/dashboard/:role/:feature`
  - Feature routes: `/dashboard/:role/:feature/:subfeature/:id`

### Example

```typescript
const routes: Routes = [
  // Public routes
  { path: 'auth', component: AuthComponent },
  { path: '', component: HomePageComponent },
  { path: 'school/:id/:name', component: SchoolProfileComponent },
  
  // Role-specific dashboard routes with guards
  {
    path: 'dashboard/:role',
    canActivate: [authGuard, roleGuard],
    component: DashboardLayoutComponent,
    children: [
      { path: 'feature', component: FeatureComponent }
    ]
  }
];
```

## Authentication

### Auth Service Responsibilities

- Token management (storage, refresh, validation)
- User authentication state
- Role-based access control
- Session management

### Auth Flow

1. Store tokens in localStorage
2. Use HTTP interceptor for token injection
3. Implement token refresh mechanism
4. Clear all auth data on logout

### Auth Guards

- `authGuard`: Checks if user is authenticated
- `dashboardGuard`: Checks role-specific access
- `roleGuard`: Validates specific role permissions

## Component Structure

### Component Types

- **Page Components**: Routable components that represent entire pages
- **UI Components**: Reusable UI elements
- **Feature Components**: Feature-specific components
- **Layout Components**: Page layout structures

### Naming Conventions

- **Files**: `feature-name.component.ts`
- **Classes**: PascalCase (e.g., `FeatureNameComponent`)
- **Selectors**: kebab-case with feature prefix (e.g., `app-feature-name`)
- **Page Components**: `pages/feature-name/feature-name.component.ts`

### Component Implementation

- Use standalone components with explicit imports
- Extract reusable logic to services
- Keep components focused on presentation logic
- Implement OnPush change detection where appropriate

## Styling Standards

### Tailwind CSS

- Primary styling approach using utility classes
- Custom colors defined in `tailwind.config.js`
- Color palette:
  - Primary: `#44D9E6` (Turquoise)
  - Primary Dark: `#2A878F` (Darker turquoise)
  - Dark: `#1D1D1B` (Almost black)
  - Light: `#F8FAFC` (Very light gray)
  - Gray: `#1A1A1A` (Gray)

### Angular Material

- Used for complex UI components (dialogs, tables, etc.)
- Always override with project's palette using Tailwind classes
- Avoid direct Material styling that conflicts with the project's design system

### CSS Organization

- Use component-scoped CSS files
- Global styles in `src/styles.css`
- Shared styles in `src/app/shared/styles/`
- Prefer Tailwind utility classes over custom CSS
- Use BEM naming for custom CSS classes

### Common UI Patterns

- Cards: White background, rounded corners (`rounded-xl`), shadow (`shadow-md`)
- Buttons: Primary color with hover effects
- Forms: Material form fields with custom styling
- Modals: Material dialogs with custom styling

## State Management

### NgRx Implementation

- Use NgRx for global application state
- Organize by feature: actions, effects, reducers, selectors
- Follow the pattern:
  - Actions: event description using past tense verbs
  - Reducers: pure functions that update state
  - Effects: handle side effects like API calls
  - Selectors: query and derive state

### When to Use NgRx

- Authentication state
- Complex data that is shared across features
- Data that requires caching
- State that persists across navigation

### When to Use Component State

- UI-specific state
- Temporary form data
- Component-specific settings
- Data that doesn't need to be shared

## Error Handling

- Use centralized error handling service
- Implement proper HTTP error interceptor
- Standard error responses with appropriate status codes
- User-friendly error messages in the UI
- Log errors for monitoring

## Data Models

### Interface Organization

- Define all interfaces in `src/app/models/interfaces/`
- Group by feature or domain entity
- Use strict typing for all data models
- Export types for reuse across the application

### Naming Conventions

- PascalCase for interface names
- Suffix with purpose (e.g., `UserResponse`, `LoginRequest`)
- Group related models in the same file
- Export all from a barrel file

### Example

```typescript
// auth.model.ts
export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  userId: string;
  userType: string;
  // ...other properties
}
```

---

*This standard document should be reviewed periodically and updated as the application evolves.* 
