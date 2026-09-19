import { useEffect, useRef, useState } from 'react';
import { Loader2, SendHorizontal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { sendChatMessage, SUGGESTED_QUESTIONS } from '../../services/chatService.js';
import { DEMO_CLIENT_ID } from '../../data/mockData.js';

const WELCOME = {
  role: 'assistant',
  content: 'Hi, I’m the Royal Square Assistant. I can help you find your way around: reporting an accident, uploading documents, making requests, or explaining what a status means.',
};

function AssistantMessage({ content }) {
  return (
    <div className="chat-markdown max-w-[85%] rounded-lg bg-brand-light-grey px-3.5 py-2.5 text-[14.5px] leading-relaxed text-brand-black">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

/** Conversation UI shared by the floating widget and the Chat Assistant page. */
export default function ChatPanel({ clientId = DEMO_CLIENT_ID, className = '', autoFocus = false }) {
  const [messages, setMessages] = useState([WELCOME]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [usedGuide, setUsedGuide] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  async function send(text) {
    const content = text.trim();
    if (!content || sending) return;
    const next = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setSending(true);
    const history = next.filter((m) => m !== WELCOME);
    const { reply, source } = await sendChatMessage(history, { clientId });
    if (source === 'guide') setUsedGuide(true);
    setMessages((m) => [...m, { role: 'assistant', content: reply }]);
    setSending(false);
  }

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' ? (
              <AssistantMessage content={m.content} />
            ) : (
              <p className="max-w-[85%] whitespace-pre-wrap rounded-lg bg-strong px-3.5 py-2.5 text-[14.5px] leading-relaxed text-white">{m.content}</p>
            )}
          </div>
        ))}
        {sending && (
          <div className="flex items-center gap-2 text-[14px] text-brand-grey" role="status">
            <Loader2 size={16} className="animate-spin" aria-hidden="true" /> Thinking…
          </div>
        )}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button key={q} type="button" onClick={() => send(q)} className="rounded-full border border-brand-border px-3 py-1.5 text-left text-[13.5px] hover:border-brand-red hover:text-brand-red">
                {q}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-brand-border p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex gap-2"
        >
          <label htmlFor="chat-input" className="sr-only">
            Ask a question
          </label>
          <input
            id="chat-input"
            className="field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a process or page"
            autoFocus={autoFocus}
            autoComplete="off"
          />
          <button type="submit" disabled={!input.trim() || sending} className="rounded bg-action px-3 text-white hover:bg-brand-red-dark disabled:opacity-40" aria-label="Send">
            <SendHorizontal size={18} />
          </button>
        </form>
        <p className="mt-2 text-[12px] leading-snug text-brand-grey">
          The assistant explains services and statuses. It doesn't give financial advice or decide claims.
          {usedGuide && ' Answering from the built-in guide because the live assistant isn’t connected.'}
        </p>
      </div>
    </div>
  );
}
