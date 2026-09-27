"use client";

import { Check, X } from "lucide-react";
import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { TagChip } from "@/components/ui/Badges";
import { controlClass } from "@/components/ui/Form";
import { DEFAULT_TAG_COLOR } from "@/lib/constants";
import type { Tag } from "@/lib/types";

interface Props {
  id?: string;
  tags: Tag[];
  value: number[];
  onChange: (ids: number[]) => void;
  invalid?: boolean;
}

/** Searchable multi-select: selected tags show as removable chips, options open in a dropdown list. */
export function TagMultiSelect({ id, tags, value, onChange, invalid }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (open) listRef.current?.scrollIntoView({ block: "nearest" });
  }, [open]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const selected = value.map((v) => tags.find((t) => t.tagId === v)).filter((t): t is Tag => !!t);
  const filtered = tags.filter((t) => t.tagName.toLowerCase().includes(query.trim().toLowerCase()));

  const toggle = (tagId: number) =>
    onChange(value.includes(tagId) ? value.filter((v) => v !== tagId) : [...value, tagId]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !query && value.length) onChange(value.slice(0, -1));
    if (e.key === "Escape" && open) {
      e.preventDefault(); // tells the surrounding Modal not to close
      setOpen(false);
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered.length === 1) {
        toggle(filtered[0].tagId);
        setQuery("");
      }
    }
  };

  return (
    <div ref={rootRef}>
      <div
        className={`${controlClass(invalid)} flex min-h-10 cursor-text flex-wrap items-center gap-1.5 py-1.5`}
        onClick={() => {
          setOpen(true);
          inputRef.current?.focus();
        }}
      >
        {selected.map((t) => {
          const color = t.color ?? DEFAULT_TAG_COLOR;
          return (
            <span
              key={t.tagId}
              className="inline-flex items-center gap-1 rounded-md py-0.5 pr-1 pl-2 text-xs font-medium"
              style={{ backgroundColor: `${color}1A`, color }}
            >
              {t.tagName}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(t.tagId);
                }}
                className="rounded p-0.5 hover:bg-black/10"
                aria-label={`Remove ${t.tagName}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          );
        })}
        <input
          id={id}
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={selected.length ? "" : "Select tags..."}
          className="min-w-24 flex-1 border-0 bg-transparent p-0 text-sm outline-none placeholder:text-slate-400 focus:ring-0"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          autoComplete="off"
        />
      </div>

      {open && (
        // Rendered in the normal flow (not absolutely positioned) so it is not clipped by the scrolling modal body.
        <ul
          ref={listRef}
          id={`${id}-listbox`}
          role="listbox"
          aria-multiselectable="true"
          className="mt-1 max-h-48 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-slate-500">No tags found.</li>
          ) : (
            filtered.map((t) => {
              const isSelected = value.includes(t.tagId);
              return (
                <li key={t.tagId} role="option" aria-selected={isSelected}>
                  <button
                    type="button"
                    onClick={() => toggle(t.tagId)}
                    className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left ${
                      isSelected ? "bg-indigo-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded border ${
                        isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </span>
                    <TagChip tag={t} />
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}
