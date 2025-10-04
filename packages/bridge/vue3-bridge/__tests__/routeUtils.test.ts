import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';
import { processRoutes, type RouteProcessingOptions } from '../src/routeUtils';

// Mock components for testing
const HomeComponent = { template: '<div>Home</div>' };
const DashboardComponent = { template: '<div>Dashboard<router-view/></div>' };
const ProfileComponent = { template: '<div>Profile</div>' };
const SettingsComponent = { template: '<div>Settings<router-view/></div>' };
const AccountComponent = { template: '<div>Account</div>' };
const NotificationsComponent = { template: '<div>Notifications</div>' };

// Create a nested route configuration for testing
const createNestedRoutes = () => [
  {
    path: '/',
    name: 'Home',
    component: HomeComponent,
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardComponent,
    children: [
      {
        path: 'profile',
        name: 'Profile',
        component: ProfileComponent,
      },
      {
        path: 'settings',
        name: 'Settings',
        component: SettingsComponent,
        children: [
          {
            path: 'account',
            name: 'Account',
            component: AccountComponent,
          },
          {
            path: 'notifications',
            name: 'Notifications',
            component: NotificationsComponent,
          },
        ],
      },
    ],
  },
];

describe('routeUtils', () => {
  let router: any;
  let options: RouteProcessingOptions;

  beforeEach(() => {
    const routes = createNestedRoutes();
    router = createRouter({
      history: createWebHistory(),
      routes,
    });

    options = {
      router,
      basename: '/app',
    };
  });

  describe('processRoutesWithPathAnalysis', () => {
    it('should process routes correctly', () => {
      const result = processRoutes(options);

      expect(result.history).toBeDefined();
      expect(result.routes).toBeDefined();

      expect(result.routes.length).toBe(2); // Home + Dashboard

      // test nested structure
      const dashboardRoute = result.routes.find(
        (route) => route.name === 'Dashboard',
      );
      expect(dashboardRoute).toBeDefined();
      expect(dashboardRoute?.children).toBeDefined();
      expect(dashboardRoute?.children?.length).toBe(2); // Profile + Settings

      // test deep nested structure
      const settingsRoute = dashboardRoute?.children?.find(
        (child) => child.name === 'Settings',
      );
      expect(settingsRoute).toBeDefined();
      expect(settingsRoute?.children).toBeDefined();
      expect(settingsRoute?.children?.length).toBe(2); // Account + Notifications

      // test paths
      expect(dashboardRoute?.path).toBe('/dashboard');
      expect(settingsRoute?.path).toBe('settings'); // relative path

      const accountRoute = settingsRoute?.children?.find(
        (child) => child.name === 'Account',
      );
      expect(accountRoute?.path).toBe('account'); // relative path
    });

    it('should process root path correctly', () => {
      const result = processRoutes(options);

      const homeRoute = result.routes.find((route) => route.name === 'Home');
      expect(homeRoute).toBeDefined();
      expect(homeRoute?.path).toBe('/');
    });

    it('should preserve component information at runtime', () => {
      const result = processRoutes(options);

      const dashboardRoute = result.routes.find(
        (route) => route.name === 'Dashboard',
      );
      expect(dashboardRoute?.components).toBeDefined();

      // test child component
      const profileRoute = dashboardRoute?.children?.find(
        (child) => child.name === 'Profile',
      );
      expect(profileRoute?.components).toBeDefined();
    });
  });

  describe('processRoutes with relative paths', () => {
    it('should use relative paths for nested routes', () => {
      const result = processRoutes(options);

      const dashboardRoute = result.routes.find(
        (route) => route.name === 'Dashboard',
      );
      if (dashboardRoute && dashboardRoute.children) {
        const settingsRoute = dashboardRoute.children.find(
          (child) => child.name === 'Settings',
        );
        if (settingsRoute) {
          // Path of `Settings` should be 'settings'，rather than '/dashboard/settings'
          expect(settingsRoute.path).toBe('settings');

          // Check child routes of Settings
          if (settingsRoute.children) {
            const accountRoute = settingsRoute.children.find(
              (child) => child.name === 'Account',
            );
            if (accountRoute) {
              expect(accountRoute.path).toBe('account');
            }
          }
        }
      }
    });

    it('should maintain top-level routes with absolute paths', () => {
      const result = processRoutes(options);

      const homeRoute = result.routes.find((route) => route.name === 'Home');
      expect(homeRoute?.path).toBe('/');

      const dashboardRoute = result.routes.find(
        (route) => route.name === 'Dashboard',
      );
      expect(dashboardRoute?.path).toBe('/dashboard');
    });

    it('should handle deep nested routes with correct relative paths', () => {
      const result = processRoutes(options);

      const dashboardRoute = result.routes.find(
        (route) => route.name === 'Dashboard',
      );
      expect(dashboardRoute?.path).toBe('/dashboard'); // Top-level should be absolute

      if (dashboardRoute && dashboardRoute.children) {
        const profileRoute = dashboardRoute.children.find(
          (child) => child.name === 'Profile',
        );
        expect(profileRoute?.path).toBe('profile'); // Child should be relative

        const settingsRoute = dashboardRoute.children.find(
          (child) => child.name === 'Settings',
        );
        expect(settingsRoute?.path).toBe('settings'); // Child should be relative

        // Test deep nested routes
        if (settingsRoute && settingsRoute.children) {
          const accountRoute = settingsRoute.children.find(
            (child) => child.name === 'Account',
          );
          expect(accountRoute?.path).toBe('account'); // Deep child should be relative

          const notificationsRoute = settingsRoute.children.find(
            (child) => child.name === 'Notifications',
          );
          expect(notificationsRoute?.path).toBe('notifications'); // Deep child should be relative
        }
      }
    });
  });
});
