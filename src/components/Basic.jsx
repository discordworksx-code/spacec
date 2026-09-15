import React from 'react';

export function Shell({ title, children }) {
  return <section className="min-h-screen bg-[#050507] p-6 sm:p-10"><div className="mx-auto max-w-5xl space-y-6"><h1 className="text-2xl font-semibold text-white">{title}</h1>{children}</div></section>;
}

export function Card({ children }) {
  return <div className="space-card p-6">{children}</div>;
}

export function PlaceholderView({ title, description }) {
  return <Shell title={title}><Card><p className="text-zinc-400">{description}</p></Card></Shell>;
}
