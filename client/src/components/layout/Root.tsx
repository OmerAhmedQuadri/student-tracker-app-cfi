import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export default function Root() {
  return (
    <AuthProvider>
      <Toaster position="top-right" />
      <Outlet />
    </AuthProvider>
  );
}
