import { route, layout, index, type RouteConfig, prefix } from "@react-router/dev/routes";

export default [
  route("/", "./routes/+dashboard.tsx", [
    index("./routes/+home.tsx"),
    ...prefix("analytics", [
      layout("./routes/analytics/layout.tsx", [
        route("overview", "./routes/analytics/overview.tsx"),
      ]),
    ]),
    ...prefix("users", [
      layout("./routes/users/layout.tsx", [
        route("explore", "./routes/users/explore.tsx"),
        route("profile/:userid", "./routes/users/profile.tsx")
      ]),
    ]),
    ...prefix("habits", [
      layout("./routes/habits/layout.tsx", [
        index("./routes/habits/overview.tsx"),
      ]),
    ]),
    route("*?", "catchall.tsx"),
  ]),
  layout("./routes/auth/layout.tsx", [
    route("login", "./routes/auth/login.tsx"),
    route("register", "./routes/auth/register.tsx"),
  ]),
] satisfies RouteConfig;
