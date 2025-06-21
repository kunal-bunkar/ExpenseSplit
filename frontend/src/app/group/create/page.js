'use client';

import { useEffect, useState } from 'react';
import axios from '@/lib/axios';
import { useRouter, usePathname } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast';

export default function CreateGroupPage() {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  const router = useRouter();
  const pathname = usePathname();

  const token = typeof window !== 'undefined' && localStorage.getItem('token');

  useEffect(() => {
    if (!token) return router.push('/login');

    axios
      .get('/api/auth/users', {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const userOptions = res.data.users.map((user) => ({
          value: user._id,
          label: `${user.name} (${user.email})`,
        }));
        setAllUsers(userOptions);
        setFilteredUsers(userOptions);
      })
      .catch(() => {
        toast.error('Failed to fetch users');
      });
  }, []);

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = allUsers.filter((u) =>
      u.label.toLowerCase().includes(lowerSearch)
    );
    setFilteredUsers(filtered);
    setCurrentPage(1);
  }, [searchTerm, allUsers]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!groupName.trim()) return toast.error('Group name is required');
    if (selectedOptions.length === 0)
      return toast.error('Select at least one member');

    try {
      const memberIDs = selectedOptions.map((opt) => opt.value);

      await axios.post(
        '/api/group/create',
        { name: groupName, description, memberIDs },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Group created!');
      router.push('/dashboard');
    } catch (err) {
      toast.error('Failed to create group');
    }
  };

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const startIdx = (currentPage - 1) * usersPerPage;
  const paginatedUsers = filteredUsers.slice(startIdx, startIdx + usersPerPage);

  const logout = () => {
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-[#F3F4F6] text-gray-800">
      <Toaster />

      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-emerald-600 mb-10">ExpenseSplit</h2>
        <nav className="flex-1 space-y-4">
          <SidebarLink label="Dashboard" href="/dashboard" pathname={pathname} router={router} />
          <SidebarLink label="Create Group" href="/group/create" pathname={pathname} router={router} />
        </nav>
        <button
          onClick={logout}
          className="mt-10 bg-red-500 text-white text-sm px-4 py-2 rounded hover:bg-red-600 transition"
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
              onClick={() => router.push("/dashboard")}
              className="bg-emerald-600 text-white px-4 py-1.5 rounded hover:bg-emerald-700 text-sm"
            >
              Dashboard
            </button>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-3 py-1.5 rounded hover:bg-red-600 text-sm"
            >
              Logout
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-md shadow-sm border"
        >
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-emerald-700">Create Group</h1>
            <button
              type="submit"
              className="bg-emerald-600 text-white px-4 py-2 rounded-md hover:bg-emerald-700 transition text-sm"
            >
              + Create
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Group Name
            </label>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Optional description"
              className="mt-1 w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-emerald-500"
            ></textarea>
          </div>

          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search & Select Members
            </label>
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full mb-2 p-2 border rounded-md text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <div className="max-h-52 overflow-y-auto border rounded-md p-3 bg-gray-50 space-y-2">
              {paginatedUsers.length === 0 ? (
                <p className="text-sm text-gray-400">No users found</p>
              ) : (
                paginatedUsers.map((user) => {
                  const highlight = (text) => {
                    const i = text.toLowerCase().indexOf(searchTerm.toLowerCase());
                    if (i === -1 || !searchTerm) return text;
                    return (
                      <>
                        {text.slice(0, i)}
                        <span className="bg-yellow-200 font-semibold">
                          {text.slice(i, i + searchTerm.length)}
                        </span>
                        {text.slice(i + searchTerm.length)}
                      </>
                    );
                  };

                  return (
                    <div key={user.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedOptions.some((opt) => opt.value === user.value)}
                        onChange={() => {
                          setSelectedOptions((prev) =>
                            prev.some((opt) => opt.value === user.value)
                              ? prev.filter((opt) => opt.value !== user.value)
                              : [...prev, user]
                          );
                        }}
                      />
                      <label className="text-sm text-gray-700">
                        {highlight(user.label)}
                      </label>
                    </div>
                  );
                })
              )}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="hover:underline"
                >
                  ← Prev
                </button>
                <span>
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="hover:underline"
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}

function SidebarLink({ label, href, pathname, router }) {
  const isActive = pathname === href;
  return (
    <button
      onClick={() => router.push(href)}
      className={`block w-full text-left px-3 py-2 rounded-md transition ${
        isActive
          ? 'bg-emerald-100 text-emerald-800 font-medium'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      {label}
    </button>
  );
}
