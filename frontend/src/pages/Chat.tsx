import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ApiError,
  askQuestionStream,
  getChatMessages,
  getToken,
  getWorkspace,
  listChats,
  type ChatResponse,
  type MessageResponse,
  type WorkspaceResponse,
} from "../api/client";
import AppHeader from "../components/AppHeader";
import Spinner from "../components/Spinner";
import { useAuthUser } from "../components/RequireAuth";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export default function Chat() {
  const { user } = useAuthUser();
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [chats, setChats] = useState<ChatResponse[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);

  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getToken();
    if (!token || !workspaceId) return;

    Promise.all([getWorkspace(token, workspaceId), listChats(token, workspaceId)])
      .then(([workspaceData, chatsData]) => {
        setWorkspace(workspaceData);
        setChats(chatsData);
      })
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : "No se pudo cargar el workspace");
      });
  }, [workspaceId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSelectChat(chatId: string) {
    const token = getToken();
    if (!token) return;

    setSelectedChatId(chatId);
    setAskError(null);
    setMessagesLoading(true);

    try {
      const history = await getChatMessages(token, chatId);
      setMessages(
        history.map((message: MessageResponse) => ({
          id: message.id,
          role: message.role,
          content: message.content,
        })),
      );
    } catch (err) {
      setAskError(err instanceof ApiError ? err.message : "No se pudo cargar la conversación");
    } finally {
      setMessagesLoading(false);
    }
  }

  function handleNewChat() {
    setSelectedChatId(null);
    setMessages([]);
    setAskError(null);
  }

  async function handleAsk(event: FormEvent) {
    event.preventDefault();

    const token = getToken();
    const trimmed = question.trim();
    if (!token || !workspaceId || !trimmed || asking) return;

    setAsking(true);
    setAskError(null);

    const userMessage: DisplayMessage = {
      id: `local-${Date.now()}`,
      role: "user",
      content: trimmed,
    };
    const assistantMessageId = `assistant-${Date.now()}`;
    const assistantMessage: DisplayMessage = {
      id: assistantMessageId,
      role: "assistant",
      content: "",
    };

    setMessages((current) => [...current, userMessage, assistantMessage]);
    setQuestion("");

    let resolvedChatId: string | null = selectedChatId;

    try {
      await askQuestionStream(token, workspaceId, trimmed, selectedChatId ?? undefined, (streamEvent) => {
        if (streamEvent.type === "meta") {
          resolvedChatId = streamEvent.chat_id;
        } else if (streamEvent.type === "token") {
          setMessages((current) =>
            current.map((m) =>
              m.id === assistantMessageId ? { ...m, content: m.content + streamEvent.text } : m,
            ),
          );
        } else if (streamEvent.type === "sources") {
          setMessages((current) =>
            current.map((m) => (m.id === assistantMessageId ? { ...m, sources: streamEvent.sources } : m)),
          );
        }
      });

      if (!selectedChatId && resolvedChatId) {
        const newChatId = resolvedChatId;
        setSelectedChatId(newChatId);
        setChats((current) => [
          { id: newChatId, title: trimmed.slice(0, 80), workspace_id: workspaceId, created_at: new Date().toISOString() },
          ...(current ?? []),
        ]);
      }
    } catch (err) {
      setAskError(err instanceof ApiError ? err.message : "No se pudo obtener una respuesta");
      setMessages((current) => current.filter((m) => m.id !== userMessage.id && m.id !== assistantMessageId));
      setQuestion(trimmed);
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-50">
      <AppHeader username={user.username} />

      <div className="flex min-h-0 flex-1">
        <aside className="flex w-72 shrink-0 flex-col border-r border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 p-4">
            <Link
              to={`/workspaces/${workspaceId}`}
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
            >
              ← {workspace ? workspace.name : "Workspace"}
            </Link>
            <button
              type="button"
              onClick={handleNewChat}
              className="w-full rounded-lg bg-zinc-900 px-3.5 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
            >
              + Nueva conversación
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {!chats && !loadError && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-zinc-500">
                <Spinner />
                Cargando...
              </div>
            )}

            {chats && chats.length === 0 && (
              <p className="px-3 py-6 text-center text-sm text-zinc-400">
                Aún no hay conversaciones. Escribe tu primera pregunta.
              </p>
            )}

            {chats?.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`mb-1 w-full truncate rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  selectedChatId === chat.id
                    ? "bg-zinc-100 font-medium text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-50"
                }`}
              >
                {chat.title}
              </button>
            ))}
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          {loadError && (
            <p className="m-6 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
              {loadError}
            </p>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-8">
            {messagesLoading && (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
                <Spinner />
                Cargando mensajes...
              </div>
            )}

            {!messagesLoading && messages.length === 0 && (
              <div className="mx-auto max-w-lg pt-16 text-center">
                <p className="text-sm font-medium text-zinc-900">Pregunta lo que quieras sobre tus documentos</p>
                <p className="mt-1.5 text-sm text-zinc-500">
                  Las respuestas se generan a partir del contenido indexado en este workspace.
                </p>
              </div>
            )}

            <div className="mx-auto max-w-2xl space-y-5">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      message.role === "user"
                        ? "bg-zinc-900 text-white"
                        : "border border-zinc-200 bg-white text-zinc-900"
                    }`}
                  >
                    {message.role === "assistant" && message.content === "" && asking ? (
                      <div className="flex items-center gap-2 text-zinc-500">
                        <Spinner />
                        Pensando...
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}

                    {message.sources && message.sources.length > 0 && (
                      <details className="mt-3 border-t border-zinc-100 pt-2">
                        <summary className="cursor-pointer text-xs font-medium text-zinc-400 hover:text-zinc-600">
                          {message.sources.length} fuente{message.sources.length > 1 ? "s" : ""}
                        </summary>
                        <ul className="mt-2 space-y-2">
                          {message.sources.map((source, index) => (
                            <li key={index} className="rounded-lg bg-zinc-50 px-2.5 py-2 text-xs text-zinc-500">
                              {source.length > 240 ? `${source.slice(0, 240)}…` : source}
                            </li>
                          ))}
                        </ul>
                      </details>
                    )}
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <div className="border-t border-zinc-200 bg-white px-6 py-4">
            {askError && (
              <p className="mx-auto mb-3 max-w-2xl rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
                {askError}
              </p>
            )}

            <form onSubmit={handleAsk} className="mx-auto flex max-w-2xl items-end gap-3">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    handleAsk(event);
                  }
                }}
                placeholder="Escribe tu pregunta..."
                rows={1}
                className="max-h-40 flex-1 resize-none rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
              />
              <button
                type="submit"
                disabled={asking || !question.trim()}
                className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {asking && <Spinner />}
                Enviar
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
