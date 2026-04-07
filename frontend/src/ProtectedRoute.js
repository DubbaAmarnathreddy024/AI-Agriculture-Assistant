import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  // ❌ If not logged in → block
  if (!token) {
    return <Navigate to="/" />;
  }

  // ✅ If logged in → allow
  return children;
};

export default ProtectedRoute;
