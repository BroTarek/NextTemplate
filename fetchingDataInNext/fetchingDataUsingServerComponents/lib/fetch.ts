// lib/fetch.ts
export async function fetchData<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const baseUrl = process.env.API_BASE_URL
  
  const res = await fetch(`${baseUrl}${url}`, {
    ...options,
    next: {
      revalidate: 3600, // 1 hour
      ...options?.next
    }
  })
  
  if (!res.ok) {
    throw new Error(`API Error: ${res.statusText}`)
  }
  
  return res.json()
}

// app/page.tsx
import { fetchData } from '@/lib/fetch'
import { revalidatePath } from 'next/cache'

export default async function Page() {
  const posts = await fetchData<Post[]>('/posts')
  // ...
}