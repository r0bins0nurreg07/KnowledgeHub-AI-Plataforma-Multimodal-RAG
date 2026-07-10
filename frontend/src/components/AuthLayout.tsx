import type { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
}

export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-sm font-semibold text-white">
            K
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-zinc-900">KnowledgeHub AI</p>
            <p className="text-sm text-zinc-400">Plataforma multimodal de RAG</p>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 sm:p-10">
          <h2 className="text-xl font-semibold tracking-tight text-zinc-900">{title}</h2>
          <p className="mt-1.5 text-sm text-zinc-500">{subtitle}</p>

          <div className="mt-8">{children}</div>
        </div>

        <p className="mt-8 text-center text-sm text-zinc-500">{footer}</p>
      </div>
    </div>
  );
}
