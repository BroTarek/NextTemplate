/**Don't modify the backend (Recommended)
Since your .NET API is already returning the token in the JSON body (inside AuthModelDto), your Next.js Server Action can simply read the JSON body and create the cookie itself.

This is the recommended pattern because it keeps your .NET API completely agnostic. If you ever build a mobile app in the future, the mobile app can just read the JSON token, while your Next.js web app converts it to a cookie.

How to adjust your Next.js code for this (No .NET changes needed): */

// app/actions/auth.ts
"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function registerAction(prevState: any, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // Call your .NET backend proxy-style
  const res = await fetch("https://yourdotnetbackend.com/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const responseData = await res.json();

  if (!res.ok) {
    return { error: responseData.message || "Registration failed" };
  }

  // 1. Extract the token from the .NET JSON response body
  // (Assuming ApiResponse wrapper holds it in .data)
  const token = responseData.data.token; 

  // 2. Next.js creates the HTTP-only cookie for the browser
  const cookieStore = await cookies();
  cookieStore.set({
    name: "jwt", 
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Secure in production
    path: "/",
    maxAge: 60 * 60 * 24 * 7 // 1 week (adjust to match your .NET expiry)
  });

  // Redirect to dashboard on success
  redirect("/dashboard");
}
