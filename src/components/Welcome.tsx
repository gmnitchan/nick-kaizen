type Props = {
  onDismiss: () => void;
};

export default function Welcome({ onDismiss }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="max-w-[560px] text-center">
        <h1 className="text-4xl font-bold mb-2">Hey Nick.</h1>
        <p className="text-text-dim text-lg mb-10">
          This is your daily operating system. Here's how it works.
        </p>

        <div className="text-left space-y-6 mb-12">
          <div className="bg-surface border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-accent text-bg text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0">1</span>
              <h2 className="font-semibold text-lg">Night Brief (every evening)</h2>
            </div>
            <p className="text-text-dim text-sm ml-10">
              Dump everything in your head, pick ONE highlight for tomorrow, and sort tasks into 4 sprint categories. Lock it in, then close the laptop. Takes 5 minutes.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-accent text-bg text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0">2</span>
              <h2 className="font-semibold text-lg">Morning Launch (when you open the laptop)</h2>
            </div>
            <p className="text-text-dim text-sm ml-10">
              You'll see your ONE highlight front and center. Check off your morning ritual, then pick a sprint to start. No overwhelm, just one choice.
            </p>
          </div>

          <div className="bg-surface border border-border rounded-lg p-5">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-accent text-bg text-sm font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0">3</span>
              <h2 className="font-semibold text-lg">Sprint Board (during work)</h2>
            </div>
            <p className="text-text-dim text-sm ml-10">
              Work one sprint at a time. A timer tracks your session. Hit "Start" on a task to track time on it, "Done" when finished, "Skip" to move on. Switch sprints or end when ready.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm text-text-dim uppercase tracking-wider mb-3">The 4 sprints</h3>
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="bg-surface rounded-lg p-3">
              <div className="font-medium mb-1">🔥 Soberin Revenue</div>
              <p className="text-text-dim text-xs">Vibe coding, software services, immediate $</p>
            </div>
            <div className="bg-surface rounded-lg p-3">
              <div className="font-medium mb-1">📞 Outreach</div>
              <p className="text-text-dim text-xs">Clients, investors, networking, collaborators</p>
            </div>
            <div className="bg-surface rounded-lg p-3">
              <div className="font-medium mb-1">🛠️ Build Mode</div>
              <p className="text-text-dim text-xs">Deep work, prototypes, creative, side projects</p>
            </div>
            <div className="bg-surface rounded-lg p-3">
              <div className="font-medium mb-1">📋 Admin</div>
              <p className="text-text-dim text-xs">Emails, follow-ups, paperwork, the avoided stuff</p>
            </div>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="bg-accent text-bg font-bold text-lg px-8 py-3 rounded-lg hover:bg-accent-dim transition-colors"
        >
          Got it — let's go
        </button>

        <p className="text-text-dim text-xs mt-4">
          Set this page as your browser homepage so it loads when you open the laptop.
        </p>
      </div>
    </div>
  );
}
