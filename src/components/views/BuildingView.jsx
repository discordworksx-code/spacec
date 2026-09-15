import React, { useState } from 'react';
import { Building2, Layers, Box, Play, CheckCircle2, Shield, Settings2, Plus, Trash2 } from 'lucide-react';
import { sound } from '../../services/audio';

export default function BuildingView() {
  const [modules, setModules] = useState([
    { id: 'mod_1', name: 'Core Engine Injection', type: 'Payload', enabled: true, version: '1.4.2' },
    { id: 'mod_2', name: 'Process Guard & Antidebug', type: 'Security', enabled: true, version: '2.1.0' },
    { id: 'mod_3', name: 'Credential Vault Bridge', type: 'Storage', enabled: false, version: '1.0.8' },
    { id: 'mod_4', name: 'Low-Latency Socket Relay', type: 'Network', enabled: true, version: '3.0.0' },
  ]);

  const [compiling, setCompiling] = useState(false);
  const [compileSuccess, setCompileSuccess] = useState(false);

  const toggleModule = (id) => {
    sound.playClick();
    setModules(prev =>
      prev.map(m => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  };

  const handleTestBuild = () => {
    sound.playClick();
    setCompiling(true);
    setCompileSuccess(false);

    setTimeout(() => {
      setCompiling(false);
      setCompileSuccess(true);
      sound.playSuccess();
      setTimeout(() => setCompileSuccess(false), 4000);
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold tracking-wider text-white uppercase">BUILDING WORKSPACE</h2>
            <p className="text-xs text-zinc-400">Assemble executable structures, integrate modules, and test pipelines</p>
          </div>
        </div>

        <button
          onClick={handleTestBuild}
          disabled={compiling}
          className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 font-semibold text-xs tracking-wider uppercase flex items-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50"
        >
          {compiling ? (
            <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-zinc-950" />
          )}
          <span>Validate Architecture</span>
        </button>
      </div>

      {compileSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Module pipeline validated with 0 syntax or compatibility errors.</span>
        </div>
      )}

      {/* Modules List */}
      <div className="bg-[#0c0c0e] border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold tracking-wider text-white uppercase flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-400" />
            <span>Active Architecture Modules</span>
          </h3>
          <span className="text-[10px] font-mono text-zinc-400">
            {modules.filter(m => m.enabled).length} of {modules.length} ACTIVE
          </span>
        </div>

        <div className="space-y-2.5">
          {modules.map((mod) => (
            <div
              key={mod.id}
              onClick={() => toggleModule(mod.id)}
              className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                mod.enabled
                  ? 'bg-zinc-900/80 border-white/20 text-white'
                  : 'bg-zinc-950 border-white/5 text-zinc-400 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-mono border ${
                    mod.enabled
                      ? 'bg-white text-zinc-950 border-white'
                      : 'bg-zinc-900 text-zinc-400 border-white/5'
                  }`}
                >
                  <Box className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold">{mod.name}</h4>
                  <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                    Type: {mod.type} • Version: v{mod.version}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md ${
                    mod.enabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-400'
                  }`}
                >
                  {mod.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
