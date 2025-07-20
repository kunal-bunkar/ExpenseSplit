"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from "@/lib/axios";
import toast from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function LoginForm() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setError('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("Logging in...");
    try {
      const res = await axios.post(`/api/auth/login`, form);
      toast.dismiss(loadingToast);
      toast.success(res.data.message || "Login successful");
      localStorage.setItem('token', res.data.token);
      router.push('/dashboard');
    }catch (err)  {
  console.log(err); // 🔍 add this
  toast.dismiss(loadingToast);
  const msg = err.response?.data?.message || 'Login failed';
  setError(msg);
  toast.error(msg);
}

  };

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl p-10 space-y-6 animate-fade-in"
    >
      <div className="text-center">
        <h2 className="text-3xl font-bold text-blue-700">Welcome Back</h2>
        <p className="text-gray-500 text-sm mt-2">Login to your account</p>
      </div>

      {error && (
        <p className="text-center text-red-600 text-sm font-medium -mt-2">
          {error}
        </p>
      )}

      <div className="space-y-4">
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
        Login
      </button>

      <p className="text-center text-sm text-gray-500 mt-4">
        Don&apos;t have an account?{" "}
        <a href="/register" className="text-blue-600 font-medium hover:underline">
          Register here
        </a>
      </p>
    </form>
  );
}
