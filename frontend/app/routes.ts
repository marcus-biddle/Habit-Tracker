import { route, layout, index, type RouteConfig, prefix } from "@react-router/dev/routes";

export default [
  route("/dashboard?", "./pages/dashboard.tsx", [
    index("./pages/home.tsx"),
    // ...prefix("analytics", [
    //   layout("./pages/analytics/layout.tsx", [
    //     route("overview", "./pages/analytics/overview.tsx"),
    //   ]),
    // ]),
    // ...prefix("users", [
    //   layout("./pages/users/layout.tsx", [
    //     route("explore", "./pages/users/explore.tsx"),
    //     route("profile/:userid", "./pages/users/profile.tsx")
    //   ]),
    // ]),
    ...prefix("habits", [
      layout("./pages/habits/layout.tsx", [
        index("./pages/habits/overview.tsx"),
        route(":habitId", "./pages/habits/habit.tsx"),
      ]),
    ]),
    route("*", "catchall.tsx"),
  ]),
  layout("./pages/auth/layout.tsx", [
    route("login", "./pages/auth/login.tsx"),
    route("register", "./pages/auth/register.tsx"),
  ]),
] satisfies RouteConfig;
