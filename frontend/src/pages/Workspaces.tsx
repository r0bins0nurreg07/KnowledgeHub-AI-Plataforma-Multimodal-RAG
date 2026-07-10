import { useEffect, useState } from "react";
import type { FormEvent, KeyboardEvent } from "react";
import { Link } from "react-router-dom";
import {
  ApiError,
  createWorkspace,
  deleteWorkspace,
  getToken,
  listWorkspaces,
  updateWorkspace,
  type WorkspaceResponse,
} from "../api/client";
import AppHeader from "../components/AppHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import Spinner from "../components/Spinner";
import TextField from "../components/TextField";
import { useAuthUser } from "../components/RequireAuth";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Workspaces() {
  const { user } = useAuthUser();
  const [workspaces, setWorkspaces] = useState<WorkspaceResponse[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [rowError, setRowError] = useState<string | null>(null);

  const [workspaceToDelete, setWorkspaceToDelete] = useState<WorkspaceResponse | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    listWorkspaces(token)
      .then(setWorkspaces)
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : "No se pudieron cargar los workspaces");
      });
  }, []);

  async function handleCreate(event: FormEvent) {
    event.preventDefault();
    const token = getToken();
    if (!token || !newName.trim()) return;

    setCreateError(null);
    setCreating(true);

    try {
      const workspace = await createWorkspace(token, newName.trim());
      setWorkspaces((current) => [...(current ?? []), workspace]);
      setNewName("");
    } catch (err) {
      setCreateError(err instanceof ApiError ? err.message : "No se pudo crear el workspace");
    } finally {
      setCreating(false);
    }
  }

  function startEditing(workspace: WorkspaceResponse) {
    setRowError(null);
    setEditingId(workspace.id);
    setEditingName(workspace.name);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditingName("");
  }

  async function handleRename(id: string) {
    const token = getToken();
    const trimmed = editingName.trim();
    if (!token || !trimmed) {
      cancelEditing();
      return;
    }

    setRowError(null);

    try {
      const updated = await updateWorkspace(token, id, trimmed);
      setWorkspaces((current) => (current ?? []).map((w) => (w.id === id ? updated : w)));
      cancelEditing();
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : "No se pudo renombrar el workspace");
    }
  }

  function handleEditKeyDown(event: KeyboardEvent<HTMLInputElement>, id: string) {
    if (event.key === "Enter") {
      event.preventDefault();
      void handleRename(id);
    } else if (event.key === "Escape") {
      cancelEditing();
    }
  }

  async function confirmDelete() {
    const token = getToken();
    const workspace = workspaceToDelete;
    if (!token || !workspace) return;

    setRowError(null);
    setWorkspaceToDelete(null);

    try {
      await deleteWorkspace(token, workspace.id);
      setWorkspaces((current) => (current ?? []).filter((w) => w.id !== workspace.id));
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : "No se pudo eliminar el workspace");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppHeader username={user.username} />

      <main className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Workspaces</h1>
          <p className="mt-1.5 text-sm text-zinc-500">Organiza tus documentos y conversaciones por proyecto.</p>
        </div>

        <form
          onSubmit={handleCreate}
          className="mb-8 flex items-end gap-3 rounded-2xl border border-zinc-200 bg-white p-6"
        >
          <div className="flex-1">
            <TextField
              label="Nombre del workspace"
              name="workspace-name"
              placeholder="Proyecto de investigación"
              required
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="flex items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating && <Spinner />}
            {creating ? "Creando..." : "Crear workspace"}
          </button>
        </form>

        {createError && (
          <p className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
            {createError}
          </p>
        )}

        {rowError && (
          <p className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
            {rowError}
          </p>
        )}

        {loadError && (
          <p className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
            {loadError}
          </p>
        )}

        {!workspaces && !loadError && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
            <Spinner />
            Cargando workspaces...
          </div>
        )}

        {workspaces && workspaces.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-14 text-center">
            <p className="text-sm font-medium text-zinc-900">Aún no tienes workspaces</p>
            <p className="mt-1.5 text-sm text-zinc-500">
              Crea el primero arriba para empezar a organizar tus documentos.
            </p>
          </div>
        )}

        {workspaces && workspaces.length > 0 && (
          <ul className="space-y-3">
            {workspaces.map((workspace) => (
              <li
                key={workspace.id}
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  {editingId === workspace.id ? (
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(event) => setEditingName(event.target.value)}
                      onKeyDown={(event) => handleEditKeyDown(event, workspace.id)}
                      onBlur={() => void handleRename(workspace.id)}
                      className="w-full rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-sm font-medium text-zinc-900 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
                    />
                  ) : (
                    <button
                      onClick={() => startEditing(workspace)}
                      className="truncate rounded text-left text-sm font-medium text-zinc-900 hover:text-zinc-600 focus:outline-none"
                      title="Click para renombrar"
                    >
                      {workspace.name}
                    </button>
                  )}
                  <p className="mt-0.5 text-xs text-zinc-400">Creado el {formatDate(workspace.created_at)}</p>
                </div>

                <div className="ml-4 flex shrink-0 items-center gap-2">
                  <Link
                    to={`/workspaces/${workspace.id}`}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
                  >
                    Abrir
                  </Link>
                  <button
                    onClick={() => setWorkspaceToDelete(workspace)}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <ConfirmDialog
        open={workspaceToDelete !== null}
        title="Eliminar workspace"
        description={`¿Eliminar el workspace "${workspaceToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setWorkspaceToDelete(null)}
      />
    </div>
  );
}
