import type { InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function TextField({ label, id, name, ...props }: TextFieldProps) {
  const inputId = id ?? name;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-zinc-700">
        {label}
      </label>
      <input
        id={inputId}
        name={name}
        {...props}
        className="mt-2 w-full rounded-lg border border-zinc-200 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 transition focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900"
      />
    </div>
  );
}
