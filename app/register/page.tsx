"use client";

import { CheckCircle2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AuthCard } from "@/components/auth/AuthCard";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { LoadingState } from "@/components/ui/States";
import { api } from "@/lib/api";
import { EMAIL_PATTERN, PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH, REGISTERED_EMAIL_KEY } from "@/lib/authRoutes";
import { FieldErrors, required, useForm } from "@/lib/forms";

interface Values {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

function validate(v: Values): FieldErrors {
  const e: FieldErrors = {};
  if (required(v.fullName)) e.fullName = "Full name is required.";
  else if (v.fullName.trim().length > 100) e.fullName = "Full name must not exceed 100 characters.";
  if (required(v.email)) e.email = "Email is required.";
  else if (!EMAIL_PATTERN.test(v.email.trim())) e.email = "Enter a valid email address.";
  else if (v.email.trim().length > 255) e.email = "Email must not exceed 255 characters.";
  if (!v.password) e.password = "Password is required.";
  else if (v.password.length < PASSWORD_MIN_LENGTH) e.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters.`;
  else if (v.password.length > PASSWORD_MAX_LENGTH) e.password = `Password must not exceed ${PASSWORD_MAX_LENGTH} characters.`;
  if (!v.confirmPassword) e.confirmPassword = "Please confirm your password.";
  else if (v.confirmPassword !== v.password) e.confirmPassword = "Passwords do not match.";
  return e;
}

export default function RegisterPage() {
  const { status, account, logout } = useAuth();
  const router = useRouter();
  const form = useForm<Values>({ fullName: "", email: "", password: "", confirmPassword: "" }, validate);
  const { values, errors, saving, setField } = form;
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);

  // After a successful registration, show the success message briefly, then go to the login page.
  useEffect(() => {
    if (!createdEmail) return;
    const id = setTimeout(() => router.push("/login"), 1800);
    return () => clearTimeout(id);
  }, [createdEmail, router]);

  const submit = form.handleSubmit(async (v) => {
    const created = await api.auth.register({
      fullName: v.fullName.trim(),
      email: v.email.trim(),
      password: v.password,
    });
    try {
      sessionStorage.setItem(REGISTERED_EMAIL_KEY, created.email);
    } catch {
      // sessionStorage unavailable: the login form just will not be prefilled
    }
    setCreatedEmail(created.email);
    toast.success("Account created! Redirecting to the login page...");
  });

  if (status === "loading") return <LoadingState label="Checking your session..." />;

  if (createdEmail) {
    return (
      <AuthCard title="Account created" subtitle="Your Staff account is ready.">
        <div className="flex flex-col items-center gap-3 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <p className="text-sm text-slate-600">
            <strong className="text-slate-900">{createdEmail}</strong> has been registered. Redirecting you to the login
            page...
          </p>
          <Link href="/login" className="text-sm font-medium text-indigo-600 hover:underline">
            Go to login now
          </Link>
        </div>
      </AuthCard>
    );
  }

  if (status === "authenticated") {
    return (
      <AuthCard title="You are logged in" subtitle={`Signed in as ${account?.fullName}. Log out to register a new account.`}>
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
      title="Create an account"
      subtitle="New accounts get the Staff role and can manage departments, projects, tasks and tags."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <Field label="Full name" htmlFor="reg-name" required error={errors.fullName}>
          <Input
            id="reg-name"
            autoComplete="name"
            value={values.fullName}
            onChange={(e) => setField("fullName", e.target.value)}
            invalid={!!errors.fullName}
            maxLength={100}
            autoFocus
          />
        </Field>
        <Field label="Email" htmlFor="reg-email" required error={errors.email}>
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => setField("email", e.target.value)}
            invalid={!!errors.email}
            maxLength={255}
          />
        </Field>
        <Field
          label="Password"
          htmlFor="reg-password"
          required
          error={errors.password}
          hint={`At least ${PASSWORD_MIN_LENGTH} characters.`}
        >
          <PasswordInput
            id="reg-password"
            autoComplete="new-password"
            value={values.password}
            onChange={(e) => setField("password", e.target.value)}
            invalid={!!errors.password}
            maxLength={PASSWORD_MAX_LENGTH}
          />
        </Field>
        <Field label="Confirm password" htmlFor="reg-confirm" required error={errors.confirmPassword}>
          <PasswordInput
            id="reg-confirm"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(e) => setField("confirmPassword", e.target.value)}
            invalid={!!errors.confirmPassword}
            maxLength={PASSWORD_MAX_LENGTH}
          />
        </Field>
        <Button type="submit" className="w-full" loading={saving}>
          {!saving && <UserPlus className="h-4 w-4" />} Create account
        </Button>
      </form>
    </AuthCard>
  );
}
