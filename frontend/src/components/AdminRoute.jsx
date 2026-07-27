import { Navigate } from "react-router-dom";
import { isAdmin } from "../utils/auth";

export default function AdminRoute({ children }) {
  if (!isAdmin()) {
    return <Navigate to="/conferences" replace />;
  }

  return children;
}
