export function isDemoModeClient() {
  return true; // client never sees the key; server passes demoMode prop
}

export function DemoBanner({ demoMode }: { demoMode: boolean }) {
  if (!demoMode) return null;
  return (
    <div className="border-b border-medium/25 bg-medium/8 px-4 py-1.5 text-center text-[11px] text-medium">
      Demo Mode — OpenAI key not configured. Real attack modules use deterministic demo results.
    </div>
  );
}
