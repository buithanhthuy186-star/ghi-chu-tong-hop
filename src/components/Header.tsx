"use client";

import { Search, LogIn, User, LogOut } from "lucide-react";
import { ParticleText } from "./ParticleText";
import { LiquidMetalButton } from "./liquid-metal-button";
import type { SessionUser } from "@/lib/auth";

interface HeaderProps {
  user: SessionUser | null;
  onToggleSearch: () => void;
  searchOpen: boolean;
}

export function Header({ user, onToggleSearch, searchOpen }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        {/* Dots title */}
        <div className="h-14 w-[300px] sm:w-[400px] md:w-[560px]">
          <ParticleText />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSearch}
            className={`rounded-xl p-2 transition-all duration-300 ${
              searchOpen
                ? "bg-gray-100 text-gray-900 shadow-inner"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
            title="Tìm kiếm (Ctrl+K)"
          >
            <Search className="size-4" />
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              {user.picture && (
                <img
                  src={user.picture}
                  alt=""
                  className="size-7 rounded-full border border-gray-300 shadow-sm"
                  referrerPolicy="no-referrer"
                />
              )}
              <span className="hidden max-w-[120px] truncate text-sm text-gray-600 sm:inline">
                {user.name}
              </span>
              <a
                href="/api/auth/logout"
                className="rounded-xl border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 transition-all hover:bg-gray-50 hover:text-gray-700 hover:shadow-sm"
              >
                <LogOut className="size-3.5" />
              </a>
            </div>
          ) : (
            <LiquidMetalButton
              label="Đăng nhập"
              onClick={() => window.location.href = "/api/auth/login"}
              width={130}
            />
          )}
        </div>
      </div>
    </header>
  );
}