import { useState } from "react";
import { useAppState, addSprintDef, updateSprintDef, archiveSprint, restoreSprint, getActiveSprints, getArchivedSprints } from "../state/store";

export default function SprintSettings() {
  const state = useAppState();
  const activeSprints = getActiveSprints();
  const archivedSprints = getArchivedSprints();
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newEmoji, setNewEmoji] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  function handleAdd() {
    if (!newLabel.trim()) return;
    addSprintDef(newLabel.trim(), newEmoji.trim() || "~", newDesc.trim());
    setNewLabel("");
    setNewEmoji("");
    setNewDesc("");
    setAdding(false);
  }

  function handleSaveEdit(id: string, label: string, emoji: string, description: string) {
    updateSprintDef(id, { label, emoji, description });
    setEditingId(null);
  }

  // Count tasks per sprint (for archive warning)
  function pendingCount(sprintId: string): number {
    return Object.values(state.tasks).filter(
      (t) => t.sprint === sprintId && t.status === "pending"
    ).length;
  }

  return (
    <div className="max-w-[720px] mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-1 text-center">Sprint Settings</h1>
      <p className="text-text-dim text-sm text-center mb-8">
        Add, edit, or archive sprints. Archived sprints keep their data in Stats.
      </p>

      {/* Active sprints */}
      <div className="mb-8">
        <h2 className="text-sm text-text-dim uppercase tracking-wider mb-3">Active sprints</h2>
        <div className="space-y-2">
          {activeSprints.map((sp) => {
            const pending = pendingCount(sp.id);
            if (editingId === sp.id) {
              return <EditRow key={sp.id} def={sp} onSave={handleSaveEdit} onCancel={() => setEditingId(null)} />;
            }
            return (
              <div key={sp.id} className="flex items-center gap-3 bg-surface border border-border rounded-lg p-3 group">
                <span className="text-xl">{sp.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{sp.label}</div>
                  <div className="text-text-dim text-xs">{sp.description}</div>
                </div>
                {pending > 0 && (
                  <span className="text-xs text-text-dim">{pending} pending</span>
                )}
                <button
                  onClick={() => setEditingId(sp.id)}
                  className="text-xs text-text-dim hover:text-text opacity-0 group-hover:opacity-100"
                >
                  edit
                </button>
                <button
                  onClick={() => {
                    if (pending > 0) {
                      if (!confirm(`"${sp.label}" has ${pending} pending task${pending !== 1 ? "s" : ""}. Archive anyway? Tasks will be preserved but the sprint won't appear in your daily workflow.`)) return;
                    }
                    archiveSprint(sp.id);
                  }}
                  className="text-xs text-text-dim hover:text-yellow opacity-0 group-hover:opacity-100"
                >
                  archive
                </button>
              </div>
            );
          })}
        </div>

        {!adding && (
          <button
            onClick={() => setAdding(true)}
            className="mt-3 text-sm text-accent hover:text-accent-dim"
          >
            + Add new sprint
          </button>
        )}

        {adding && (
          <div className="mt-3 bg-surface border border-accent/30 rounded-lg p-4 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                placeholder="Emoji"
                className="w-16 bg-bg border border-border rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-accent"
              />
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Sprint name"
                className="flex-1 bg-bg border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Short description (what goes here?)"
              className="w-full bg-bg border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAdd}
                disabled={!newLabel.trim()}
                className="text-sm px-3 py-1 rounded bg-accent text-bg font-medium hover:bg-accent-dim disabled:opacity-30"
              >
                Add sprint
              </button>
              <button
                onClick={() => { setAdding(false); setNewLabel(""); setNewEmoji(""); setNewDesc(""); }}
                className="text-sm text-text-dim hover:text-text"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Archived sprints */}
      {archivedSprints.length > 0 && (
        <div>
          <h2 className="text-sm text-text-dim uppercase tracking-wider mb-3">Archived sprints</h2>
          <p className="text-text-dim text-xs mb-3">
            These sprints no longer appear in your daily workflow, but their task data is preserved in Stats.
          </p>
          <div className="space-y-2">
            {archivedSprints.map((sp) => (
              <div key={sp.id} className="flex items-center gap-3 bg-surface border border-border rounded-lg p-3 opacity-60 group">
                <span className="text-xl">{sp.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{sp.label}</div>
                  <div className="text-text-dim text-xs">{sp.description}</div>
                  {sp.archivedAt && (
                    <div className="text-text-dim text-xs mt-0.5">
                      Archived {new Date(sp.archivedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => restoreSprint(sp.id)}
                  className="text-xs text-accent hover:text-accent-dim opacity-0 group-hover:opacity-100"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function EditRow({ def, onSave, onCancel }: {
  def: { id: string; label: string; emoji: string; description: string };
  onSave: (id: string, label: string, emoji: string, desc: string) => void;
  onCancel: () => void;
}) {
  const [label, setLabel] = useState(def.label);
  const [emoji, setEmoji] = useState(def.emoji);
  const [desc, setDesc] = useState(def.description);

  return (
    <div className="bg-surface border border-accent/30 rounded-lg p-3 space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={emoji}
          onChange={(e) => setEmoji(e.target.value)}
          className="w-16 bg-bg border border-border rounded px-2 py-1 text-sm text-center focus:outline-none focus:border-accent"
        />
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="flex-1 bg-bg border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
        />
      </div>
      <input
        type="text"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="w-full bg-bg border border-border rounded px-2 py-1 text-sm focus:outline-none focus:border-accent"
      />
      <div className="flex gap-2">
        <button
          onClick={() => onSave(def.id, label, emoji, desc)}
          className="text-sm px-3 py-1 rounded bg-accent text-bg font-medium hover:bg-accent-dim"
        >
          Save
        </button>
        <button onClick={onCancel} className="text-sm text-text-dim hover:text-text">
          Cancel
        </button>
      </div>
    </div>
  );
}
