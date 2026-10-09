"use client";

import { LogIn } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthCard, FormAlert } from "@/components/auth/AuthCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { LoadingState } from "@/components/ui/States";
import { ApiError } from "@/lib/api";
import { afterLoginPath, EMAIL_PATTERN, REGISTERED_EMAIL_KEY } from "@/lib/authRoutes";
import { FieldErrors, required, useForm } from "@/lib/forms";

interface Values {
  email: string;
  password: string;
}

function validate(v: Values): FieldErrors {
  const e: FieldErrors = {};
  if (required(v.email)) e.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(v.email.trim())) e.email = "Enter a valid email address.";
  if (!v.password) e.password = "Password is required.";
  return e;
}

function LoginContent() {
  const { status, account, login, logout } = useAuth();
  const router = useRouter();
  const next = afterLoginPath(useSearchParams().get("next"));
  const form = useForm<Values>({ email: "", password: "" }, validate);
  const { values, errors, saving, setField } = form;
  const [formError, setFormError] = useState<string | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  // Coming from the register page: prefill the email that was just registered.
  useEffect(() => {
    try {
      const email = sessionStorage.getItem(REGISTERED_EMAIL_KEY);
      if (email) {
        sessionStorage.removeItem(REGISTERED_EMAIL_KEY);
        form.reset({ email, password: "" });
        setJustRegistered(true);
      }
    } catch {
      // sessionStorage unavailable
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = form.handleSubmit(async (v) => {
    setFormError(null);
    try {
      const user = await login(v.email.trim(), v.password);
      setRedirecting(true);
      toast.success(`Welcome back, ${user.fullName}!`);
      router.replace(next);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setFormError("Invalid email or password. Please try again.");
        return;
      }
      throw err; // network and other errors are shown as a toast by useForm
    }
  });

  if (status === "loading") return <LoadingState label="Checking your session..." />;

  if (status === "authenticated" && !redirecting) {
    return (
      <AuthCard title="You are logged in" subtitle={`Signed in as ${account?.fullName} (${account?.email}).`}>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button className="flex-1" onClick={() => router.push("/admin")}>
            Go to dashboard
          </Button>
          <Button className="flex-1" variant="secondary" onClick={logout}>
            Log out
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Log in to TaskTrack"
      subtitle="Log in to create, edit and delete departments, projects, tasks and tags."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-indigo-600 hover:underline">
            Register
          </Link>
        </>
      }
    >
      {justRegistered && !formError && (
        <FormAlert tone="success">Your account was created. Log in with your new password.</FormAlert>
      )}
      {formError && <FormAlert tone="error">{formError}</FormAlert>}
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Email" htmlFor="login-email" required error={errors.email}>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            invalid={!!errors.email}
            autoFocus={!justRegistered}
          />
        </Field>
        <Field label="Password" htmlFor="login-password" required error={errors.password}>
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            value={values.password}
            onChange={(e) => setField("password", e.target.value)}
            invalid={!!errors.password}
            autoFocus={justRegistered}
          />
        </Field>
        <Button type="submit" className="w-full" loading={saving || redirecting}>
          {!saving && !redirecting && <LogIn className="h-4 w-4" />} Log in
        </Button>
      </form>
    </AuthCard>
  );
}

export default function LoginPage() {
  // useSearchParams needs a Suspense boundary for static rendering.
  return (
    <Suspense fallback={<LoadingState />}>
      <LoginContent />
    </Suspense>
  );
}
