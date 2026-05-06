import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
};

// Check for Web Speech API support
const SpeechRecognition =
  typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

export default function BrainDump({ value, onChange }: Props) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [local]);

  function handleChange(v: string) {
    setLocal(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), 500);
  }

  function toggleVoice() {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    if (!SpeechRecognition) {
      alert("Voice input isn't supported in this browser. Try Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onstart = () => setListening(true);

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interim = transcript;
        }
      }
      // Append finalized text to the brain dump
      const base = local || value;
      const separator = base && !base.endsWith("\n") && !base.endsWith(" ") ? "\n" : "";
      const combined = base + separator + finalTranscript + interim;
      setLocal(combined);
    };

    recognition.onend = () => {
      setListening(false);
      // Commit whatever we have
      const base = local || value;
      const separator = base && !base.endsWith("\n") && !base.endsWith(" ") ? "\n" : "";
      const final = base + separator + finalTranscript;
      const trimmed = final.replace(/\s+$/, " ");
      onChange(trimmed);
      setLocal(trimmed);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
      if (event.error === "not-allowed") {
        alert("Microphone access was denied. Check your browser permissions.");
      }
    };

    recognition.start();
  }

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={local}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={listening ? "Listening... speak now" : "What's loud in your head right now? Type or use the mic."}
        className={`w-full bg-surface border rounded-lg p-4 pr-12 text-text text-lg resize-none focus:outline-none min-h-[120px] ${
          listening ? "border-accent" : "border-border focus:border-accent"
        }`}
        rows={4}
      />
      {SpeechRecognition && (
        <button
          onClick={toggleVoice}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            listening
              ? "bg-accent text-bg animate-pulse"
              : "bg-surface-hover text-text-dim hover:text-text border border-border"
          }`}
          title={listening ? "Stop recording" : "Start voice input"}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
          </svg>
        </button>
      )}
      {listening && (
        <p className="text-accent text-xs mt-1 animate-pulse">Recording... click the mic again to stop</p>
      )}
    </div>
  );
}
