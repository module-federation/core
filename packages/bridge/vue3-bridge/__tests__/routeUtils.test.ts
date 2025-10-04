import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createRouter, createWebHistory } from 'vue-router';
import {
  processRoutesWithPathAnalysis,
  type RouteProcessingOptions,
} from '../src/routeUtils';
import { reconstructRoutesByPath } from '../src/pathBasedRouteUtils';

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
      const result = processRoutesWithPathAnalysis(options);

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
      const result = processRoutesWithPathAnalysis(options);

      const homeRoute = result.routes.find((route) => route.name === 'Home');
      expect(homeRoute).toBeDefined();
      expect(homeRoute?.path).toBe('/');
    });

    it('should preserve component information at runtime', () => {
      const result = processRoutesWithPathAnalysis(options);

      const dashboardRoute = result.routes.find(
        (route) => route.name === 'Dashboard',
      );
      expect(
        dashboardRoute?.component || dashboardRoute?.components,
      ).toBeDefined();

      // test child component
      const profileRoute = dashboardRoute?.children?.find(
        (child) => child.name === 'Profile',
      );
      expect(profileRoute?.component || profileRoute?.components).toBeDefined();
    });
  });

  describe('reconstructRoutesByPath', () => {
    it('should analyze path hierarchy correctly', () => {
      const flatRoutes = router.getRoutes();
      const staticRoutes = router.options.routes;
      const result = reconstructRoutesByPath(flatRoutes, staticRoutes);

      expect(result.length).toBe(2); // Home + Dashboard

      // test nested structure
      const dashboardRoute = result.find((route) => route.name === 'Dashboard');
      if (dashboardRoute) {
        expect(dashboardRoute.children).toBeDefined();
        expect(dashboardRoute.children!.length).toBeGreaterThan(0);
      }
    });

    it('should calculate relative paths correctly', () => {
      const flatRoutes = router.getRoutes();
      const staticRoutes = router.options.routes;
      const result = reconstructRoutesByPath(flatRoutes, staticRoutes);

      const dashboardRoute = result.find((route) => route.name === 'Dashboard');
      if (dashboardRoute && dashboardRoute.children) {
        const settingsRoute = dashboardRoute.children.find(
          (child) => child.name === 'Settings',
        );
        if (settingsRoute) {
          // Settings 路由的相对路径应该是 'settings'，而不是 '/dashboard/settings'
          expect(settingsRoute.path).toBe('settings');

          // 检查 Settings 的子路由
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

    it('should process complex path hierarchy correctly', () => {
      // Create a more complex route structure for testing
      const complexPaths = [
        '/',
        '/dashboard',
        '/dashboard/profile',
        '/dashboard/settings',
        '/dashboard/settings/account',
        '/dashboard/settings/account/security',
        '/dashboard/settings/notifications',
        '/admin',
        '/admin/users',
        '/admin/system',
      ];

      const mockFlatRoutes = complexPaths.map((path, index) => ({
        path,
        name: path.split('/').pop() || 'Root',
        components: { default: { template: `<div>${path}</div>` } },
        meta: {},
        props: {},
      })) as any;

      const result = reconstructRoutesByPath(mockFlatRoutes, []);

      // should have 3 top-level routes: /, /dashboard, /admin
      expect(result.length).toBe(3);

      // test deep nested structure
      const dashboardRoute = result.find((route) => route.name === 'dashboard');
      if (dashboardRoute && dashboardRoute.children) {
        const settingsRoute = dashboardRoute.children.find(
          (child) => child.name === 'settings',
        );
        if (settingsRoute && settingsRoute.children) {
          const accountRoute = settingsRoute.children.find(
            (child) => child.name === 'account',
          );
          if (accountRoute && accountRoute.children) {
            const securityRoute = accountRoute.children.find(
              (child) => child.name === 'security',
            );
            expect(securityRoute).toBeDefined();
            expect(securityRoute?.path).toBe('security');
          }
        }
      }
    });
  });
});
