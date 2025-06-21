"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import toast from "react-hot-toast";

export default function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError(""); // clear inline error on input
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Registering...");
    try {
      const res = await axios.post(`/api/auth/register`, form);
      toast.dismiss(loadingToast);

      toast.success(res.data.message || "Registered successfully");
      router.push("/login");
    } catch (err) {
      toast.dismiss(loadingToast);
      const msg = err.response?.data?.message || "Registration failed";
      setError(msg);             // set inline error
      toast.error(msg);          // show toast error
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 flex items-center justify-center px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl p-10 space-y-6 animate-fade-in"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-blue-700">Create Account</h2>
          <p className="text-gray-500 text-sm mt-2">
            Sign up to get started!
          </p>
        </div>

        {error && (
          <p className="text-center text-red-600 text-sm font-medium -mt-2">
            {error}
          </p>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm text-gray-600">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              id="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="text-sm text-gray-600">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              required
            />
          </div>

          <div className="relative">
            <label htmlFor="password" className="text-sm text-gray-600">
              Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10 transition"
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-9 right-3 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 mt-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition duration-200 shadow-md"
        >
          Register
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 font-medium hover:underline">
            Login here
          </a>
        </p>
      </form>
    </div>
  );
}
