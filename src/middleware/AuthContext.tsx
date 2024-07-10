import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  token: string | null;
  isAdmin: boolean;
  login: (newToken: string, isAdmin: boolean) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedIsAdmin = localStorage.getItem("isAdmin") === "true";
    if (storedToken) {
      setToken(storedToken);
      setIsAdmin(storedIsAdmin);
    } else {
      navigate("/register");
    }
  }, []);

  const login = (newToken: string, isAdmin: boolean) => {
    setToken(newToken);
    setIsAdmin(isAdmin);
    localStorage.setItem("token", newToken);
    localStorage.setItem("isAdmin", isAdmin.toString());
    navigate(isAdmin ? "/admin-dashboard" : "/dashboard");
  };

  const logout = () => {
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem("token");
    localStorage.removeItem("isAdmin");
    navigate("/register");
  };

  return (
    <AuthContext.Provider value={{ token, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
