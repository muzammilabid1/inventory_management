import Link from "next/link";
import ForgotPasswordForm from "@/components/ForgotPasswordForm";

export default function ForgotPasswordPage() {
  return <main className="flex min-h-screen items-center justify-center px-5 py-12"><section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/70 p-7 sm:p-10"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-400">Account recovery</p><h1 className="mt-3 text-3xl font-semibold text-white">Forgot your password?</h1><p className="mt-3 text-sm leading-6 text-zinc-400">Enter your account email. If it matches an account, we’ll send a recovery code.</p><ForgotPasswordForm /><Link href="/login" className="mt-6 block text-center text-sm text-zinc-500 hover:text-white">Back to sign in</Link></section></main>;
}
