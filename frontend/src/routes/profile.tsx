import { createFileRoute } from "@tanstack/react-router";
import { UserProfile } from "../components/UserProfile";
import { ProtectedRoute } from "../components/ProtectedRoute";

export const Route = createFileRoute("/profile")({
  component: () => (
    <ProtectedRoute>
      <UserProfile />
    </ProtectedRoute>
  ),
});
