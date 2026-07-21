/*
[HttpPost("login")]  // POST: api/auth/login
public async Task<ActionResult<ApiResponse<AuthModelDto>>> Login([FromBody] LoginDto loginDto)
{
    var result = await serviceManager.AuthService.LoginAsync(loginDto);
    
    // Add this to set the cookie on the response headers
    SetTokenCookie(result.Token, result.ExpiresOn);
    
    return Success(result, "Login Successful");
}

[HttpPost("register")]  // POST: api/auth/register
public async Task<ActionResult<ApiResponse<AuthModelDto>>> Register([FromBody] RegisterDto registerDto)
{
    var result = await serviceManager.AuthService.RegisterAsync(registerDto);
    
    // Add this to set the cookie on the response headers
    SetTokenCookie(result.Token, result.ExpiresOn);
    
    return Created(result, "Registration Successful");
}

// Add a helper method in the controller to handle the cookie logic
private void SetTokenCookie(string token, DateTime expires)
{
    var cookieOptions = new CookieOptions
    {
        HttpOnly = true,
        Expires = expires,
        Secure = true, // Ensure this is true if you are over HTTPS
        SameSite = SameSiteMode.None // Important if Next.js and .NET are on different domains
    };
    
    Response.Cookies.Append("jwt", token, cookieOptions);
}


*/
//1. Define the Server ActionThis runs securely on the Next.js server, keeping your .NET API URL completely hidden from the browser.

// app/actions/auth.ts
"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function registerAction(prevState: any, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  // Call your .NET backend proxy-style
  const res = await fetch("https://yourdotnetbackend.com", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    return { error: errorData.message || "Registration failed" };
  }

  // Extract the HTTP-only cookie set by .NET and forward it to the browser
  const dotnetCookies = res.headers.getSetCookie();
  const cookieStore = await cookies();
  
  dotnetCookies.forEach((cookieString) => {
    // Basic parser example: You can map the .NET cookie into Next.js cookie store
    cookieStore.set({
      name: "jwt", 
      value: "extracted-value-from-dotnet",
      httpOnly: true,
      secure: true,
    });
  });

  // Redirect to dashboard on success
  redirect("/dashboard");
}

//2. Connect the Form with useActionStateThis hook natively tracks whether the server action is running (isPending) and displays any error returned.

// app/register/page.tsx
"use client";
import { useActionState } from "react";

export default function RegisterPage() {
  // state holds whatever the action returns (errors, messages)
  // formAction is passed directly to the HTML form element
  const [state, formAction, isPending] = useActionState(registerAction, null);

  return (
    <form action={formAction}>
      <input name="email" type="email" required placeholder="Email" />
      <input name="password" type="password" required placeholder="Password" />

      <button type="submit" disabled={isPending}>
        {isPending ? "Creating Account..." : "Register"}
      </button>

      {state?.error && <p className="text-red-500">{state.error}</p>}
    </form>
  );
}
