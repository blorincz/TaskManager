import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tasks")({
  component: () => (
    <div style={{ padding: "10px" }}>
      <h3>Tasks</h3>
    </div>
  ),
});
