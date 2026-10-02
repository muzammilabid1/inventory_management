import SettingsForm from "@/components/SettingsForm";

export default function SettingsPage() {
  return (
    <>
      <header className="flex h-20 items-center border-b border-zinc-800/80 pl-[72px] pr-6 md:px-6 lg:px-10">
        <div>
          <p className="text-sm font-medium text-zinc-300">Settings</p>
          <p className="mt-0.5 text-xs text-zinc-600">Manage your organization profile</p>
        </div>
      </header>
      <main className="px-6 py-10 lg:px-10 lg:py-12">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-400">Workspace</p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">Settings</h1>
          <p className="mt-5 text-base leading-7 text-zinc-400">Update the organization details for your inventory account.</p>
        </div>
        <SettingsForm />
      </main>
    </>
  );
}
