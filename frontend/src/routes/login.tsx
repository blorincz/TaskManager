import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: () => (
    <div style={{ padding: "10px" }}>
      <h3>Login</h3>
    </div>
  ),
});
