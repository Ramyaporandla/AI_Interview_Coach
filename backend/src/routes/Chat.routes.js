import express from "express"

const router = express.Router()

// POST /api/chat
router.post("/", async (req, res) => {
  try {
    const { messages } = req.body

    const lastUserMessage =
      messages?.filter(m => m.role === "user").pop()?.content || "Hello"

    return res.json({
      reply: `👋 Hi! I received your message: "${lastUserMessage}"`
    })
  } catch (error) {
    console.error("Chat route error:", error)
    return res.status(500).json({ error: "Chat server error" })
  }
})

export default router
