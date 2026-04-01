import { lazy, Suspense } from "react";
import { ProtectedRoute } from "./ProtectedRoute";

const AdminDashboard = lazy(() =>
  import("./AdminDashboard").then((m) => ({ default: m.AdminDashboard }))
);

export function AdminProtected() {
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div
            style={{
              minHeight: "100vh",
              background: "#0D0D0D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#C9A96E",
              fontSize: "0.85rem",
              letterSpacing: "0.1em",
            }}
          >
            A carregar...
          </div>
        }
      >
        <AdminDashboard />
      </Suspense>
    </ProtectedRoute>
  );
}
