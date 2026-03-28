"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DashboardSearch() {
  const [query, setQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/reservations/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/reservations/search`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full md:w-96">
      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" data-icon="search">search</span>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full bg-surface-container-lowest border-none rounded-xl py-4 pl-12 pr-4 text-on-surface placeholder:text-on-surface-variant focus:ring-1 focus:ring-primary-dim transition-all outline-none" 
        placeholder="Buscar invitados, unidades o placas..." 
        type="search"
      />
    </form>
  );
}
