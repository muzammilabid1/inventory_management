"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useReducer } from "react";
import { ArrowRight, Boxes, Eye, EyeOff, Info, LockKeyhole, Mail, UserRound } from "lucide-react";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

const inputClassName =
  "h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950/70 pl-11 pr-4 text-sm text-zinc-100 outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10";

type AuthFormState = {
  isPasswordVisible: boolean;
  errorMessage: string;
  isSubmitting: boolean;
  verificationStep: boolean;
  email: string;
  resendMessage: string;
  isResending: boolean;
};

type AuthFormAction =
  | { type: "toggle-password" }
  | { type: "error"; message: string }
  | { type: "submit-status"; value: boolean }
  | { type: "challenge"; email: string }
  | { type: "show-credentials" }
  | { type: "resend-status"; value: boolean }
  | { type: "resend-message"; message: string };

const initialState: AuthFormState = {
  isPasswordVisible: false,
  errorMessage: "",
  isSubmitting: false,
  verificationStep: false,
  email: "",
  resendMessage: "",
  isResending: false,
};

function authFormReducer(state: AuthFormState, action: AuthFormAction): AuthFormState {
  switch (action.type) {
    case "toggle-password": return { ...state, isPasswordVisible: !state.isPasswordVisible };
    case "error": return { ...state, errorMessage: action.message };
    case "submit-status": return { ...state, isSubmitting: action.value };
    case "challenge": return { ...state, email: action.email, verificationStep: true, errorMessage: "" };
    case "show-credentials": return { ...state, verificationStep: false, errorMessage: "", resendMessage: "" };
    case "resend-status": return { ...state, isResending: action.value };
    case "resend-message": return { ...state, resendMessage: action.message };
  }
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [state, dispatch] = useReducer(authFormReducer, initialState);
  const { isPasswordVisible, errorMessage, isSubmitting, verificationStep, email, resendMessage, isResending } = state;

  async function resendRegistrationCode() {
    dispatch({ type: "resend-message", message: "" });
    dispatch({ type: "resend-status", value: true });
    try {
      const apiUrl = process.env.NEXT_PUBLIC_INVENTORY_API_URL || "http://localhost:4000";
      const response = await fetch(`${apiUrl}/api/auth/resend-registration-code`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not send another code.");
      dispatch({ type: "resend-message", message: result.message });
    } catch (error) {
      dispatch({ type: "resend-message", message: error instanceof Error ? error.message : "Could not send another code." });
    } finally { dispatch({ type: "resend-status", value: false }); }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch({ type: "error", message: "" });
    dispatch({ type: "submit-status", value: true });

    const formData = new FormData(event.currentTarget);
    const apiUrl = process.env.NEXT_PUBLIC_INVENTORY_API_URL || "http://localhost:4000";

    try {
      const code = formData.get("code");
      const response = await fetch(
        `${apiUrl}/api/auth/${verificationStep ? "verify-code" : isRegister ? "register" : "login"}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: formData.get("name"),
            email: verificationStep ? email : formData.get("email"),
            password: formData.get("password"),
            code,
            purpose: isRegister ? "register" : "login",
          }),
        },
      );

      const result = await response.json();
      if (!response.ok) {
        const message = result.error || "Could not sign in. Please try again.";
        throw new Error(result.debug ? `${message} (${result.debug})` : message);
      }

      if (result.challengeRequired) {
        dispatch({ type: "challenge", email: result.email });
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      dispatch({ type: "error", message:
        error instanceof Error
          ? error.message
          : "Could not reach the API. Make sure it is running and try again.",
      });
    } finally {
      dispatch({ type: "submit-status", value: false });
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12 sm:px-8">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-24 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px]" />

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-3xl border border-zinc-800/80 bg-zinc-900/50 shadow-2xl shadow-black/40 backdrop-blur-sm lg:grid-cols-[0.95fr_1.05fr]">
        <section className="relative hidden flex-col justify-between overflow-hidden border-r border-zinc-800/80 bg-zinc-950/70 p-10 lg:flex xl:p-12">
          <div className="pointer-events-none absolute -right-24 top-1/3 h-64 w-64 rounded-full bg-emerald-500/10 blur-[90px]" />
          <Link href="/" className="group relative inline-flex w-fit items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 text-zinc-950 shadow-lg shadow-emerald-950/30 transition-transform duration-300 group-hover:scale-105">
              <Boxes size={22} strokeWidth={2.2} />
            </span>
            <span>
              <span className="block text-sm font-semibold tracking-tight text-white">Inventory</span>
              <span className="mt-0.5 block text-xs text-zinc-500">Inventory management</span>
            </span>
          </Link>

          <div className="relative py-14">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">Your inventory, in focus</p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
              Make every item count.
            </h1>
            <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-400">
              Keep products organized, spot stock changes, and make confident decisions from one calm workspace.
            </p>

            <div className="mt-9 space-y-4">
              {[
                "A clear view of your products",
                "Stock status at a glance",
                "Categories that stay organized",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-zinc-300">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                    <ArrowRight size={13} />
                  </span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-xs text-zinc-600">A simpler way to keep business moving.</p>
        </section>

        <section className="p-6 sm:p-10 lg:p-12 xl:p-14">
          <Link href="/" className="group mb-10 inline-flex items-center gap-2 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-teal-400 to-cyan-500 text-zinc-950 transition-transform duration-300 group-hover:scale-105">
              <Boxes size={20} />
            </span>
            <span className="text-sm font-semibold text-white">Inventory</span>
          </Link>

          <div className="mx-auto max-w-md">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-400">
              {isRegister ? "Get started" : "Welcome back"}
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {isRegister ? "Create your account" : "Sign in to Inventory"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {isRegister
                ? "Set up your workspace and bring your inventory into focus."
                : verificationStep
                  ? `Enter the verification code sent to ${email}.`
                  : "Enter your details to continue to your inventory workspace."}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              {!verificationStep && isRegister && (
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-zinc-300">Full name</label>
                  <div className="relative">
                    <UserRound size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                    <input id="name" name="name" type="text" autoComplete="name" required placeholder="Your name" className={inputClassName} />
                  </div>
                </div>
              )}

              {!verificationStep && <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-zinc-300">Email address</label>
                <div className="relative">
                  <Mail size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input id="email" name="email" type="email" autoComplete="email" required placeholder="you@company.com" className={inputClassName} />
                </div>
              </div>}

              {!verificationStep ? <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-300">Password</label>
                  {isRegister && <span className="text-xs text-zinc-600">At least 8 characters</span>}
                </div>
                <div className="relative">
                  <LockKeyhole size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600" />
                  <input id="password" name="password" type={isPasswordVisible ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 8 : undefined} required placeholder="Enter your password" className={`${inputClassName} pr-12`} />
                  <button
                    type="button"
                    onClick={() => dispatch({ type: "toggle-password" })}
                    aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-emerald-300"
                  >
                    {isPasswordVisible ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div> : <div>
                <label htmlFor="code" className="mb-2 block text-sm font-medium text-zinc-300">Verification code</label>
                <input id="code" name="code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" required placeholder="6 digit code" className={inputClassName} />
                <p className="mt-2 text-xs text-zinc-500">Enter the code we sent to {email}. It expires in 10 minutes.</p>
                {isRegister && <button type="button" onClick={resendRegistrationCode} disabled={isResending} className="mt-3 block text-xs text-emerald-400 hover:text-emerald-300 disabled:opacity-50">{isResending ? "Sending…" : "Resend verification code"}</button>}
                {resendMessage && <p role="status" className="mt-2 text-xs text-zinc-400">{resendMessage}</p>}
                <button type="button" onClick={() => dispatch({ type: "show-credentials" })} className="mt-3 text-xs text-emerald-400 hover:text-emerald-300">Use a different email or password</button>
              </div>}

              {errorMessage && (
                <p role="status" aria-live="polite" className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm leading-6 text-amber-200">
                  <Info size={17} className="mt-1 shrink-0 text-amber-400" />
                  {errorMessage}
                </p>
              )}

              <button type="submit" disabled={isSubmitting} className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-950/30 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/30 disabled:cursor-wait disabled:opacity-70">
                {isSubmitting
                  ? isRegister ? "Creating account..." : "Signing in..."
                  : verificationStep ? "Verify and continue" : isRegister ? "Create account" : "Sign in"}
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </form>

            {!isRegister && !verificationStep && <Link href="/forgot-password" className="mt-4 block text-right text-sm font-medium text-emerald-400 hover:text-emerald-300">Forgot password?</Link>}

            <p className="mt-7 text-center text-sm text-zinc-500">
              {isRegister ? "Already have an account?" : "New to Inventory?"}{" "}
              <Link href={isRegister ? "/login" : "/register"} className="font-medium text-emerald-400 transition-colors hover:text-emerald-300">
                {isRegister ? "Sign in" : "Create an account"}
              </Link>
            </p>
            <Link href="/" className="mt-8 inline-flex w-full justify-center text-xs text-zinc-600 transition-colors hover:text-zinc-300">
              Back to home
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
