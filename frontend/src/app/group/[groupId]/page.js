"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, usePathname } from "next/navigation";
import axios from "@/lib/axios";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

function SidebarLink({ label, href, pathname, router }) {
  const isActive = pathname === href;
  return (
    <button
      onClick={() => router.push(href)}
      className={`block text-left px-3 py-2 rounded transition w-full ${
        isActive
          ? "bg-emerald-100 text-emerald-800 font-semibold"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {label}
    </button>
  );
}

export default function GroupPage() {
  const { groupId } = useParams();
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [netBalances, setNetBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [form, setForm] = useState({
    title: "",
    description: "",
    amount: "",
    paidBy: "",
    splitBetween: [],
  });
  const [loading, setLoading] = useState(false);
  const [expenseSearch, setExpenseSearch] = useState("");
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const fetchData = async () => {
      try {
        const res1 = await axios.get(`/api/group/my-group/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroup(res1.data);

        const res2 = await axios.get(`/api/group/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log(res2.data)
        setExpenses(res2.data);

        const res3 = await axios.get(`/api/expenses/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNetBalances(res3.data.netBalances);
        setSettlements(res3.data.settlements);
      } catch {
        toast.error("Failed to load group data");
        router.push("/dashboard");
      }
    };

    fetchData();
  }, [groupId]);

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem("token");

    try {
      const res = await axios.post(
        "/api/expenses/add",
        {
          title: form.title,
          description: form.description,
          amount: Number(form.amount),
          paidBy: form.paidBy,
          groupId,
          splitBetween: form.splitBetween,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Expense added!");

      // ✅ Update local state without reload
      setExpenses((prev) => [res.data.expense, ...prev]);

      // ✅ Clear form
      setForm({
        title: "",
        description: "",
        amount: "",
        paidBy: "",
        splitBetween: [],
      });
      console.log(form);
    } catch (err) {
      console.log(form);
      console.log(err);
      toast.error("Error adding expense");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const filteredExpenses = expenses.filter((e) =>
    e.title.toLowerCase().includes(expenseSearch.toLowerCase())
  );

  if (!group) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      <Toaster />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-white border-r border-gray-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-emerald-600 mb-10">
          ExpenseSplit
        </h2>
        <nav className="flex-1 space-y-4">
          <SidebarLink
            label="Dashboard"
            href="/dashboard"
            pathname={pathname}
            router={router}
          />
          <SidebarLink
            label="Create Group"
            href="/group/create"
            pathname={pathname}
            router={router}
          />
          <SidebarLink
            label="Group Details"
            href={`/group/${groupId}`}
            pathname={pathname}
            router={router}
          />
          <SidebarLink
            label="Payments & Settlements"
            href={`/group/${groupId}/balances`}
            pathname={pathname}
            router={router}
          />
        </nav>
        <button
          onClick={logout}
          className="mt-10 bg-red-500 text-white text-sm px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b z-20 flex items-center justify-between px-4 py-3 shadow-sm">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gray-600 text-2xl"
        >
          ☰
        </button>
        <h1 className="text-lg font-bold text-emerald-600">ExpenseSplit</h1>
        <button onClick={logout} className="text-sm text-red-500">
          Logout
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <aside className="w-64 bg-white p-6 border-r shadow animate-slide-right z-50">
            <button
              onClick={() => setSidebarOpen(false)}
              className="mb-4 text-gray-600"
            >
              ✕ Close
            </button>
            <SidebarLink
              label="Dashboard"
              href="/dashboard"
              pathname={pathname}
              router={router}
            />
            <SidebarLink
              label="Create Group"
              href="/group/create"
              pathname={pathname}
              router={router}
            />
            <SidebarLink
              label="Group Details"
              href={`/group/${groupId}`}
              pathname={pathname}
              router={router}
            />
            <SidebarLink
              label="Payments & Settlements"
              href={`/group/${groupId}/balances`}
              pathname={pathname}
              router={router}
            />
          </aside>
          <div
            className="flex-1 bg-black bg-opacity-30"
            onClick={() => setSidebarOpen(false)}
          ></div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 mt-16 md:mt-0 p-4 md:p-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
          <div>
            <h1 className="text-3xl font-bold text-emerald-700">
              {group.name}
            </h1>
            <p className="text-sm text-gray-500">
              {group.description || "No description"}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Created by:{" "}
              <span className="font-medium">{group.createdBy?.name}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="bg-emerald-100 border border-emerald-300 text-emerald-700 px-3 py-1 rounded text-sm hover:bg-emerald-200"
            >
              {showMembers ? "Hide Members" : `${group.members.length} Members`}
            </button>
            <Link
              href={`/group/${groupId}/balances`}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm"
            >
              Payments & Settlements
            </Link>
          </div>
        </div>

        {/* Members List */}
        {showMembers && (
          <div className="mb-6 bg-white border rounded p-4 shadow-sm overflow-x-auto">
            <h3 className="text-sm font-semibold mb-2"> {group.members.length} Members</h3>
            <ul className="text-sm text-gray-700 list-disc list-inside">
              {group.members.map((m) => (
                <li key={m._id}>
                  {m.name} 
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add Expense */}
          <div className="space-y-6">
            <div className="bg-white rounded shadow p-4">
              <h2 className="text-lg font-semibold mb-2">Add Expense</h2>
              <form onSubmit={handleExpenseSubmit} className="space-y-2">
                <input
                  type="text"
                  placeholder="Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                  required
                />

                <input
                  type="text"
                  placeholder="Description (Optional)"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full border p-2 rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                  required
                />
                <select
                  value={form.paidBy}
                  onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
                  className="w-full border p-2 rounded text-sm"
                  required
                >
                  <option value="">Paid By</option>
                  {group.members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </select>

                <div className="flex flex-wrap gap-2 text-sm">
                  <label className="flex items-center gap-1 font-medium">
                    <input
                      type="checkbox"
                      checked={
                        form.splitBetween.length === group.members.length
                      }
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setForm((prev) => ({
                          ...prev,
                          splitBetween: checked
                            ? group.members.map((m) => m._id)
                            : [],
                        }));
                      }}
                    />
                    All
                  </label>

                  {group.members.map((m) => (
                    <label key={m._id} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        value={m._id}
                        checked={form.splitBetween.includes(m._id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setForm((prev) => ({
                            ...prev,
                            splitBetween: checked
                              ? [...prev.splitBetween, m._id]
                              : prev.splitBetween.filter((id) => id !== m._id),
                          }));
                        }}
                      />
                      {m.name}
                    </label>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition text-sm"
                >
                  {loading ? "Adding..." : "Add Expense"}
                </button>
              </form>
            </div>

            {/* Expense List */}
            <div className="bg-white rounded shadow p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">Expenses</h2>
                <input
                  type="text"
                  placeholder="Search..."
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  className="text-sm border p-1 px-2 rounded w-40"
                />
              </div>
              <div className="overflow-y-auto max-h-72 text-sm space-y-3 pr-2">
                {filteredExpenses.length === 0 ? (
                  <p className="text-gray-500">No expenses found.</p>
                ) : (
                  
                  filteredExpenses.map((exp) => (
                    <div
                      key={exp._id}
                      className="border p-2 rounded hover:bg-gray-50 space-y-1"
                    >
                      {/* Main Title */}
                      <p className="text-base font-semibold text-emerald-700">
                        {exp.title}
                      </p>

                      {/* Optional Description */}
                      {exp.description && (
                        <p className="text-sm text-gray-600">
                          {exp.description}
                        </p>
                      )}

                      {/* Amount and Paid By */}
                      <p className="text-sm text-gray-700">
                        ₹{exp.amount} • Paid by{" "}
                        <strong>{exp.paidBy?.name || exp.paidBy}</strong>
                      </p>

                      {/* Split Between */}
                      <p className="text-xs text-gray-500">
                        Split: {exp.splitBetween?.join(", ") || "N/A"}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded shadow p-4 max-h-[700px] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-2">Summary</h2>
            <table className="w-full text-sm text-left border mb-4">
  <thead className="bg-gray-100">
    <tr>
      <th className="p-2 border">Member Name</th>
      <th className="p-2 border">Amount Owed (Per Person)</th>
    </tr>
  </thead>
  <tbody>
    {netBalances.map((b, i) => (
      <tr key={i}>
        <td className="p-2 border">{b.name}</td>
        <td className="p-2 border">₹{b.totalOwes}</td>
      </tr>
    ))}
  </tbody>
</table>

            <h3 className="text-sm font-medium mb-1">Settlements</h3>
             <p className="text-xs text-gray-500 italic mt-1">
        (Note: This is normal for new groups — no payments have been made yet.)
      </p>
            {settlements.length === 0 ? (
              <p className="text-gray-500 text-sm">No settlements</p>
            ) : (
              
              <ul className="text-sm list-disc list-inside mb-4">
                {settlements.map((s, i) => (
                  <li key={i}>
                    {s.from} pays ₹{s.amount} to {s.to}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
