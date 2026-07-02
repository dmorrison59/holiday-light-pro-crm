"use client";

import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CatalogComboboxItem {
  id: string;
  name: string;
  category: string;
  description: string | null;
  pricing_method: string;
  unit_type: string;
  unit_price: string;
}

function priceLabel(item: CatalogComboboxItem) {
  const price = Number(item.unit_price).toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0, maximumFractionDigits: 2 });
  return item.unit_type === "each" ? `${price} each` : `${price}/${item.unit_type}`;
}

export function catalogItemLabel(item: CatalogComboboxItem) {
  return `${item.name} — ${item.category} — ${priceLabel(item)}`;
}

export function CatalogItemCombobox({ items, defaultValue = "", name = "catalog_item_id", onSelectionChange }: { items: CatalogComboboxItem[]; defaultValue?: string; name?: string; onSelectionChange?: (item?: CatalogComboboxItem) => void }) {
  const initialItem = items.find((item) => item.id === defaultValue);
  const [selectedId, setSelectedId] = useState(initialItem?.id ?? "");
  const [query, setQuery] = useState(initialItem ? catalogItemLabel(initialItem) : "");
  const [open, setOpen] = useState(false);
  const selectedItem = items.find((item) => item.id === selectedId);
  const visibleQuery = selectedItem && query === catalogItemLabel(selectedItem) ? "" : query;
  const normalizedQuery = visibleQuery.trim().toLocaleLowerCase();
  const matches = useMemo(() => {
    const terms = normalizedQuery.split(/\s+/).filter(Boolean);
    return items.filter((item) => {
      const searchableText = [item.name, item.category, item.description ?? ""].join(" ").toLocaleLowerCase();
      return terms.every((term) => searchableText.includes(term));
    });
  }, [items, normalizedQuery]);

  const choose = (item?: CatalogComboboxItem) => {
    setSelectedId(item?.id ?? "");
    setQuery(item ? catalogItemLabel(item) : "");
    onSelectionChange?.(item);
    setOpen(false);
  };

  return <div className="relative" onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <input type="hidden" name={name} value={selectedId} />
    <div className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-3.5 size-4 text-slate-400" />
      <input
        type="search"
        role="combobox"
        aria-expanded={open}
        aria-controls="catalog-item-options"
        aria-autocomplete="list"
        value={query}
        onChange={(event) => { setQuery(event.target.value); setSelectedId(""); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Search wreath, garland, C9, stake lights…"
        className="flex min-h-11 w-full rounded-xl border border-slate-300 bg-white py-2 pl-10 pr-20 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
      />
      {query ? <button type="button" onClick={() => choose()} aria-label="Clear catalog item" className="absolute right-10 top-2.5 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="size-4" /></button> : null}
      <button type="button" onClick={() => setOpen((current) => !current)} aria-label="Show catalog items" className="absolute right-2.5 top-2.5 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><ChevronsUpDown className="size-4" /></button>
    </div>
    {open ? <div id="catalog-item-options" role="listbox" className="absolute z-30 mt-2 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
      <button type="button" role="option" aria-selected={!selectedId} onMouseDown={(event) => event.preventDefault()} onClick={() => choose()} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-slate-50"><span>No catalog item assigned</span>{!selectedId ? <Check className="size-4 text-amber-700" /> : null}</button>
      {matches.map((item) => <button key={item.id} type="button" role="option" aria-selected={selectedId === item.id} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(item)} className={cn("flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-amber-50", selectedId === item.id && "bg-amber-50")}><span><span className="block text-sm font-semibold text-slate-950">{item.name}</span><span className="mt-0.5 block text-xs text-slate-500">{item.category} — {priceLabel(item)}</span></span>{selectedId === item.id ? <Check className="mt-0.5 size-4 shrink-0 text-amber-700" /> : null}</button>)}
      {!matches.length ? <div className="px-3 py-5 text-center text-sm text-slate-600">No matching catalog item found. You can add it to your catalog.</div> : null}
    </div> : null}
  </div>;
}
