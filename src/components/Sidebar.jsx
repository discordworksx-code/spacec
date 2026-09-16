import React from "react";
import { motion } from "framer-motion";
import {
  Syringe,
  Smartphone,
  Building2,
  Settings,
  LogOut,
  BookOpen,
  Bug,
} from "lucide-react";
import { sound } from "../services/audio";
import AppLogo from "./AppLogo";

export default function Sidebar({
  activeTab,
  onSelectTab,
  user,
  onLogout,
  accountDisabled,
}) {
  const navItems = [
    { id: "api_build", label: "API / Build", icon: Syringe },
    { id: "devices", label: "Devices", icon: Smartphone },
    { id: "building", label: "Building", icon: Building2 },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "readme", label: "Readme", icon: BookOpen },
    { id: "report_bug", label: "Report Bug", icon: Bug, report: true },
  ];

  const handleSelect = (id) => {
    if (accountDisabled && !["settings", "readme", "report_bug"].includes(id))
      return;
    sound.playClick();
    onSelectTab(id);
  };

  return (
    <aside className="w-64 bg-[#09090c] border-r border-white/10 flex flex-col justify-between shrink-0 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 border-b border-white/10 flex items-center gap-3">
          <AppLogo className="w-7 h-7" />
          <div>
            <h1 className="text-sm font-bold tracking-widest text-white">
              SPACE
            </h1>
            <p className="text-[10px] font-mono text-zinc-400">COMMAND CORE</p>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isLocked =
              accountDisabled &&
              !["settings", "readme", "report_bug"].includes(item.id);

            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                disabled={isLocked}
                className={`w-full h-11 px-3.5 ${item.report ? "mt-8 border border-red-500/15 bg-red-500/[.035]" : ""} rounded-xl flex items-center justify-between text-xs font-medium transition-all duration-150 relative ${
                  isLocked
                    ? "opacity-40 cursor-not-allowed text-zinc-600"
                    : isActive
                      ? "bg-white/10 text-white font-semibold"
                      : "text-zinc-400 hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {/* Active Indicator Bar */}
                {isActive && !isLocked && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-white rounded-r"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                <div className="flex items-center gap-3">
                  <div
                    className={`transition-transform duration-150 ${isActive && !isLocked ? "scale-105 text-white" : "text-zinc-400"}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="tracking-wide">{item.label}</span>
                </div>

                {isLocked && (
                  <span className="text-[10px] font-mono text-amber-500/80">
                    🔒
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Info & Footer Section */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900/60 border border-white/5 mb-3">
          <div className="truncate pr-2">
            <p className="text-xs font-medium text-white truncate">
              {user?.username || "Operator"}
            </p>
            <p className="text-[10px] font-mono text-zinc-400 truncate">
              {user?.application_code || "SPC-SYS-CORE"}
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onLogout();
            }}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Disconnect session"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="text-center text-[10px] text-zinc-400 font-sans tracking-wide">
          copyright by 505 Studio's
        </div>
      </div>
    </aside>
  );
}
