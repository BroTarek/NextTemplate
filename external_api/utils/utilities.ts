/**
 * typpescript acomplishes its purpose during development and compile time not at runtime , when recieving data from other sources (external apis) ,form submission, local storage, or a third-party SDK, erros has no type safety
 * 
 * 
 * // This looks fine. It is not fine.
type User = {
  id: number;
  name: string;
  tags: string[];
};

function displayUser(user: User) {
  const upperName = user.name.toUpperCase(); //name can be null and it will not complain
  const tagList = user.tags.map((tag) => `#${tag}`);//tags can be undifined 
  return { upperName, tagList };
}


But there are issues with the above approach. Firstly, upperName will return undefined if user.name isn't a string. Secondly, the user?.tag || [] guards for undefined and null values alone. What if an object gets returned? {...}?.map(...)? Do you see the real issue now?
 */

export function safeArray<T>(prop: unknown): T[] {
    if (Array.isArray(prop)) {
        return prop as T[];
    } else {
        return [] as T[];
    }
}

export function safeString(prop: unknown, fallback = ""): string {
    if (typeof prop === "string") {
        return prop;
    } else {
        return fallback;
    }
}

export function safeNumber(prop: unknown, fallback = 0): number {
    if (typeof prop === "number" && !isNaN(prop)) {
        return prop;
    } else {
        return fallback;
    }
}

export function safeObject<T extends object>(
    prop: unknown,
    fallback = {} as T,
): T {
    if (prop !== null && typeof prop === "object" && !Array.isArray(prop)) {
        return prop as T;
    }
    return fallback;
}


// export function normalizeUser(user: any) {
//   return {
//     id: safeNumber(user.id),
//     name: safeString(user.name),
//     tags: safeArray<string>(user.tags),
//   };
// }