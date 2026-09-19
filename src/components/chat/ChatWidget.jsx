import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatPanel from './ChatPanel.jsx';

/** Floating help button. Deliberately secondary: the portal itself is the product. */
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-20 right-4 z-40 lg:bottom-6 lg:right-6">
      {open && (
        <div
          className="mb-3 flex h-[min(560px,70vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-lg border border-brand-border bg-surface shadow-[0_8px_30px_rgba(10,10,10,0.12)]"
          role="dialog"
          aria-label="Royal Square Assistant"
        >
          <div className="flex items-center justify-between border-b border-brand-border px-4 py-3">
            <div>
              <p className="font-display font-medium">Royal Square Assistant</p>
              <p className="text-[12.5px] text-brand-grey">Help with services and statuses</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded p-1.5 hover:bg-brand-light-grey" aria-label="Close assistant">
              <X size={18} />
            </button>
          </div>
          <ChatPanel className="flex-1" autoFocus />
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="ml-auto flex items-center gap-2 rounded-full border border-brand-border bg-surface px-4 py-3 text-[14px] font-semibold shadow-[0_4px_14px_rgba(10,10,10,0.10)] hover:border-brand-red"
        aria-expanded={open}
      >
        <MessageCircle size={18} className="text-brand-red" aria-hidden="true" />
        <span className="hidden sm:inline">Need help?</span>
      </button>
    </div>
  );
}
