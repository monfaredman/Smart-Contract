import React from "react";
import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router-dom";
import Layout from "./layout/Home";
import UserDashboard from "./pages/dashboard";
import UserRegister from "./pages/register-user";
import Admin from "./pages/admin";
import LoginAdmin from "./pages/loginAdmin";
import { fakeAuthProvider } from "./middleware/auth";
import "./App.css";

// Initialize the auth provider
async function initializeAuthProvider() {
  await fakeAuthProvider.init();
}

// Route loaders
async function userLoader() {
  await initializeAuthProvider();

  if (fakeAuthProvider.isAuthenticated) {
    return null; // User is authenticated, proceed to UserDashboard
  }
  return redirect("/register"); // Redirect to UserRegister if not authenticated
}

async function adminLoader() {
  await initializeAuthProvider();

  if (fakeAuthProvider.isAdmin) {
    return null; // User is authenticated, proceed to UserDashboard
  }
  return redirect("/register"); // Redirect to UserRegister if not authenticated
}

async function registerLoader() {
  await initializeAuthProvider();

  if (fakeAuthProvider.isAuthenticated) {
    return redirect("/"); // Redirect to UserDashboard if already authenticated
  }
  return null; // Proceed to UserRegister if not authenticated
}

// Create the router with route configuration
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        loader: userLoader,
        element: <UserDashboard />,
      },
      {
        path: "register",
        loader: registerLoader,
        element: <UserRegister />,
      },
      {
        path: "admin",
        loader: adminLoader,
        element: <Admin />,
      },
      {
        path: "loginAdmin",
        element: <LoginAdmin />,
      },
    ],
  },
]);

export default function App() {
  return (
    <RouterProvider router={router} fallbackElement={<p>Initial Load...</p>} />
  );
}
