import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useAuth } from "../hooks/useAuth";
import { LoginForm } from "../components/LoginForm";

export const Route = createFileRoute("/login")({
  component: LoginComponent,
});

function LoginComponent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" />;
  }

  return <LoginForm />;
}
