<!-- # Next.js Coding Rules

## Project Setup & Structure

### File Organization
- **Routing**: Use the **App Router** (`app/`).
- **Components**: Place components in `components/` directory.
- **Pages**: Use `page.tsx` for page components (not `index.tsx`).
- **Layouts**: Use `layout.tsx` for layouts (not `_app.tsx` or `_document.tsx`).
- **Styles**: Create a dedicated `styles/` directory for global CSS.

### Page Naming
- **Page Files**: `app/dashboard/page.tsx`
- **Layout Files**: `app/dashboard/layout.tsx`
- **Server Components**: Default for `page.tsx`
- **Client Components**: Use `'use client'` directive at the top.

## Styling with Tailwind CSS

### Utility-First Classes
- **Avoid inline styles**: Use Tailwind classes instead of `style={{}}`.
- **Component Styling**:
  ```tsx
  // Good
  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
    Click Me
  </button>

  // Bad
  <button style={{ backgroundColor: 'blue', padding: '8px 16px' }}>
    Click Me
  </button>
  ```

### Dark Mode
- Use `dark:` prefix for dark mode classes.
- **Important**: All layout components must support dark mode.

### Custom Styles
- Use `@layer components` or `@layer utilities` for custom Tailwind classes.
- **Avoid**: Using plain CSS files for component-specific styles.

## API Routes

### Route Files
- Create API routes in `app/api/` directory.
- Use `route.ts` for API endpoints.
  ```tsx
  // app/api/users/route.ts
  export async function GET(request: Request) {
    return Response.json({ users: [] });
  }
  ```

### Caching
- **Default**: All API routes are **cached**.
- Use `revalidate: false` or `cache: 'no-store'` for dynamic routes.
- **Example**:
  ```tsx
  export async function GET() {
    const data = await fetch('https://api.example.com/data', { 
      next: { revalidate: 60 } 
    });
    return Response.json(data);
  }
  ```

## Server Components

### Default Behavior
- **All components in `app/` are Server Components by default**.

### Fetching Data
- Use native `fetch` API with caching options.
- **Best Practice**: Fetch data directly in Server Components, not in Client Components.
  ```tsx
  // Server Component
  async function getData() {
    const res = await fetch('https://api.example.com/data');
    return res.json();
  }

  // Client Component - Fetching inside client component is NOT allowed
  ```

### Direct DOM Manipulation
- **Prohibited**: Direct DOM manipulation is **NOT allowed**.
- Use React state and refs instead.

### Third-Party Libraries
- **Prohibited**: Using third-party libraries for state management, routing, or DOM manipulation is **NOT allowed**.
- **Approved**: Only UI libraries (e.g., Shadcn/UI) are allowed.

## Client Components

### When to Use
- Only when needed for interactivity (e.g., form inputs, state management).

### Syntax
- Start with `'use client'` directive.
- Keep client components **small and focused**.

## Folder Structure Example

```
app/
├── page.tsx          # Root page
├── layout.tsx        # Root layout
├── api/
│   ├── users/
│   │   ├── route.ts  # API route
├── dashboard/
│   ├── page.tsx      # Dashboard page
│   └── layout.tsx    # Dashboard layout
components/
├── ui/
├── features/
```

## Code Quality

### TypeScript
- Use TypeScript for all new components.
- **Required**: All function components must have type annotations.

### Code Style
- **Component Naming**: PascalCase (e.g., `UserProfile`)  
- **Function Naming**: camelCase (e.g., `fetchUserData`)  
- **File Naming**: kebab-case (e.g., `user-profile.tsx`)  

### Hooks
- **Custom Hooks**: Place custom hooks in `hooks/` directory.
- **Naming**: Start with `use` prefix (e.g., `useAuth.ts`).

## Testing

- Use **Jest** for unit testing.
- **Integration tests**: Use Next.js testing tools.
- **E2E tests**: Create separate `tests/` directory. -->
