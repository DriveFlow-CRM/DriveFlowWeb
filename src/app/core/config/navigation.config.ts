/**
 * Navigation configuration for dashboard menus.
 * All labels are in Romanian for user-facing display.
 */

/**
 * User types that can access the dashboard
 */
export type UserType = 'SuperAdmin' | 'SchoolAdmin' | 'Instructor' | 'Student';

/**
 * Navigation item interface
 */
export interface NavItem {
  /** Route path (relative to base route) */
  path: string;
  /** Material icon name */
  icon: string;
  /** Display label (Romanian) */
  label: string;
  /** Optional badge count */
  badge?: number;
  /** Whether this item is visible on mobile */
  showOnMobile?: boolean;
}

/**
 * Dashboard configuration per user type
 */
export interface DashboardConfig {
  /** Base route for this dashboard */
  baseRoute: string;
  /** Navigation items */
  navItems: NavItem[];
  /** Dashboard title (Romanian) */
  title: string;
  /** Role display name (Romanian) */
  roleDisplayName: string;
}

/**
 * Navigation configuration by user type
 */
export const NAVIGATION_CONFIG: Record<UserType, DashboardConfig> = {
  SuperAdmin: {
    baseRoute: '/dashboard/super-admin',
    title: 'Panou Super Admin',
    roleDisplayName: 'Super Administrator',
    navItems: [
      { path: 'overview', icon: 'dashboard', label: 'Prezentare generală', showOnMobile: true },
      { path: 'schools', icon: 'school', label: 'Școli', showOnMobile: true }
    ]
  },

  SchoolAdmin: {
    baseRoute: '/dashboard/school-admin',
    title: 'Panou Administrator Școală',
    roleDisplayName: 'Administrator Școală',
    navItems: [
      { path: 'overview', icon: 'dashboard', label: 'Prezentare generală', showOnMobile: true },
      { path: 'cars', icon: 'directions_car', label: 'Autoturisme', showOnMobile: true },
      { path: 'instructors', icon: 'person', label: 'Instructori', showOnMobile: true },
      { path: 'files', icon: 'folder', label: 'Dosare', showOnMobile: true }
    ]
  },

  Instructor: {
    baseRoute: '/dashboard/instructor',
    title: 'Panou Instructor',
    roleDisplayName: 'Instructor',
    navItems: [
      { path: 'overview', icon: 'dashboard', label: 'Prezentare generală', showOnMobile: true },
      { path: 'availability', icon: 'event_available', label: 'Disponibilitate', showOnMobile: true },
      { path: 'students', icon: 'people', label: 'Cursanții mei', showOnMobile: true },
      { path: 'appointments', icon: 'calendar_today', label: 'Program', showOnMobile: true }
    ]
  },

  Student: {
    baseRoute: '/dashboard/student',
    title: 'Panou Cursant',
    roleDisplayName: 'Cursant',
    navItems: [
      { path: '', icon: 'folder', label: 'Dosarele mele', showOnMobile: true }
    ]
  }
};

/**
 * Get navigation config for a user type
 * @param userType The user's role/type
 * @returns Dashboard configuration or null if not found
 */
export function getNavigationConfig(userType: string): DashboardConfig | null {
  if (userType in NAVIGATION_CONFIG) {
    return NAVIGATION_CONFIG[userType as UserType];
  }
  return null;
}

/**
 * Get base route for a user type
 * @param userType The user's role/type
 */
export function getBaseRoute(userType: string): string {
  const config = getNavigationConfig(userType);
  return config?.baseRoute ?? '/dashboard';
}

/**
 * Get display name for a user role (Romanian)
 * @param userType The user's role/type
 */
export function getRoleDisplayName(userType: string): string {
  const config = getNavigationConfig(userType);
  return config?.roleDisplayName ?? userType;
}
