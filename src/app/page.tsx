"use client";

import dynamic from "next/dynamic";
import { Atmosphere } from "@/components/scene/Atmosphere";

const SearchState = dynamic(
  () => import("@/components/search/SearchState").then((module) => module.SearchState),
  {
    loading: () => (
      <section className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-14 pt-10 md:px-10">
        <div className="rounded-[2rem] border border-amber-50/20 bg-[linear-gradient(170deg,rgba(30,21,37,0.84),rgba(16,23,41,0.9))] p-6 shadow-[0_20px_60px_rgba(5,4,12,0.52)] backdrop-blur-md md:p-8">
          <p className="text-amber-100/80">Opening archive...</p>
        </div>
      </section>
    ),
  }
);

export default function Home() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      <Atmosphere mode="search" />
      <div className="w-full">
        <SearchState />
      </div>
    </main>
  );
}
