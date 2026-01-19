import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

type FormState = {
  email: string;
  password: string;
  remember: boolean;
};

export default function Login() {
  const navigate = useNavigate();
  const { login: authLogin, isAuthenticated, user } = useAuth();

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "admin") navigate("/admin/dashboard");
      else if (user.role === "mentor") navigate("/mentor/dashboard");
      else navigate("/student/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/api/login",
        {
          email: form.email,
          password: form.password,
        },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200) {
        toast.success(response.data.message || "Login successful!");
        // Update global auth state
        authLogin(response.data.user);
      }
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || "Something went wrong";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
        <form onSubmit={handleSubmit} className="flex flex-col text-center">
          <h3 className="mb-3 text-4xl font-extrabold text-gray-900">
            Sign In
          </h3>
          <p className="mb-6 text-gray-700">Enter your email and password</p>

          {/* Email */}
          <label className="mb-2 text-sm text-left text-gray-900 font-medium">
            Email*
          </label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="mail@loopple.com"
            className="w-full px-5 py-4 mb-6 rounded-2xl bg-gray-100 text-sm outline-none focus:bg-gray-200 text-gray-900 placeholder:text-gray-400"
          />

          {/* Password */}
          <label className="mb-2 text-sm text-left text-gray-900 font-medium">
            Password*
          </label>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Enter a password"
            className="w-full px-5 py-4 mb-5 rounded-2xl bg-gray-100 text-sm outline-none focus:bg-gray-200 text-gray-900 placeholder:text-gray-400"
          />

          {/* Remember + Forgot */}
          <div className="flex justify-between items-center mb-8 text-sm">
            <label className="flex items-center gap-2 cursor-pointer text-gray-600">
              <input
                type="checkbox"
                checked={form.remember}
                onChange={() => setForm({ ...form, remember: !form.remember })}
                className="accent-indigo-600 w-4 h-4 rounded"
              />
              Keep me logged in
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 mb-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition focus:ring-4 focus:ring-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
