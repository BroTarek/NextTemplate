"use client"// app/page.tsx
"use client";

import { useState } from "react";
import { checkPermission } from "@/lib/authz"; // Adjust import path as needed
import type { ROLES, ACTION, Resource } from "@/lib/types"; // Adjust import path as needed

export default function Home() {
  // State for test configuration
  const [selectedRole, setSelectedRole] = useState<ROLES>("viewer");
  const [selectedAction, setSelectedAction] = useState<ACTION>("view");
  const [selectedResource, setSelectedResource] = useState<Resource>("post");
  const [result, setResult] = useState<boolean | null>(null);

  // All available options
  const roles: ROLES[] = ["viewer", "editor", "admin"];
  const actions: ACTION[] = ["create", "view", "update", "delete"];
  const resources: Resource[] = ["post", "users"];

  // Test the permission
  const testPermission = () => {
    const hasPermission = checkPermission(selectedRole, selectedAction, selectedResource);
    setResult(hasPermission);
  };

  // Quick test all permissions for a role
  const testAllPermissions = (role: ROLES) => {
    const results: Record<string, boolean> = {};
    actions.forEach((action) => {
      resources.forEach((resource) => {
        const key = `${action} ${resource}`;
        results[key] = checkPermission(role, action, resource);
      });
    });
    return results;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-slate-800 dark:text-white">
          🔐 Authorization Policy Tester
        </h1>
        <p className="text-center text-slate-600 dark:text-slate-300 mb-8">
          Test your RBAC (Role-Based Access Control) system
        </p>

        {/* Main Test Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-8 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
            🎯 Test Individual Permission
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Role Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as ROLES)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Action
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value as ACTION)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {actions.map((action) => (
                  <option key={action} value={action}>
                    {action.charAt(0).toUpperCase() + action.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Resource Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Resource
              </label>
              <select
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value as Resource)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {resources.map((resource) => (
                  <option key={resource} value={resource}>
                    {resource.charAt(0).toUpperCase() + resource.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={testPermission}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              🔍 Test Permission
            </button>
            <button
              onClick={() => setResult(null)}
              className="px-6 py-2 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Result Display */}
          {result !== null && (
            <div className={`mt-6 p-4 rounded-lg border-2 ${result
                ? "bg-green-50 dark:bg-green-900/20 border-green-500"
                : "bg-red-50 dark:bg-red-900/20 border-red-500"
              }`}>
              <p className="text-center text-lg font-medium">
                {result ? (
                  <span className="text-green-700 dark:text-green-400">
                    ✅ Access Granted!
                  </span>
                ) : (
                  <span className="text-red-700 dark:text-red-400">
                    ❌ Access Denied
                  </span>
                )}
              </p>
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Role: <strong>{selectedRole}</strong> →
                Action: <strong>{selectedAction}</strong> →
                Resource: <strong>{selectedResource}</strong>
              </p>
            </div>
          )}
        </div>

        {/* Permission Matrix Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
            📊 Permission Matrix
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Shows all permissions for each role (✅ = Granted, ❌ = Denied)
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-700">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                    Role / Action
                  </th>
                  {actions.map((action) => (
                    <th
                      key={action}
                      className="px-4 py-3 text-center text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
                    >
                      {action.charAt(0).toUpperCase() + action.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => {
                  const permissions = testAllPermissions(role);
                  return (
                    <tr
                      key={role}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </td>
                      {actions.map((action) => (
                        <td
                          key={action}
                          className="px-4 py-3 text-center border border-slate-200 dark:border-slate-600"
                        >
                          {/* Check if ANY resource has this permission */}
                          {resources.some((resource) =>
                            checkPermission(role, action, resource)
                          ) ? (
                            <span className="text-green-600 dark:text-green-400 text-xl">
                              ✅
                            </span>
                          ) : (
                            <span className="text-red-400 dark:text-red-500 text-xl">
                              ❌
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <span className="text-green-600 dark:text-green-400">✅</span> Granted
            </span>
            <span className="flex items-center gap-2">
              <span className="text-red-400 dark:text-red-500">❌</span> Denied
            </span>
            <span className="text-xs text-slate-400 dark:text-slate-500">
              * Matrix shows if ANY resource has the permission
            </span>
          </div>
        </div>

        {/* Detailed Permission Breakdown */}
        <div className="mt-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
            🔬 Detailed Permission Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {roles.map((role) => {
              const permissions = testAllPermissions(role);
              return (
                <div
                  key={role}
                  className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </h3>
                  <ul className="space-y-1 text-sm">
                    {resources.map((resource) => (
                      <li key={resource} className="text-slate-600 dark:text-slate-400">
                        <span className="font-medium">{resource}:</span>
                        <span className="ml-2">
                          {actions
                            .filter((action) =>
                              checkPermission(role, action, resource)
                            )
                            .map((action) => action)
                            .join(", ") || "No permissions"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}