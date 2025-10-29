import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "../components/AdminDashboard";
import { ProtectedRoute } from "../components/ProtectedRoute";

export const Route = createFileRoute("/admin")({
  component: () => (
    <ProtectedRoute requiredRole="Admin">
      <AdminDashboard />
    </ProtectedRoute>
  ),
});
