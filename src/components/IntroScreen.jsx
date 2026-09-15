import React from 'react';

export default function IntroScreen({ onComplete }) {
  return <main className="min-h-screen flex items-center justify-center bg-[#050507] p-6"><div className="text-center space-y-5"><img src="/icon.png" alt="Space" className="mx-auto h-20 w-20 rounded-2xl" /><h1 className="text-4xl font-semibold text-white">Space</h1><p className="text-zinc-400">Secure workspace control center</p><button onClick={onComplete} className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black">Continue</button></div></main>;
}
