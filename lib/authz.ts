import { ABACPolicy, ACTION, AuthorizationContext } from "./types";

// ABAC Policies
const policies: ABACPolicy[] = [
    {
        name: "Admin Super Access",
        description: "Admins can do anything if their device is secure and VPN is active",
        action: ["create", "view", "update", "delete", "manage"],
        resourceType: ["post", "users", "document"],
        evaluate: ({ user, environment }) => {
            return user.role === 'admin' && environment.deviceHealth === 'secure' && environment.isVpnActive;
        }
    },
    {
        name: "Owner Update Access",
        description: "Users can update resources they own, provided they have MFA enabled",
        action: ["update", "delete"],
        resourceType: ["post", "document"],
        evaluate: ({ user, resource }) => {
            return user.id === resource.ownerId && user.isMfaEnabled;
        }
    },
    {
        name: "Departmental Confidential Access",
        description: "Confidential resources can only be viewed by users in the same department with sufficient clearance",
        action: ["view"],
        resourceType: ["post", "document"],
        evaluate: ({ user, resource, environment }) => {
            if (resource.classification === 'confidential') {
                return user.department === resource.department && 
                       user.clearanceLevel >= 3 && 
                       environment.isVpnActive;
            }
            return false;
        }
    },
    {
        name: "Public View Access",
        description: "Public resources can be viewed by anyone during office hours",
        action: ["view"],
        resourceType: ["post", "document", "users"],
        evaluate: ({ resource, environment }) => {
            return resource.classification === 'public' && 
                   environment.timeOfDay >= 8 && environment.timeOfDay <= 18;
        }
    }
];

export const checkABACPermission = (context: AuthorizationContext): { granted: boolean; matchedPolicies: string[] } => {
    const matchedPolicies: string[] = [];
    let granted = false;

    for (const policy of policies) {
        // Check if policy applies to this action and resource type
        const actions = Array.isArray(policy.action) ? policy.action : [policy.action];
        const resourceTypes = Array.isArray(policy.resourceType) ? policy.resourceType : [policy.resourceType];

        if (actions.includes(context.action) && resourceTypes.includes(context.resource.type)) {
            // Evaluate policy condition
            if (policy.evaluate(context)) {
                granted = true;
                matchedPolicies.push(policy.name);
            }
        }
    }

    return { granted, matchedPolicies };
};