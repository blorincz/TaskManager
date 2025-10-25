import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <div style={{ padding: "10px" }}>
      <h3>Welcome Home!</h3>
    </div>
  ),
});
