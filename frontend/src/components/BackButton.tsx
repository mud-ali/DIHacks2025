import Link from "next/link";

interface BackButtonProps {
  href?: string;
  label?: string;
}

export default function BackButton({ href = "/", label = "Back to Home" }: BackButtonProps) {
  return (
    <div className="max-w-6xl mx-auto mb-4">
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white transition-colors group"
      >
        <svg
          className="w-5 h-5 transition-transform group-hover:-translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        {label}
      </Link>
    </div>
  );
}
