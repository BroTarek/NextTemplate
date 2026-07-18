"use client";

import { useState } from "react";
import { checkABACPermission } from "@/lib/authz";
import type { 
  ACTION, 
  ResourceType, 
  UserAttributes, 
  ResourceAttributes, 
  EnvironmentAttributes, 
  AuthorizationContext 
} from "@/lib/types";

export default function Home() {
  const [userAttr, setUserAttr] = useState<UserAttributes>({
    id: "user-1",
    role: "viewer",
    department: "engineering",
    clearanceLevel: 1,
    isMfaEnabled: false
  });

  const [resourceAttr, setResourceAttr] = useState<ResourceAttributes>({
    id: "res-1",
    type: "post",
    ownerId: "user-2",
    department: "engineering",
    classification: "internal"
  });

  const [envAttr, setEnvAttr] = useState<EnvironmentAttributes>({
    ipAddress: "192.168.1.1",
    isVpnActive: false,
    timeOfDay: 12,
    deviceHealth: "secure"
  });

  const [action, setAction] = useState<ACTION>("view");
  const [result, setResult] = useState<{ granted: boolean; matchedPolicies: string[] } | null>(null);

  const actions: ACTION[] = ["create", "view", "update", "delete", "manage"];
  const resourceTypes: ResourceType[] = ["post", "users", "document"];
  const roles = ["viewer", "admin", "editor", "manager"];
  const classifications = ["public", "internal", "confidential", "secret"];
  const healthStatuses = ["secure", "at-risk", "compromised"];

  const testPermission = () => {
    const context: AuthorizationContext = {
      user: userAttr,
      resource: resourceAttr,
      environment: envAttr,
      action
    };
    const res = checkABACPermission(context);
    setResult(res);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8 text-slate-800 dark:text-slate-200">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-4xl font-bold text-center mb-2">🔐 ABAC Policy Tester</h1>
        <p className="text-center text-slate-600 dark:text-slate-400">
          Attribute-Based Access Control Evaluation
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* User Attributes */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-slate-700">👤 User Attributes</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">ID</label>
                <input type="text" value={userAttr.id} onChange={e => setUserAttr({...userAttr, id: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-700 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium">Role</label>
                <select value={userAttr.role} onChange={e => setUserAttr({...userAttr, role: e.target.value as any})} className="w-full p-2 rounded border dark:bg-slate-700 dark:border-slate-600">
                  {roles.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Department</label>
                <input type="text" value={userAttr.department} onChange={e => setUserAttr({...userAttr, department: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-700 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium">Clearance Level</label>
                <input type="number" value={userAttr.clearanceLevel} onChange={e => setUserAttr({...userAttr, clearanceLevel: parseInt(e.target.value)})} className="w-full p-2 rounded border dark:bg-slate-700 dark:border-slate-600" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={userAttr.isMfaEnabled} onChange={e => setUserAttr({...userAttr, isMfaEnabled: e.target.checked})} />
                <label className="text-sm font-medium">MFA Enabled</label>
              </div>
            </div>
          </div>

          {/* Resource Attributes */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-slate-700">📄 Resource Attributes</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Type</label>
                <select value={resourceAttr.type} onChange={e => setResourceAttr({...resourceAttr, type: e.target.value as any})} className="w-full p-2 rounded border dark:bg-slate-700 dark:border-slate-600">
                  {resourceTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium">Owner ID</label>
                <input type="text" value={resourceAttr.ownerId} onChange={e => setResourceAttr({...resourceAttr, ownerId: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-700 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium">Department</label>
                <input type="text" value={resourceAttr.department} onChange={e => setResourceAttr({...resourceAttr, department: e.target.value})} className="w-full p-2 rounded border dark:bg-slate-700 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium">Classification</label>
                <select value={resourceAttr.classification} onChange={e => setResourceAttr({...resourceAttr, classification: e.target.value as any})} className="w-full p-2 rounded border dark:bg-slate-700 dark:border-slate-600">
                  {classifications.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Environment Attributes */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-slate-700">🌍 Environment Attributes</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Time of Day (0-23)</label>
                <input type="number" value={envAttr.timeOfDay} onChange={e => setEnvAttr({...envAttr, timeOfDay: parseInt(e.target.value)})} className="w-full p-2 rounded border dark:bg-slate-700 dark:border-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium">Device Health</label>
                <select value={envAttr.deviceHealth} onChange={e => setEnvAttr({...envAttr, deviceHealth: e.target.value as any})} className="w-full p-2 rounded border dark:bg-slate-700 dark:border-slate-600">
                  {healthStatuses.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={envAttr.isVpnActive} onChange={e => setEnvAttr({...envAttr, isVpnActive: e.target.checked})} />
                <label className="text-sm font-medium">VPN Active</label>
              </div>
            </div>
          </div>

          {/* Action */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 dark:border-slate-700">⚡ Action</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Action to Perform</label>
                <select value={action} onChange={e => setAction(e.target.value as any)} className="w-full p-2 rounded border dark:bg-slate-700 dark:border-slate-600">
                  {actions.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div className="pt-4">
                <button onClick={testPermission} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                  Evaluate Policy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <div className={`p-6 rounded-xl border-2 ${result.granted ? 'bg-green-50 border-green-500 dark:bg-green-900/20' : 'bg-red-50 border-red-500 dark:bg-red-900/20'}`}>
            <h3 className="text-2xl font-bold text-center mb-2">
              {result.granted ? <span className="text-green-600 dark:text-green-400">✅ Access Granted</span> : <span className="text-red-600 dark:text-red-400">❌ Access Denied</span>}
            </h3>
            {result.matchedPolicies.length > 0 && (
              <div className="mt-4">
                <p className="font-semibold text-slate-700 dark:text-slate-300">Matched Policies:</p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  {result.matchedPolicies.map(p => <li key={p} className="text-slate-600 dark:text-slate-400">{p}</li>)}
                </ul>
              </div>
            )}
            {!result.granted && (
              <p className="mt-4 text-center text-slate-600 dark:text-slate-400">No matching allow policies found for this context.</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}