import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import api from "../../services/api"

export default function GlobalChatAssistant() {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi 👋 I’m your AI Interview Coach. Ask me anything!" },
  ])

  const listRef = useRef(null)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    if (!open) return
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [open, messages, loading])

  const close = () => {
    setOpen(false)
    setError("")
  }

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    setError("")
    setInput("")
    const nextMessages = [...messages, { role: "user", content: text }]
    setMessages(nextMessages)
    setLoading(true)

    try {
      const { data } = await api.post("/chat", {
        // send conversation so backend can respond with context
        messages: nextMessages,
      })
      if (!data?.reply) throw new Error("Invalid response from server")

      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }])
    } catch (e) {
      setError(e?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
    if (e.key === "Escape") close()
  }

  const clearChat = () => {
    setError("")
    setLoading(false)
    setMessages([{ role: "assistant", content: "Cleared ✅ Ask me a new question." }])
  }

  if (!mounted) return null

  return createPortal(
    <>
      {/* Floating button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed !fixed !bottom-6 !right-6 z-[9999] rounded-full bg-orange-600 text-white px-4 py-3 shadow-lg hover:scale-[1.03] active:scale-95 transition"
        style={{ position: "fixed", right: "1.5rem", bottom: "1.5rem", left: "auto" }}
        aria-label="Open AI Interview Coach"
      >
        Ask Coach
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] bg-black/30 backdrop-blur-[2px] flex items-end sm:items-center justify-center"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close()
          }}
        >
          <div className="w-full sm:w-[420px] h-[75vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="flex flex-col">
                <div className="font-semibold leading-tight">AI Interview Coach</div>
                <div className="text-xs text-gray-500">Mock prep • feedback • practice</div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={clearChat}
                  className="text-xs px-3 py-1 rounded-full border hover:bg-gray-50"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={close}
                  className="h-9 w-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-xl"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm whitespace-pre-wrap ${
                    m.role === "user"
                      ? "ml-auto bg-orange-600 text-white"
                      : "mr-auto bg-white text-gray-900 border"
                  }`}
                >
                  {m.content}
                </div>
              ))}

              {loading && (
                <div className="mr-auto bg-white border rounded-2xl px-3 py-2 text-sm shadow-sm w-fit">
                  Typing…
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  {error}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t bg-white">
              <div className="flex gap-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder="Type your question… (Enter to send, Esc to close)"
                  className="flex-1 resize-none border rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={send}
                  disabled={loading}
                  className="px-4 rounded-xl bg-orange-600 text-white text-sm font-medium hover:opacity-95 disabled:opacity-60 active:scale-95 transition"
                >
                  Send
                </button>
              </div>
              <div className="mt-2 text-[11px] text-gray-500">
                Tip: Ask for interview answers, resume feedback, or mock questions.
              </div>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  )
}
