import React from 'react';
import { Shell, Card } from './Basic';

export default function AdminDashboard({ onLogout, onNavigateApp }) { return <Shell title="Admin dashboard"><Card><p className="text-zinc-400">Administration is ready.</p><div className="mt-5 flex gap-3"><button onClick={onNavigateApp} className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-black">Open app</button><button onClick={onLogout} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-300">Log out</button></div></Card></Shell>; }
