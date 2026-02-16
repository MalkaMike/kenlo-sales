/**
 * ProtectedRoute is now a no-op wrapper since AuthGuard handles all auth.
 * Kept for backward compatibility with any remaining imports.
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // AuthGuard already handles authentication for all routes inside Layout.
  // This component is kept for backward compatibility.
  return <>{children}</>;
}
