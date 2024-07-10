import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface PrivateRouteProps {
  children: JSX.Element;
  isAdmin?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  children,
  isAdmin = false,
}) => {
  const { token, isAdmin: userIsAdmin } = useAuth();

  if (!token) {
    return <Navigate to='/register' />;
  }

  if (isAdmin && !userIsAdmin) {
    return <Navigate to='/admin-login' />;
  }

  return children;
};

export default PrivateRoute;
