"use client";

import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { useRouter, usePathname } from "next/navigation";
import { Toaster, toast } from "react-hot-toast";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const logout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return router.push("/login");

  axios.get("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
    .then((res) => {
      setUser(res.data);
      return axios.get("/api/group/my-group", {
        headers: { Authorization: `Bearer ${token}` },
      });
    })
    .then((res) => {
      setGroups(res.data);
      setLoading(false);
    })
    .catch((err) => {
      console.error(err);
      toast.error("Session expired. Please log in again.");
      router.push("/login");
    });
}, []);


  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-emerald-600 mb-10">ExpenseSplit</h2>
        <nav className="flex-1 space-y-3">
          <SidebarLink label="Dashboard" href="/dashboard" pathname={pathname} router={router} />
          <SidebarLink label="Create Group" href="/group/create" pathname={pathname} router={router} />
        </nav>
        <button
          onClick={logout}
          className="mt-10 bg-red-500 text-white px-4 py-2 text-sm rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-emerald-600">ExpenseSplit</h2>
          <div className="flex gap-2">
            <button
              onClick={() => router.push("/group/create")}
              className="bg-emerald-600 text-white px-4 py-1.5 rounded hover:bg-emerald-700 text-sm"
            >
              + Group
            </button>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        {loading ? (
          <SkeletonLoader />
        ) : (
          <>
            <header className="mb-10">
              <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
              <p className="text-gray-600 mt-1">
                Manage group expenses, track balances, and stay financially transparent with friends.
              </p>
              
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard label="Active Groups" value={groups.length} color="emerald" />
                <StatCard label="Total Members" value={groups.reduce((acc, g) => acc + g.members.length, 0)} color="blue" />
                <StatCard label="Expenses Tracked" value="Coming Soon" color="purple" />
              </div>
            </header>

            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Your Groups</h2>
                <button
                  onClick={() => router.push("/group/create")}
                  className="bg-emerald-600 text-white text-sm px-4 py-2 rounded hover:bg-emerald-700"
                >
                  + Create Group
                </button>
              </div>

              {groups.length === 0 ? (
                <div className="bg-white border border-gray-200 p-6 rounded-md text-center text-gray-500">
                  No groups yet. Start by creating one now.
                </div>
              ) : (
                <ul className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {groups.map((group) => (
                    <li
                      key={group._id}
                      className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold text-emerald-700">{group.name}</h3>
                          <p className="text-sm text-gray-500">{group.members.length} members</p>
                        </div>
                        <button
                          className="text-sm text-emerald-600 hover:underline"
                          onClick={() => router.push(`/group/${group._id}`)}
                        >
                          View →
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            
          </>
        )}
        <Toaster position="top-right" />
      </main>
    </div>
  );
}

function SidebarLink({ label, href, pathname, router }) {
  const isActive = pathname === href;
  return (
    <button
      onClick={() => router.push(href)}
      className={`w-full text-left px-4 py-2 rounded-md transition text-sm ${
        isActive
          ? "bg-emerald-100 text-emerald-800 font-medium"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}

function SkeletonLoader() {
  return (
    <div>
      <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((key) => (
          <div key={key} className="bg-white border border-gray-200 p-5 rounded-lg animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-100 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colorMap = {
    emerald: "text-emerald-600 bg-emerald-50",
    blue: "text-blue-600 bg-blue-50",
    purple: "text-purple-600 bg-purple-50",
  };
  return (
    <div className={`rounded-lg p-4 border ${colorMap[color]} shadow-sm`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}
