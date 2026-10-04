# Rust & Tauri v2 Chat Integration Architecture Plan

This document outlines the architecture, crate selection, and file implementation plan for adding chat support to ProjectFlow using Rust and Tauri v2.

---

## 1. Architectural Options

### Option A: AI Assistant / LLM Streaming Chat (Recommended for Task & Dev Management)
- **Goal:** Streaming assistance, prompt engineering, task breakdown, or local/remote AI integration.
- **IPC Mechanism:** Tauri v2 `tauri::ipc::Channel` for ordered, low-latency token streaming from Rust into React without JSON event serialization overhead.
- **Recommended Rust Crates:**
  - `reqwest` (`features = ["json", "stream"]`): Async HTTP client for streaming Server-Sent Events (SSE).
  - `eventsource-stream`: Parses SSE streams into discrete token deltas.
  - *(Optional local AI alternative)*: `ollama-rs` for offline local LLMs.

### Option B: Real-Time Team / User Chat (WebSocket)
- **Goal:** Live collaboration between users across local network (LAN) or a central server.
- **Recommended Packages:**
  - `@tauri-apps/plugin-websocket` (frontend client) + `tauri-plugin-websocket` (Rust backend).
  - *(Alternative pure Rust)*: `tokio-tungstenite`.

### Option C: Customer Support & Help Desk
- **Goal:** In-app ticket submission / support desk messages sent to webhooks (Discord, Slack, Chatwoot).
- **Recommended Crates:** Standard `reqwest` with REST POST payloads.

---

## 2. Implementation Footprint (Files to Add & Modify)

When ready to implement Option A (AI Streaming Chat):

### Rust Backend
1. **`src-tauri/Cargo.toml`** (Edit)
   - Add `reqwest = { version = "0.12", features = ["json", "stream"] }`
   - Add `tokio = { version = "1", features = ["rt-multi-thread", "macros"] }`
   - Add `eventsource-stream = "0.2"`

2. **`src-tauri/src/chat.rs`** (Add) & **`src-tauri/src/main.rs`** (Edit)
   - Implement Tauri IPC command:
     ```rust
     #[tauri::command]
     async fn stream_chat_response(
         prompt: String,
         on_chunk: tauri::ipc::Channel<String>
     ) -> Result<(), String> {
         // Stream tokens and send via on_chunk.send(chunk)
         Ok(())
     }
     ```
   - Register command in the Tauri builder handlers.

### Frontend (React + TypeScript)
3. **`src/services/chatService.ts`** (Add)
   - Create Tauri `Channel` listener to receive incoming streamed text chunks.
   - Provide fallback mock streaming for browser/web dev mode.

4. **`src/components/chat/ChatPane.tsx`** (Add)
   - Conversation history view, markdown rendering, auto-scrolling message list, prompt input bar, and clear conversation button.

5. **`src/components/shell/ActivityRail.tsx` & `src/App.tsx`** (Edit)
   - Add Chat view tab icon (`MessageSquare` icon) and mount `ChatPane` into the main application layout.

---

## 3. Summary
- Total files modified/created: ~4-5 files.
- Memory & binary overhead: Minimal (~1.5 MB addition to final binary).
- Fully compatible with the existing standalone portable architecture.
