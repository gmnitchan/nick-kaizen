import { useState } from "react";

export default function HelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-text-dim hover:text-text"
      >
        ?
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-8" onClick={() => setOpen(false)}>
          <div className="bg-bg border border-border rounded-xl max-w-[520px] w-full p-6 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold">How this app works</h2>
              <button onClick={() => setOpen(false)} className="text-text-dim hover:text-text text-lg">x</button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h3 className="font-semibold text-accent mb-1">The daily cycle</h3>
                <p className="text-text-dim">
                  Every night, write a Night Brief to plan tomorrow. Every morning, the app shows your one highlight and lets you pick a sprint to start working. During the day, work through sprints one at a time.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-accent mb-1">Night Brief (evening)</h3>
                <ul className="text-text-dim space-y-1 list-disc ml-4">
                  <li>Brain dump: write anything on your mind to clear your head</li>
                  <li>Highlight: the ONE most important thing for tomorrow</li>
                  <li>Sort tasks into 4 sprint categories using the "Add task" fields</li>
                  <li>Optionally pull lines from your brain dump into tasks</li>
                  <li>Lock it in when done — no more changes</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-accent mb-1">Morning Launch (morning)</h3>
                <ul className="text-text-dim space-y-1 list-disc ml-4">
                  <li>Shows your highlight in big text — that's your focus</li>
                  <li>Check off morning rituals (gym, feed birds, meditation, consume art)</li>
                  <li>Pick a sprint category to start working</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-accent mb-1">Sprint Board (during work)</h3>
                <ul className="text-text-dim space-y-1 list-disc ml-4">
                  <li><strong>Start</strong> = begin tracking time on this task</li>
                  <li><strong>Done</strong> = mark complete, stop tracking</li>
                  <li><strong>Skip</strong> = not doing it today</li>
                  <li>Timer at top tracks total sprint time</li>
                  <li>Switch sprints or end the sprint when ready</li>
                  <li>You can add new tasks at the bottom any time</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-accent mb-1">Mode switcher (top right)</h3>
                <p className="text-text-dim">
                  The app auto-picks the right mode based on time of day, but you can always switch manually using the dropdown in the top-right corner.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-accent mb-1">Your data</h3>
                <p className="text-text-dim">
                  Everything is saved in your browser's local storage — no cloud, no accounts. Use Stats → Export to back up your data as a JSON file.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
