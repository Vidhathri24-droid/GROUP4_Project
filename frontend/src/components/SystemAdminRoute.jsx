import { Navigate } from "react-router-dom";
import { getToken, isSystemAdmin } from "../utils/auth";

export default function SystemAdminRoute({ children }) {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }

  if (!isSystemAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
