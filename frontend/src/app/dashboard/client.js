"use client";

import { useRouter } from "next/navigation";

export default function DashboardClient({ user, groups }) {
  const router = useRouter();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {user.name} 👋
        </h1>
        <button
          onClick={() => router.push("/group/create")}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ➕ Create New Group
        </button>
      </div>

      <h2 className="text-xl font-semibold mt-6 mb-2 text-gray-700">
        Your Groups
      </h2>
      <ul className="space-y-3">
        {groups.map((group) => (
          <li key={group._id} className="bg-white p-4 shadow rounded-md">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-lg text-gray-900">
                  {group.name}
                </p>
                <p className="text-sm text-gray-500">
                  {group.members.length} members
                </p>
              </div>
              <button
                className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
                onClick={() => router.push(`/group/${group._id}`)}
              >
                View
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
