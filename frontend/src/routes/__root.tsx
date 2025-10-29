import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools"; // Optional: For devtools

export const Route = createRootRoute({
  component: () => (
    <>
      <div style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
        <a href={"/"}>Home</a> | <a href={"/login"}>Login</a> |{" "}
        <a href={"/tasks"}>Tasks</a>
      </div>
      <hr />
      <Outlet /> {/* Renders the current child route component */}
      <TanStackRouterDevtools />
    </>
  ),
});
