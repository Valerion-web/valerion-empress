import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useApp } from "@/lib/app-context";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: user ? "/dashboard" : "/login", replace: true });
  }, [user, navigate]);
  return <Navigate to={user ? "/dashboard" : "/login"} />;
}
