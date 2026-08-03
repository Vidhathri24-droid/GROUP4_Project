import { Navigate } from "react-router-dom";
import { isAdmin } from "../utils/auth";

export default function AdminRoute({ children }) {

  console.log("User:", JSON.parse(localStorage.getItem("user")));
  console.log("Role:", JSON.parse(localStorage.getItem("user"))?.role);
  console.log("isAdmin:", isAdmin());

  if (!isAdmin()) {
    return <Navigate to="/conferences" replace />;
  }

  return children;
}