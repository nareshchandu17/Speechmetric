import React from "react";
import { GitFork, Smartphone, Sun, Moon, AlignLeft } from "lucide-react";

interface HeaderProps {
  onMenuToggle?: () => void;
  theme?: "light" | "dark";
  toggleTheme?: () => void;
}

export function Header({ onMenuToggle, theme = "light", toggleTheme }: HeaderProps) {
  return (
    <header className="border-b border-zinc-200/80 bg-white sticky top-0 z-40" id="header-brand">
      <div className="w-full px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile menu trigger */}
          {onMenuToggle && (
            <button 
              onClick={onMenuToggle}
              className="lg:hidden p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer mr-1"
              id="mobile-sidebar-toggle-btn"
              title="Toggle Menu"
            >
              <AlignLeft className="h-5 w-5" />
            </button>
          )}
          
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-900" id="app-title">
            AI Pronunciation Assessor
          </h1>
        </div>
        
        <div className="flex items-center gap-2.5" id="header-actions">
          {/* Remix button */}
          <button 
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer"
            id="remix-btn"
          >
            <GitFork className="h-3.5 w-3.5" />
            Remix
          </button>

          {/* Device button */}
          <button 
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 bg-white border border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900 transition-colors cursor-pointer"
            id="device-btn"
          >
            <Smartphone className="h-3.5 w-3.5" />
            Device
          </button>

          {/* Theme toggle */}
          <button 
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-colors cursor-pointer"
            id="theme-toggle-btn"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-500" />
            ) : (
              <Moon className="h-4 w-4 text-zinc-600" />
            )}
          </button>

          {/* User profile avatar */}
          <div className="h-8 w-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center font-bold text-xs text-zinc-700 select-none cursor-pointer hover:bg-zinc-200 transition" id="user-profile-avatar">
            N
          </div>
        </div>
      </div>
    </header>
  );
}
