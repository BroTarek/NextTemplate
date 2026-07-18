import { ACTION, Resource, ROLES } from "./types"
type Permissions = Record<ROLES, Partial<Record<Resource, Array<ACTION>>>>

//AUTHZ POLICY
const PERMISSIONS: Permissions = {
    viewer: {
        post: ['view']
    },
    editor: {
        post: ['view', 'create', 'update']
    },
    admin: {
        post: ['create', 'view', 'update', 'delete', "manage"],
        users: ['create', 'view', 'update', 'delete', "manage"]
    }
}

export const checkPermission = (user: ROLES, action: ACTION, resource: Resource) => {
    const permisson = PERMISSIONS[user][resource]
    if (permisson?.includes(action))
        return true
    return false
}