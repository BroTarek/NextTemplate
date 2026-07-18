export type ACTION = 'create' | 'view' | 'update' | 'delete' | 'manage';
export type ResourceType = 'post' | 'users' | 'document';

// User Attributes
export interface UserAttributes {
  id: string;
  role: 'viewer' | 'admin' | 'editor' | 'manager';
  department: string;
  clearanceLevel: number;
  isMfaEnabled: boolean;
}

// Resource Attributes
export interface ResourceAttributes {
  id: string;
  type: ResourceType;
  ownerId: string;
  department: string;
  classification: 'public' | 'internal' | 'confidential' | 'secret';
}

// Environment Attributes
export interface EnvironmentAttributes {
  ipAddress: string;
  isVpnActive: boolean;
  timeOfDay: number; // e.g., 0-23 hours
  deviceHealth: 'secure' | 'at-risk' | 'compromised';
}

// ABAC Context (what gets evaluated)
export interface AuthorizationContext {
  user: UserAttributes;
  resource: ResourceAttributes;
  environment: EnvironmentAttributes;
  action: ACTION;
}

// ABAC Policy Definition
export interface ABACPolicy {
  name: string;
  description: string;
  action: ACTION | ACTION[];
  resourceType: ResourceType | ResourceType[];
  // A function that evaluates the context to determine access
  evaluate: (context: AuthorizationContext) => boolean;
}