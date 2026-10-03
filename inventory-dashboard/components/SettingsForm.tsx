"use client";

import { useEffect, useState } from "react";
import { Info, Mail, Save, UserRound } from "lucide-react";
import { apiFetch } from "@/lib/api";

type OrganizationSettings = {
  organizationName: string;
  phone: string;
  address: string;
};

type AccountProfile = {
  fullName: string;
  email: string;
};

const emptySettings: OrganizationSettings = {
  organizationName: "",
  phone: "",
  address: "",
};

export default function SettingsForm() {
  const [account, setAccount] = useState<AccountProfile | null>(null);
  const [isAccountLoading, setIsAccountLoading] = useState(true);
  const [accountError, setAccountError] = useState("");
  const [settings, setSettings] = useState(emptySettings);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    apiFetch("/api/auth/me", { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load account details.");
        setAccount(result.user);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setAccountError(error instanceof Error ? error.message : "Could not load account details.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsAccountLoading(false);
      });

    apiFetch("/api/settings", { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not load settings.");
        setSettings(result.settings);
        setHasLoaded(true);
      })
      .catch((error) => {
        if (!controller.signal.aborted) {
          setErrorMessage(error instanceof Error ? error.message : "Could not load settings.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target;
    setErrorMessage("");
    setSuccessMessage("");
    setSettings((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!hasLoaded) return;
    setErrorMessage("");
    setSuccessMessage("");
    setIsSaving(true);
    try {
      const response = await apiFetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save settings.");
      setSettings(result.settings);
      window.dispatchEvent(new CustomEvent("organization-settings-updated", {
        detail: { organizationName: result.settings.organizationName },
      }));
      setSuccessMessage("Organization details saved.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not save settings. Check that the API is running and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <section aria-labelledby="account-details-heading" className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 shadow-2xl shadow-black/20 backdrop-blur-sm">
        <div className="space-y-5 p-6 sm:p-8">
          <div>
            <h2 id="account-details-heading" className="text-lg font-semibold tracking-tight text-white">Account details</h2>
            <p className="mt-1.5 text-sm leading-6 text-zinc-500">These sign-in details are read-only and cannot be changed here.</p>
          </div>
          {isAccountLoading ? (
            <p role="status" className="text-sm text-zinc-400">Loading account details...</p>
          ) : accountError ? (
            <p role="alert" className="text-sm text-rose-300">{accountError}</p>
          ) : account ? (
            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500"><UserRound size={15} />Name</dt>
                <dd className="mt-2 break-words text-sm font-medium text-zinc-100">{account.fullName}</dd>
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500"><Mail size={15} />Email</dt>
                <dd className="mt-2 break-all text-sm font-medium text-zinc-100">{account.email}</dd>
              </div>
            </dl>
          ) : null}
        </div>
      </section>

      <form onSubmit={handleSubmit} className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/50 shadow-2xl shadow-black/20 backdrop-blur-sm">
      <div className="space-y-6 p-6 sm:p-8">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">Organization profile</h2>
          <p className="mt-1.5 text-sm leading-6 text-zinc-500">Add the business details you want associated with this inventory account.</p>
        </div>

        {isLoading ? (
          <p role="status" className="text-sm text-zinc-400">Loading settings...</p>
        ) : !hasLoaded ? (
          <p className="text-sm text-zinc-400">Settings could not be loaded. Refresh this page to try again.</p>
        ) : (
          <>
            <div>
              <label htmlFor="organizationName" className="mb-2 block text-sm font-medium text-zinc-300">Organization name</label>
              <input id="organizationName" name="organizationName" value={settings.organizationName} onChange={handleChange} required maxLength={160} placeholder="e.g. Acme Supplies" className="h-11 w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10" />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-zinc-300">Phone <span className="font-normal text-zinc-500">(optional)</span></label>
              <input id="phone" name="phone" type="tel" value={settings.phone} onChange={handleChange} maxLength={40} placeholder="Business contact number" className="h-11 w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10" />
            </div>

            <div>
              <label htmlFor="address" className="mb-2 block text-sm font-medium text-zinc-300">Business address <span className="font-normal text-zinc-500">(optional)</span></label>
              <textarea id="address" name="address" value={settings.address} onChange={handleChange} rows={3} maxLength={500} placeholder="Street, city, and country" className="w-full resize-y rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 py-3 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/10" />
            </div>
          </>
        )}
      </div>

      {errorMessage && <p role="alert" className="mx-6 mb-5 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-3 text-sm leading-6 text-rose-200 sm:mx-8"><Info size={17} className="mt-1 shrink-0 text-rose-400" />{errorMessage}</p>}
      {successMessage && <p role="status" className="mx-6 mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-200 sm:mx-8">{successMessage}</p>}

      <div className="flex justify-end border-t border-zinc-800/80 bg-zinc-950/30 px-6 py-5 sm:px-8">
        <button type="submit" disabled={isLoading || !hasLoaded || isSaving} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-950/30 transition-all duration-300 hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70">
          <Save size={17} />
          {isSaving ? "Saving..." : "Save settings"}
        </button>
      </div>
      </form>
    </div>
  );
}
