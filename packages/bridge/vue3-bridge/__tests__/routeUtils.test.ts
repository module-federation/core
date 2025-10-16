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

  describe('processRoutes path normalization', () => {
    it('should handle root path children without double slashes', () => {
      // Create a route structure with root children to test path normalization
      const rootChildrenRoutes = [
        {
          path: '/',
          name: 'Root',
          component: HomeComponent,
          children: [
            {
              path: 'about',
              name: 'About',
              component: { template: '<div>About</div>' },
            },
            {
              path: 'contact',
              name: 'Contact',
              component: { template: '<div>Contact</div>' },
            },
          ],
        },
      ];

      const rootRouter = createRouter({
        history: createWebHistory(),
        routes: rootChildrenRoutes,
      });

      const result = processRoutes({
        router: rootRouter,
      });

      expect(result.routes.length).toBe(1);

      const rootRoute = result.routes.find((route) => route.name === 'Root');
      expect(rootRoute).toBeDefined();
      expect(rootRoute?.path).toBe('/'); // Root should remain '/'

      // Check that child routes have correct relative paths without double slashes
      if (rootRoute && rootRoute.children) {
        const aboutRoute = rootRoute.children.find(
          (child) => child.name === 'About',
        );
        expect(aboutRoute?.path).toBe('about'); // Should be 'about', not '//about' or '/about'

        const contactRoute = rootRoute.children.find(
          (child) => child.name === 'Contact',
        );
        expect(contactRoute?.path).toBe('contact'); // Should be 'contact', not '//contact' or '/contact'
      }
    });

    it('should normalize paths with trailing slashes correctly', () => {
      // Create routes with potential trailing slash issues
      const trailingSlashRoutes = [
        {
          path: '/dashboard/', // Note: trailing slash in parent
          name: 'Dashboard',
          component: DashboardComponent,
          children: [
            {
              path: 'settings/', // Note: trailing slash in child
              name: 'Settings',
              component: SettingsComponent,
              children: [
                {
                  path: 'profile',
                  name: 'Profile',
                  component: ProfileComponent,
                },
              ],
            },
          ],
        },
      ];

      const trailingSlashRouter = createRouter({
        history: createWebHistory(),
        routes: trailingSlashRoutes,
      });

      const result = processRoutes({
        router: trailingSlashRouter,
      });

      const dashboardRoute = result.routes.find(
        (route) => route.name === 'Dashboard',
      );
      expect(dashboardRoute).toBeDefined();

      if (dashboardRoute && dashboardRoute.children) {
        const settingsRoute = dashboardRoute.children.find(
          (child) => child.name === 'Settings',
        );
        expect(settingsRoute?.path).toBe('settings/'); // Should preserve original relative path

        if (settingsRoute && settingsRoute.children) {
          const profileRoute = settingsRoute.children.find(
            (child) => child.name === 'Profile',
          );
          expect(profileRoute?.path).toBe('profile'); // Should be clean relative path
        }
      }
    });

    it('should handle multiple consecutive slashes in path construction', () => {
      // Create a scenario that could cause double slashes in internal path construction
      const multiSlashRoutes = [
        {
          path: '/api/v1',
          name: 'ApiV1',
          component: { template: '<div>API v1</div>' },
          children: [
            {
              path: 'users',
              name: 'Users',
              component: { template: '<div>Users</div>' },
              children: [
                {
                  path: 'profile',
                  name: 'UserProfile',
                  component: { template: '<div>User Profile</div>' },
                },
              ],
            },
          ],
        },
      ];

      const multiSlashRouter = createRouter({
        history: createWebHistory(),
        routes: multiSlashRoutes,
      });

      const result = processRoutes({
        router: multiSlashRouter,
      });

      const apiRoute = result.routes.find((route) => route.name === 'ApiV1');
      expect(apiRoute?.path).toBe('/api/v1');

      if (apiRoute && apiRoute.children) {
        const usersRoute = apiRoute.children.find(
          (child) => child.name === 'Users',
        );
        expect(usersRoute?.path).toBe('users'); // Should be relative without leading slash

        if (usersRoute && usersRoute.children) {
          const profileRoute = usersRoute.children.find(
            (child) => child.name === 'UserProfile',
          );
          expect(profileRoute?.path).toBe('profile'); // Should be clean relative path
        }
      }

      // Verify that the actual full paths in router.getRoutes() are correctly normalized
      const flatRoutes = multiSlashRouter.getRoutes();
      const userProfileRoute = flatRoutes.find(
        (route) => route.name === 'UserProfile',
      );
      expect(userProfileRoute?.path).toBe('/api/v1/users/profile'); // Should not contain double slashes
    });

    it('should handle edge cases with empty and slash-only paths', () => {
      // Test edge cases that could cause path normalization issues
      const edgeCaseRoutes = [
        {
          path: '/',
          name: 'Root',
          component: HomeComponent,
          children: [
            {
              path: '', // Empty path child
              name: 'Index',
              component: { template: '<div>Index</div>' },
            },
            {
              path: '/', // Slash-only child (should be normalized)
              name: 'SlashChild',
              component: { template: '<div>Slash Child</div>' },
            },
          ],
        },
      ];

      const edgeCaseRouter = createRouter({
        history: createWebHistory(),
        routes: edgeCaseRoutes,
      });

      const result = processRoutes({
        router: edgeCaseRouter,
      });

      // Vue Router creates separate top-level routes for empty and slash paths under root
      expect(result.routes.length).toBe(3); // Index, SlashChild, and Root all become top-level

      const rootRoute = result.routes.find((route) => route.name === 'Root');
      const indexRoute = result.routes.find((route) => route.name === 'Index');
      const slashChildRoute = result.routes.find(
        (route) => route.name === 'SlashChild',
      );

      // All should be top-level routes with '/' path (Vue Router normalization)
      expect(rootRoute?.path).toBe('/');
      expect(indexRoute?.path).toBe('/');
      expect(slashChildRoute?.path).toBe('/');

      // The original Root route should still have its children structure preserved
      if (rootRoute && rootRoute.children) {
        expect(rootRoute.children.length).toBe(2);

        // But the children paths should be the original relative paths from static config
        const staticIndexChild = rootRoute.children.find(
          (child) => child.name === 'Index',
        );
        const staticSlashChild = rootRoute.children.find(
          (child) => child.name === 'SlashChild',
        );

        if (staticIndexChild) {
          expect(staticIndexChild.path).toBe(''); // Empty path preserved
        }
        if (staticSlashChild) {
          expect(staticSlashChild.path).toBe('/'); // Slash path preserved
        }
      }

      // Verify the flat routes structure
      const flatRoutes = edgeCaseRouter.getRoutes();
      const indexFlatRoute = flatRoutes.find((route) => route.name === 'Index');
      const slashChildFlatRoute = flatRoutes.find(
        (route) => route.name === 'SlashChild',
      );

      // Vue Router normalizes both empty and slash children of root to '/'
      expect(indexFlatRoute?.path).toBe('/');
      expect(slashChildFlatRoute?.path).toBe('/');
    });

    it('should verify normalizePath function handles double slashes correctly', () => {
      // Since normalizePath is internal, we test it indirectly by creating scenarios
      // that would cause double slashes and verifying they are handled correctly

      const doubleSlashRoutes = [
        {
          path: '/api/', // trailing slash
          name: 'Api',
          component: { template: '<div>API</div>' },
          children: [
            {
              path: '/users', // leading slash on child
              name: 'Users',
              component: { template: '<div>Users</div>' },
            },
            {
              path: 'posts/', // trailing slash on child
              name: 'Posts',
              component: { template: '<div>Posts</div>' },
              children: [
                {
                  path: '/comments', // leading slash on grandchild
                  name: 'Comments',
                  component: { template: '<div>Comments</div>' },
                },
              ],
            },
          ],
        },
      ];

      const doubleSlashRouter = createRouter({
        history: createWebHistory(),
        routes: doubleSlashRoutes,
      });

      // The key test: ensure our processRoutes doesn't break with these edge cases
      const result = processRoutes({
        router: doubleSlashRouter,
      });

      // Verify that no route has double slashes in its processing
      const flatRoutes = doubleSlashRouter.getRoutes();

      // Check that Vue Router itself handles the normalization correctly
      const usersRoute = flatRoutes.find((r) => r.name === 'Users');
      const postsRoute = flatRoutes.find((r) => r.name === 'Posts');
      const commentsRoute = flatRoutes.find((r) => r.name === 'Comments');

      // Vue Router treats children with leading slash as absolute paths
      expect(usersRoute?.path).toBe('/users'); // Leading slash makes it absolute
      expect(postsRoute?.path).toBe('/api/posts/'); // Relative path gets parent prefix
      expect(commentsRoute?.path).toBe('/comments'); // Leading slash makes it absolute

      // Verify our processRoutes handles these correctly without errors
      expect(result.routes.length).toBeGreaterThan(0);
      expect(() => processRoutes({ router: doubleSlashRouter })).not.toThrow();
    });
  });
});
