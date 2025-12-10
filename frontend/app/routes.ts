import {
  route,
  layout,
  index,
  type RouteConfig,
  prefix,
} from "@react-router/dev/routes";

/**
 * React Router v7 Routes Configuration
 * 
 * Route ordering matters - more specific routes should come before less specific ones.
 * Catchall routes (*) should be placed last in their respective sections.
 * 
 * Route Structure:
 * - Public routes: Landing, Auth pages
 * - Protected routes: Dashboard and all nested routes
 * - Error handling: Catchall routes for 404s
 */

export default [
  // Static assets
  route("/favicon.ico", "./routes/favicon.ico.tsx"),

  // Public Routes
  // Landing page - explicitly defined root route (accessible to all users)
  route("/", "./pages/landing.tsx"),

  // Authentication routes - public access
  layout("./pages/auth/layout.tsx", [
    route("login", "./pages/auth/login.tsx"),
    route("register", "./pages/auth/register.tsx"),
  ]),

  // Protected Dashboard Routes
  // All dashboard routes require authentication (handled by AuthContext)
  route("/dashboard", "./pages/dashboard.tsx", [
    // Dashboard index - home page
    index("./pages/home.tsx"),

    // Analytics page
    route("analytics", "./pages/home-analytics.tsx"),

    // Habits routes - nested under /dashboard/habits
    ...prefix("habits", [
      layout("./pages/habits/layout.tsx", [
        // Habits overview - index route for /dashboard/habits
        index("./pages/habits/overview.tsx"),
        // Individual habit detail page - dynamic route
        route(":habitId", "./pages/habits/habit.tsx"),
      ]),
    ]),
  ]),

  // Root catchall - 404 for any unmatched routes
  // This should be last to catch all unmatched routes
  route("*", "./catchall.tsx"),
] satisfies RouteConfig;
