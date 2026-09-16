import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import IntroScreen from "./components/IntroScreen";
import LoginScreen from "./components/LoginScreen";
import RegisterInviteScreen from "./components/RegisterInviteScreen";
import AdminLogin from "./components/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import Sidebar from "./components/Sidebar";
import ApiBuildView from "./components/views/ApiBuildView";
import DevicesView from "./components/views/DevicesView";
import BuildingView from "./components/views/BuildingView";
import SettingsView from "./components/views/SettingsView";
import ReadmeView from "./components/views/ReadmeView";
import ReportBugView from "./components/views/ReportBugView";
import { api } from "./services/api";

function getInitialView() {
  try {
    const path = window.location.pathname.toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash.toLowerCase();

    if (
      path.includes("admin-panal") ||
      path.includes("admin-panel") ||
      path.includes("/admin") ||
      hash.includes("admin")
    ) {
      const adminToken = localStorage.getItem("space_admin_token");
      return adminToken ? "admin_dashboard" : "admin_login";
    }

    const tokenFromQuery = searchParams.get("token");
    if (
      tokenFromQuery ||
      path.includes("register") ||
      path.includes("join") ||
      path.includes("invite")
    ) {
      if (tokenFromQuery) return "register";
    }
  } catch (e) {}
  return "intro";
}

