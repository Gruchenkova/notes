"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { authClient } from "@/lib/auth-client";

const signInSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().min(1, "Email is required").email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long"),
});

type FieldErrors = Partial<Record<string, string | undefined>>;

export default function AuthenticatePage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (session) router.replace("/dashboard");
  }, [session, router]);

  function switchMode(newMode: "signin" | "signup") {
    setMode(newMode);
    setFieldErrors({});
    setFormError(null);
    setName("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isLoading) return;

    setFieldErrors({});
    setFormError(null);

    if (mode === "signin") {
      const result = signInSchema.safeParse({ email, password });
      if (!result.success) {
        const flat = result.error.flatten().fieldErrors;
        setFieldErrors({
          email: flat.email?.[0],
          password: flat.password?.[0],
        });
        return;
      }
      setIsLoading(true);
      const { error } = await authClient.signIn.email({
        email: result.data.email,
        password: result.data.password,
      });
      setIsLoading(false);
      if (error) {
        setFormError(error.message ?? "Sign in failed. Please try again.");
        return;
      }
      router.push("/dashboard");
    } else {
      const result = signUpSchema.safeParse({ name, email, password });
      if (!result.success) {
        const flat = result.error.flatten().fieldErrors;
        setFieldErrors({
          name: flat.name?.[0],
          email: flat.email?.[0],
          password: flat.password?.[0],
        });
        return;
      }
      setIsLoading(true);
      const { error } = await authClient.signUp.email({
        name: result.data.name,
        email: result.data.email,
        password: result.data.password,
      });
      setIsLoading(false);
      if (error) {
        setFormError(error.message ?? "Registration failed. Please try again.");
        return;
      }
      router.push("/dashboard");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md px-6 py-10 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">
          {mode === "signin" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          {mode === "signin"
            ? "Sign in to access your notes"
            : "Get started with your free account"}
        </p>

        {/* Tab switcher */}
        <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
          <button
            type="button"
            onClick={() => switchMode("signin")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "signin"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
              mode === "signup"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form key={mode} onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Name field (sign-up only) */}
          {mode === "signup" && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                disabled={isLoading}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 ${
                  fieldErrors.name
                    ? "border-red-400 focus:ring-red-400"
                    : "border-gray-300 focus:ring-indigo-500"
                }`}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.name}</p>
              )}
            </div>
          )}

          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              disabled={isLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 ${
                fieldErrors.email
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              disabled={isLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
              className={`w-full px-3 py-2 border rounded-md text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent disabled:opacity-50 ${
                fieldErrors.password
                  ? "border-red-400 focus:ring-red-400"
                  : "border-gray-300 focus:ring-indigo-500"
              }`}
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.password}</p>
            )}
          </div>

          {/* Form-level error banner */}
          {formError && (
            <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{formError}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2.5 px-4 bg-indigo-600 text-white text-sm font-semibold rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              isLoading
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-indigo-700"
            }`}
          >
            {isLoading
              ? mode === "signin"
                ? "Signing in..."
                : "Creating account..."
              : mode === "signin"
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        {/* Bottom toggle */}
        <p className="mt-6 text-center text-sm text-gray-500">
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
            className="text-indigo-600 hover:text-indigo-800 font-medium"
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
