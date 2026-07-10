import { useNavigate } from "react-router-dom";
import { clearToken } from "../api/client";

interface AppHeaderProps {
  username: string;
}

export default function AppHeader({ username }: AppHeaderProps) {
  const navigate = useNavigate();

  function handleLogout() {
    clearToken();
    navigate("/login");
  }

  return (
    <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-sm font-semibold text-white">
          K
        </div>
        <p className="text-sm font-medium text-zinc-900">KnowledgeHub AI</p>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-500">{username}</span>
        <button
          onClick={handleLogout}
          className="rounded-lg border border-zinc-200 bg-white px-3.5 py-2 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}
