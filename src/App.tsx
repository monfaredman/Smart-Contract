import React from "react";
import {
  RouterProvider,
  createBrowserRouter,
  redirect,
} from "react-router-dom";
import Layout from "./layout/Home";
import UserDashboard from "./pages/dashboard";
import UserRegister from "./pages/register-user";
import { fakeAuthProvider } from "./middleware/auth";
import "./App.css";

const router = createBrowserRouter([
  {
    id: "root",
    path: "/",
    Component: Layout,
    children: [
      {
        index: true,
        loader: userLoader,
        Component: UserDashboard,
      },
      {
        path: "register",
        Component: UserRegister,
      },
    ],
  },
]);

export default function App() {
  return (
    <RouterProvider router={router} fallbackElement={<p>Initial Load...</p>} />
  );
}

async function userLoader() {
  if (fakeAuthProvider.isAuthenticated) {
    return redirect("/");
  }
  return redirect("/register");
}
