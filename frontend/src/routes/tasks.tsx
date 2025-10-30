import { createFileRoute } from "@tanstack/react-router";
import { TaskDashboard } from "../components/TaskDashboard";
import { ProtectedRoute } from "../components/ProtectedRoute";

export const Route = createFileRoute("/tasks")({
  component: () => (
    <ProtectedRoute>
      <TaskDashboard />
    </ProtectedRoute>
  ),
});
