import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("register", "routes/register.tsx"),
  route("forgot-password", "routes/forgot-password.tsx"),
  route("reset-password", "routes/reset-password.tsx"),
  route("events", "routes/events.tsx"),
  route("admin", "routes/admin.tsx"),
  route("log-hours", "routes/log-hours.tsx"),
  route("tasks", "routes/tasks.tsx"),
  route("*", "routes/catch-all.tsx"),
] satisfies RouteConfig;
