"use client";

import { useReducer } from "react";
import { useRouter } from "next/navigation";

const api = process.env.NEXT_PUBLIC_INVENTORY_API_URL || "http://localhost:4000";
const inputClass = "h-12 w-full rounded-xl border border-zinc-800 bg-zinc-950/70 px-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10";

type RecoveryState = {
  email: string;
  step: "email" | "code" | "password";
  token: string;
  error: string;
  notice: string;
  busy: boolean;
};

type RecoveryAction = { type: "update"; values: Partial<RecoveryState> };

const initialState: RecoveryState = {
  email: "",
  step: "email",
  token: "",
  error: "",
  notice: "",
  busy: false,
};

function recoveryReducer(state: RecoveryState, action: RecoveryAction): RecoveryState {
  return { ...state, ...action.values };
}

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [state, dispatch] = useReducer(recoveryReducer, initialState);
  const { email, step, token, error, notice, busy } = state;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    dispatch({ type: "update", values: { error: "", notice: "", busy: true } });
    const values = new FormData(event.currentTarget);
    try {
      let url = ""; let body: Record<string, string> = {};
      if (step === "email") { url = "forgot-password"; body = { email }; }
      else if (step === "code") { url = "verify-reset-code"; body = { email, code: String(values.get("code") || "") }; }
      else {
        const password = String(values.get("password") || "");
        if (password !== values.get("confirmPassword")) throw new Error("The passwords do not match.");
        url = "reset-password"; body = { token, password };
      }
      const response = await fetch(`${api}/api/auth/${url}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not complete the request.");
      if (step === "email") dispatch({ type: "update", values: { step: "code", notice: "If an account exists for that email, we’ve sent a recovery code. Check your inbox." } });
      else if (step === "code") dispatch({ type: "update", values: { token: result.resetToken, step: "password" } });
      else { router.push("/login?passwordReset=1"); }
    } catch (e) { dispatch({ type: "update", values: { error: e instanceof Error ? e.message : "Could not complete the request." } }); }
    finally { dispatch({ type: "update", values: { busy: false } }); }
  }

  return <form onSubmit={submit} className="mt-8 space-y-5">
    {step === "email" && <label className="block text-sm text-zinc-300">Email address<input className={`${inputClass} mt-2`} type="email" required autoComplete="email" value={email} onChange={(e) => dispatch({ type: "update", values: { email: e.target.value } })} placeholder="you@company.com" /></label>}
    {step === "code" && <label className="block text-sm text-zinc-300">Recovery code<input className={`${inputClass} mt-2`} name="code" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" placeholder="6 digit code" /><span className="mt-2 block text-xs text-zinc-500">The code expires in 15 minutes.</span></label>}
    {step === "password" && <><label className="block text-sm text-zinc-300">New password<input className={`${inputClass} mt-2`} name="password" type="password" required minLength={8} autoComplete="new-password" /></label><label className="block text-sm text-zinc-300">Confirm new password<input className={`${inputClass} mt-2`} name="confirmPassword" type="password" required minLength={8} autoComplete="new-password" /></label></>}
    {notice && <p role="status" className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-sm text-emerald-200">{notice}</p>}
    {error && <p role="alert" className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-sm text-rose-200">{error}</p>}
    <button disabled={busy} className="h-12 w-full rounded-xl bg-emerald-400 px-5 text-sm font-semibold text-zinc-950 disabled:opacity-60">{busy ? "Please wait..." : step === "email" ? "Send recovery code" : step === "code" ? "Verify code" : "Reset password"}</button>
  </form>;
}