function getInitialInviteToken() {
  try {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get("token") || null;
  } catch (e) {
    return null;
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState(getInitialView);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdminAuth, setIsAdminAuth] = useState(
    () => !!localStorage.getItem("space_admin_token"),
  );
  const [activeTab, setActiveTab] = useState("readme");
  const [accountDisabled, setAccountDisabled] = useState(false);
  const [welcomeUser, setWelcomeUser] = useState(null);
  const [inviteToken, setInviteToken] = useState(getInitialInviteToken);

  useEffect(() => {
    let mounted = true;
    const syncTheme = async () => {
      try {
        const config = await api.getSystemConfig();
        if (mounted) {
          document.documentElement.dataset.theme =
            config?.app_theme === "ios" ? "ios" : "app";
        }
      } catch {}
    };
    syncTheme();
    const timer = setInterval(syncTheme, 10000);
    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  // URL route handling (e.g. /admin-panal or /register?token=...)
  useEffect(() => {
    const checkRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      const hash = window.location.hash.toLowerCase();
      const tokenFromQuery = searchParams.get("token");

      // Check for invite registration route
      if (tokenFromQuery) {
        setInviteToken(tokenFromQuery);
        setCurrentView("register");
        return;
      }

      // Check for admin panel route
      if (
        path.includes("admin-panal") ||
        path.includes("admin-panel") ||
        path.includes("/admin") ||
        hash.includes("admin")
      ) {
        const adminToken = localStorage.getItem("space_admin_token");
        if (adminToken) {
          api
            .verifyAdmin()
            .then(() => {
              setIsAdminAuth(true);
              setCurrentView("admin_dashboard");
            })
            .catch(() => {
              localStorage.removeItem("space_admin_token");
              setIsAdminAuth(false);
              setCurrentView("admin_login");
            });
        } else {
          setCurrentView("admin_login");
        }
      }
    };

    checkRoute();
    window.addEventListener("popstate", checkRoute);
    return () => window.removeEventListener("popstate", checkRoute);
  }, []);

  // Desktop Client Simulation: Prevent right-click and inspection shortcuts
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };
    const handleKeyDown = (e) => {
      if (
        e.keyCode === 123 ||
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74)) ||
        (e.ctrlKey && e.keyCode === 85)
      ) {
        e.preventDefault();
        return false;
      }
    };
    window.addEventListener("contextmenu", handleContextMenu);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("contextmenu", handleContextMenu);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Poll account status every 30 seconds when in app view
  useEffect(() => {
    if (currentView !== "app" || !currentUser) return;

    const checkStatus = async () => {
      try {
        const res = await api.checkUserStatus();
        if (res?.status === "Disabled") {
          setAccountDisabled(true);
        } else {
          setAccountDisabled(false);
        }
      } catch (e) {
        if (
          e.message &&
          (e.message.toLowerCase().includes("disabled") ||
            e.message.includes("403"))
        ) {
          setAccountDisabled(true);
        }
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, [currentView, currentUser]);

  const checkUserSession = async () => {
    const token = localStorage.getItem("space_user_token");
    const cachedUser = localStorage.getItem("space_user_data");
    if (token && cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        setCurrentUser(parsed);
        return parsed;
      } catch (e) {
        localStorage.removeItem("space_user_token");
        localStorage.removeItem("space_user_data");
      }
    }
    return null;
  };

  const handleIntroComplete = async () => {
    const user = await checkUserSession();
    if (user && user.username) {
      // Show smooth pixel hello [username] after intro every time!
      setWelcomeUser(user.username);
      setTimeout(() => {
        setWelcomeUser(null);
        setCurrentView("app");
      }, 2400);
    } else {
      setCurrentView("login");
    }
  };

  const handleUserLoginSuccess = (userData) => {
    setCurrentUser(userData);
    setAccountDisabled(false);
    setCurrentView("app");
  };

  const handleUserLogout = () => {
    localStorage.removeItem("space_user_token");
    localStorage.removeItem("space_user_data");
    setCurrentUser(null);
    setAccountDisabled(false);
    setCurrentView("login");
  };

  const handleAdminLoginSuccess = () => {
    setIsAdminAuth(true);
    setCurrentView("admin_dashboard");
    window.history.pushState({}, "", "/admin-panal");
  };

  const handleAdminLogout = () => {
    localStorage.removeItem("space_admin_token");
    setIsAdminAuth(false);
    setCurrentView("admin_login");
  };

  const navigateToApp = () => {
    window.history.pushState({}, "", "/");
    if (currentUser) {
      setCurrentView("app");
    } else {
      setCurrentView("login");
    }
  };

  const handleRegisterComplete = () => {
    window.location.replace("https://www.google.com");
  };

  return (
    <div className="min-h-screen bg-[#050507] text-[#ebebf2] font-sans antialiased select-none flex flex-col relative">
      {/* Global Retro-Futuristic Pixel Welcome Screen */}
      <AnimatePresence>
        {welcomeUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 text-center select-none"
            style={{
              background:
                "radial-gradient(ellipse at center, rgba(22, 28, 42, 0.85) 0%, rgba(5, 5, 7, 0.98) 75%)",
            }}
          >
            <div className="absolute inset-0 backdrop-blur-2xl pointer-events-none" />
            <motion.div
              initial={{ scale: 0.96, opacity: 0, filter: "blur(8px)" }}
              animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
              exit={{ scale: 1.02, opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex flex-col items-center justify-center"
            >
              <h1 className="font-pixel text-zinc-300/90 text-2xl sm:text-4xl tracking-widest lowercase drop-shadow-[0_0_20px_rgba(255,255,255,0.35)] select-none">
                hello {welcomeUser.toLowerCase()}
              </h1>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {/* 1. INTRO SCREEN */}
        {currentView === "intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full h-full"
          >
            <IntroScreen onComplete={handleIntroComplete} />
          </motion.div>
        )}

        {/* 2. USER LOGIN SCREEN */}
        {currentView === "login" && (
          <motion.div
            key="login"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="w-full min-h-screen"
          >
            <LoginScreen onLoginSuccess={handleUserLoginSuccess} />
          </motion.div>
        )}

        {/* 3. INVITE REGISTRATION SCREEN */}
        {currentView === "register" && (
          <motion.div
            key="register"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="w-full min-h-screen"
          >
            <RegisterInviteScreen
              token={inviteToken}
              onComplete={handleRegisterComplete}
            />
          </motion.div>
        )}

        {/* 4. ADMIN LOGIN */}
        {currentView === "admin_login" && (
          <motion.div
            key="admin_login"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="w-full min-h-screen"
          >
            <AdminLogin
              onLoginSuccess={handleAdminLoginSuccess}
              onBackToApp={navigateToApp}
            />
          </motion.div>
        )}

        {/* 5. ADMIN DASHBOARD */}
        {currentView === "admin_dashboard" && (
          <motion.div
            key="admin_dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full min-h-screen flex flex-col"
          >
            <AdminDashboard
              onLogout={handleAdminLogout}
              onNavigateApp={navigateToApp}
            />
          </motion.div>
        )}

        {/* 6. MAIN SPACE APPLICATION */}
        {currentView === "app" && (
          <motion.div
            key="main_app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex-1 flex min-h-screen overflow-hidden"
          >
            {/* Sidebar (Fixed) */}
            <div className="w-64 shrink-0 h-screen sticky top-0">
              <Sidebar
                activeTab={activeTab}
                onSelectTab={(tab) => {
                  if (
                    accountDisabled &&
                    !["settings", "readme", "report_bug"].includes(tab)
                  )
                    return;
                  setActiveTab(tab);
                }}
                user={currentUser}
                onLogout={handleUserLogout}
                accountDisabled={accountDisabled}
              />
            </div>

            {/* View Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#060608] h-screen overflow-y-auto">
              {/* Account Disabled Banner */}
              <AnimatePresence>
                {accountDisabled && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full bg-amber-500/15 border-b border-amber-500/30 px-6 py-3 flex items-center justify-between gap-4 shrink-0"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                      <p className="text-amber-300 text-xs font-medium">
                        Account Disabled — Please contact technical support to
                        restore access.
                      </p>
                    </div>
                    <a
                      href="https://discord.gg/hBn7fHj4Pv"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 border border-amber-500/40 hover:border-amber-400/60 px-3 py-1 rounded-lg transition-colors shrink-0 whitespace-nowrap"
                    >
                      Contact Support →
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex-1 p-6 sm:p-8 relative">
                {/* Blur Overlay for disabled accounts (except Settings) */}
                {accountDisabled &&
                  !["settings", "readme", "report_bug"].includes(activeTab) && (
                    <div className="absolute inset-0 z-20 backdrop-blur-md bg-black/40 flex flex-col items-center justify-center gap-4 pointer-events-all">
                      <div className="text-center space-y-3">
                        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
                          <svg
                            className="w-7 h-7 text-amber-400"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={1.5}
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                            />
                          </svg>
                        </div>
                        <p className="text-amber-300 text-sm font-semibold tracking-wide">
                          Account Disabled
                        </p>
                        <p className="text-zinc-400 text-xs">
                          This section is locked. Contact support to restore
                          access.
                        </p>
                        <a
                          href="https://discord.gg/hBn7fHj4Pv"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 hover:text-amber-300 text-xs font-semibold transition-colors"
                        >
                          Contact Support on Discord →
                        </a>
                      </div>
                    </div>
                  )}

                <AnimatePresence mode="wait">
                  {activeTab === "readme" && (
                    <motion.div
                      key="readme"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ReadmeView user={currentUser} />
                    </motion.div>
                  )}
                  {activeTab === "report_bug" && (
                    <motion.div
                      key="report_bug"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ReportBugView />
                    </motion.div>
                  )}
                  {activeTab === "api_build" && (
                    <motion.div
                      key="api_build"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      <ApiBuildView user={currentUser} />
                    </motion.div>
                  )}
                  {activeTab === "devices" && (
                    <motion.div
                      key="devices"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      <DevicesView />
                    </motion.div>
                  )}
                  {activeTab === "building" && (
                    <motion.div
                      key="building"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      <BuildingView />
                    </motion.div>
                  )}
                  {activeTab === "settings" && (
                    <motion.div
                      key="settings"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                    >
                      <SettingsView
                        user={currentUser}
                        onLogout={handleUserLogout}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Bottom Footer */}
              <footer className="h-12 border-t border-white/5 px-8 flex items-center justify-between text-[11px] text-zinc-400 shrink-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${accountDisabled ? "bg-amber-400" : "bg-emerald-400"}`}
                  />
                  <span>
                    {accountDisabled
                      ? "ACCOUNT DISABLED — READ ONLY"
                      : "SPACE CORE TUNNEL CONNECTED"}
                  </span>
                </div>
                <div>copyright by 505 Studio's</div>
              </footer>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
