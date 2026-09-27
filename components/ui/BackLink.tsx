import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-indigo-600">
      <ArrowLeft className="h-4 w-4" /> {label}
    </Link>
  );
}
