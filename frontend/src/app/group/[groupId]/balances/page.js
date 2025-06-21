"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "@/lib/axios";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

function SidebarLink({ label, href, pathname, router }) {
  const isActive = pathname === href;
  return (
    <button
      onClick={() => router.push(href)}
      className={`block w-full text-left px-3 py-2 rounded transition ${
        isActive
          ? "bg-emerald-100 text-emerald-700 font-semibold"
          : "text-gray-700 hover:bg-emerald-50"
      }`}
    >
      {label}
    </button>
  );
}

export default function GroupBalancesPage() {
  const { groupId } = useParams();
  const router = useRouter();
  const pathname = `/group/${groupId}/balances`;

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [netBalances, setNetBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [payments, setPayments] = useState([]);
  const [showPayments, setShowPayments] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [members, setMembers] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    const fetchData = async () => {
      try {
        const res = await axios.get(`/api/expenses/balances/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNetBalances(res.data.netBalances);
        setSettlements(res.data.settlements);
        setPayments(res.data.payments);

        const groupRes = await axios.get(`/api/group/my-group/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMembers(groupRes.data.members);
      } catch {
        toast.error("Error loading data");
        router.push("/dashboard");
      }
    };
    fetchData();
  }, [groupId]);

  const handleAddPayment = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return router.push("/login");

    try {
      await axios.post(
        "/api/payments/settle",
        { from, to, amount, groupId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Payment submitted!");
      setFrom("");
      setTo("");
      setAmount("");
      // refresh data
      const res = await axios.get(`/api/expenses/balances/${groupId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNetBalances(res.data.netBalances);
      setSettlements(res.data.settlements);
      setPayments(res.data.payments);
    } catch {
      toast.error("Payment failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <Toaster />

      {/* Sidebar for desktop */}
      <aside className="hidden md:flex fixed top-0 left-0 h-screen w-64 flex-col bg-white border-r p-6 shadow z-30">
        <h2 className="text-2xl font-bold text-emerald-600 mb-10">
          ExpenseSplit
        </h2>
        <nav className="flex-1 space-y-2">
          <SidebarLink
            className="cursor-pointer"
            label="Dashboard"
            href="/dashboard"
            pathname={pathname}
            router={router}
          />
          <SidebarLink
            className="cursor-pointer"
            label="Create Group"
            href="/group/create"
            pathname={pathname}
            router={router}
          />
          <SidebarLink
            className="cursor-pointer"
            label="Group Details"
            href={`/group/${groupId}`}
            pathname={pathname}
            router={router}
          />
          <SidebarLink
            className="cursor-pointer"
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

      {/* Mobile header and overlay */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 bg-white border-b p-4 flex justify-between items-center">
        <button onClick={() => setSidebarOpen(true)} className="text-gray-700">
          ☰
        </button>
        <span className="font-bold text-emerald-600">ExpenseSplit</span>
        <button onClick={logout} className="text-red-500">
          Logout
        </button>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 flex">
          <aside className="w-64 bg-white border-r p-6 shadow animate-slide-right">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-700 mb-4"
            >
              ✕ Close
            </button>
            <nav className="space-y-2">
              <SidebarLink
                className="cursor-pointer"
                label="Dashboard"
                href="/dashboard"
                pathname={pathname}
                router={router}
              />
              <SidebarLink
                className="cursor-pointer"
                label="Create Group"
                href="/group/create"
                pathname={pathname}
                router={router}
              />
              <SidebarLink
                className="cursor-pointer"
                label="Group Details"
                href={`/group/${groupId}`}
                pathname={pathname}
                router={router}
              />
            </nav>
          </aside>
          <div className="flex-1" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content area */}
      <main className="flex-1 md:ml-64 mt-16 md:mt-0 p-4 md:p-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-emerald-700">
            Group Balances & Payments
          </h1>
          <Link
            href={`/group/${groupId}`}
            className="text-sm text-emerald-600 underline"
          >
            ← Back to Group
          </Link>
        </div>

        <div className="bg-white p-6 rounded shadow-md">
          {/* Net Balances */}
          <h2 className="text-xl font-semibold mb-4">Final Settlement Balances</h2>
<table className="w-full text-sm table-auto border-collapse mb-2">
  <thead>
    <tr className="border-b bg-gray-100">
      <th className="text-left py-2 px-4">Member Name</th>
      <th className="text-left py-2 px-4">Net Balance (₹)</th>
    </tr>
  </thead>
  <tbody>
    {netBalances.map((p, i) => (
      <tr key={i} className="border-b hover:bg-gray-50">
        <td className="py-2 px-4">{p.name}</td>
        <td
          className={`py-2 px-4 ${
            p.netBalance > 0
              ? "text-green-600"
              : p.netBalance < 0
              ? "text-red-600"
              : "text-gray-600"
          }`}
        >
          {p.netBalance > 0 ? `+₹${p.netBalance}` : p.netBalance < 0 ? `-₹${Math.abs(p.netBalance)}` : "₹0"}
        </td>
      </tr>
    ))}
  </tbody>
</table>

<p className="text-sm text-gray-600 italic">
  <span className="text-green-600 font-medium">+ve</span> = person should receive money,&nbsp;
  <span className="text-red-600 font-medium">-ve</span> = person owes money,&nbsp;
  <span className="text-gray-600 font-medium">0</span> = balance is settled
</p>



          {/* Payment Form */}
          <h2 className="text-xl font-semibold mb-4">Add Payment</h2>
          <form
            onSubmit={handleAddPayment}
            className="grid md:grid-cols-3 gap-4 mb-8"
          >
            <div>
              <label className="block text-sm mb-1">From</label>
              <select
                required
                className="w-full border p-2 rounded"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              >
                <option value="">Select person</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">To</label>
              <select
                required
                className="w-full border p-2 rounded"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              >
                <option value="">Select person</option>
                {members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Amount (₹)</label>
              <input
                required
                type="number"
                className="w-full border p-2 rounded"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <button
                type="submit"
                className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded transition cursor-pointer"
              >
                Submit Payment
              </button>
            </div>
          </form>

          {/* Settlements & History */}
          <h2 className="text-xl font-semibold mb-2">Settlements</h2>
          {settlements.length === 0 ? (
            <p className="text-gray-500 text-sm mb-4">No settlements needed.</p>
          ) : (
            <ul className="text-sm space-y-1 mb-4">
              {settlements.map((s, i) => (
                <li key={i}>
                  <strong>{s.from}</strong> pays <strong>₹{s.amount}</strong> to{" "}
                  <strong>{s.to}</strong>
                </li>
              ))}
            </ul>
          )}

          <button
            onClick={() => setShowPayments((prev) => !prev)}
            className="text-emerald-600 underline mb-4 text-sm cursor-pointer "
          >
            {showPayments ? "Hide" : "Show"} Payment History
          </button>

          {showPayments && (
            <table className="w-full text-sm table-auto border-collapse bg-white shadow rounded mb-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left py-2 px-4">From</th>
                  <th className="text-left py-2 px-4">To</th>
                  <th className="text-left py-2 px-4">Amount</th>
                  <th className="text-left py-2 px-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-3 px-4 text-gray-500">
                      No payments yet.
                    </td>
                  </tr>
                ) : (
                  [...payments].reverse().map((p, i) => (
                    <tr key={i} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-4">{p.from}</td>
                      <td className="py-2 px-4">{p.to}</td>
                      <td className="py-2 px-4">₹{p.amount}</td>
                      <td className="py-2 px-4">
                        {new Date(p.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
