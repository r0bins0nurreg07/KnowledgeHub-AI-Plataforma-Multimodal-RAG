import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ApiError,
  deleteDocument,
  getWorkspace,
  listDocuments,
  getToken,
  MAX_UPLOAD_SIZE_MB,
  uploadDocument,
  type DocumentResponse,
  type WorkspaceResponse,
} from "../api/client";
import AppHeader from "../components/AppHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import Spinner from "../components/Spinner";
import { useAuthUser } from "../components/RequireAuth";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_LABELS: Record<DocumentResponse["status"], string> = {
  indexed: "Indexado",
  error: "Error",
  uploaded: "Subido",
  processing: "Procesando",
};

const STATUS_STYLES: Record<DocumentResponse["status"], string> = {
  indexed: "border-emerald-200 bg-emerald-50 text-emerald-600",
  error: "border-rose-200 bg-rose-50 text-rose-600",
  uploaded: "border-zinc-200 bg-zinc-50 text-zinc-500",
  processing: "border-zinc-200 bg-zinc-50 text-zinc-500",
};

function StatusBadge({ status }: { status: DocumentResponse["status"] }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function Documents() {
  const { user } = useAuthUser();
  const { workspaceId } = useParams<{ workspaceId: string }>();

  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentResponse[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [rowError, setRowError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [documentToDelete, setDocumentToDelete] = useState<DocumentResponse | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token || !workspaceId) return;

    Promise.all([getWorkspace(token, workspaceId), listDocuments(token, workspaceId)])
      .then(([workspaceData, documentsData]) => {
        setWorkspace(workspaceData);
        setDocuments(documentsData);
      })
      .catch((err) => {
        setLoadError(err instanceof ApiError ? err.message : "No se pudo cargar el workspace");
      });
  }, [workspaceId]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);

    const oversized = files.filter((file) => file.size > MAX_UPLOAD_SIZE_MB * 1024 * 1024);

    if (oversized.length > 0) {
      setUploadError(
        `${oversized.map((file) => `"${file.name}" (${formatFileSize(file.size)})`).join(", ")} supera${
          oversized.length > 1 ? "n" : ""
        } el límite de ${MAX_UPLOAD_SIZE_MB} MB.`,
      );
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setUploadError(null);
    setSelectedFiles(files);
  }

  async function handleUpload() {
    const token = getToken();
    if (!token || !workspaceId || selectedFiles.length === 0) return;

    setUploadError(null);
    setUploading(true);

    const results = await Promise.allSettled(
      selectedFiles.map((file) => uploadDocument(token, workspaceId, file)),
    );

    const uploaded = results
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    const failed = results.filter((result) => result.status === "rejected");

    if (uploaded.length > 0) {
      setDocuments((current) => [...uploaded, ...(current ?? [])]);
    }

    if (failed.length > 0) {
      setUploadError(
        `${failed.length} de ${selectedFiles.length} archivo${selectedFiles.length > 1 ? "s" : ""} no se pudo${
          failed.length > 1 ? "n" : ""
        } subir.`,
      );
    }

    setSelectedFiles([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUploading(false);
  }

  async function confirmDelete() {
    const token = getToken();
    const document = documentToDelete;
    if (!token || !document) return;

    setRowError(null);
    setDocumentToDelete(null);

    try {
      await deleteDocument(token, document.id);
      setDocuments((current) => (current ?? []).filter((d) => d.id !== document.id));
    } catch (err) {
      setRowError(err instanceof ApiError ? err.message : "No se pudo eliminar el documento");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <AppHeader username={user.username} />

      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-500 transition hover:text-zinc-900"
        >
          ← Volver a workspaces
        </Link>

        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
              {workspace ? workspace.name : "Documentos"}
            </h1>
            <p className="mt-1.5 text-sm text-zinc-500">Sube y administra los documentos de este workspace.</p>
          </div>

          {workspaceId && (
            <Link
              to={`/workspaces/${workspaceId}/chat`}
              className="shrink-0 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
            >
              Ir al chat →
            </Link>
          )}
        </div>

        <div className="mb-8 rounded-2xl border border-zinc-200 bg-white p-6">
          <label className="block text-sm font-medium text-zinc-700">Documentos</label>
          <div className="mt-2 flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt,.xlsx"
              onChange={handleFileChange}
              className="w-full flex-1 rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-zinc-700 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
            />
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || selectedFiles.length === 0}
              className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading && <Spinner />}
              {uploading
                ? "Subiendo..."
                : selectedFiles.length > 1
                  ? `Subir ${selectedFiles.length} documentos`
                  : "Subir documento"}
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            PDF, DOCX, XLSX o TXT · Tamaño máximo {MAX_UPLOAD_SIZE_MB} MB por archivo
            {selectedFiles.length > 0 &&
              ` · ${selectedFiles.length} archivo${selectedFiles.length > 1 ? "s" : ""} seleccionado${selectedFiles.length > 1 ? "s" : ""}`}
          </p>
        </div>

        {uploadError && (
          <p className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm text-rose-600">
            {uploadError}
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

        {!documents && !loadError && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-zinc-500">
            <Spinner />
            Cargando documentos...
          </div>
        )}

        {documents && documents.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white px-6 py-14 text-center">
            <p className="text-sm font-medium text-zinc-900">Aún no tienes documentos</p>
            <p className="mt-1.5 text-sm text-zinc-500">
              Sube el primero arriba para empezar a construir tu base de conocimiento.
            </p>
          </div>
        )}

        {documents && documents.length > 0 && (
          <ul className="space-y-3">
            {documents.map((document) => (
              <li
                key={document.id}
                className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-5 py-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-zinc-900">{document.filename}</p>
                    <StatusBadge status={document.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {formatFileSize(document.file_size)} · Subido el {formatDate(document.created_at)}
                  </p>
                </div>

                <button
                  onClick={() => setDocumentToDelete(document)}
                  className="ml-4 shrink-0 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium text-zinc-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>

      <ConfirmDialog
        open={documentToDelete !== null}
        title="Eliminar documento"
        description={`¿Eliminar el documento "${documentToDelete?.filename}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDocumentToDelete(null)}
      />
    </div>
  );
}
