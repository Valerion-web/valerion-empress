import { motion, AnimatePresence } from "framer-motion";
import { Bell, MessageSquare, Search, Sun, Moon, Globe, LogOut, User, Settings, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import { NOTIFICATIONS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNavigate } from "@tanstack/react-router";

export function Topbar() {
  const { user, theme, toggleTheme, logout } = useApp();
  const navigate = useNavigate();
  const [lang, setLang] = useState("EN");
  const unread = NOTIFICATIONS.filter((n) => n.unread).length;

  if (!user) return null;

  return (
    <header className="sticky top-0 z-20 h-16 border-b border-border/60 glass px-4 md:px-6 flex items-center gap-3">
      <div className="flex-1 max-w-2xl relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input
          placeholder="Search employees, documents, requests…"
          className="w-full h-10 rounded-xl bg-muted/60 border border-transparent focus:border-gold focus:bg-card outline-none pl-10 pr-4 text-sm transition placeholder:text-muted-foreground/70"
        />
        <kbd className="hidden md:inline-flex absolute right-3 top-1/2 -translate-y-1/2 h-6 items-center rounded-md border border-border bg-background/80 px-1.5 text-[10px] font-mono text-muted-foreground">⌘K</kbd>
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <IconBtn onClick={toggleTheme} label="Toggle theme">
          <AnimatePresence mode="wait" initial={false}>
            {theme === "light" ? (
              <motion.span key="m" initial={{ y: -8, opacity: 0, rotate: -30 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ y: 8, opacity: 0, rotate: 30 }}>
                <Moon className="size-[18px]" strokeWidth={1.75} />
              </motion.span>
            ) : (
              <motion.span key="s" initial={{ y: -8, opacity: 0, rotate: -30 }} animate={{ y: 0, opacity: 1, rotate: 0 }} exit={{ y: 8, opacity: 0, rotate: 30 }}>
                <Sun className="size-[18px]" strokeWidth={1.75} />
              </motion.span>
            )}
          </AnimatePresence>
        </IconBtn>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="hidden sm:inline-flex items-center gap-1.5 h-10 px-3 rounded-xl hover:bg-muted transition text-sm">
              <Globe className="size-4" />
              <span className="font-medium">{lang}</span>
              <ChevronDown className="size-3.5 opacity-60" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {["EN","IT","FR","JA","AR"].map((l) => (
              <DropdownMenuItem key={l} onClick={() => setLang(l)}>{l === "EN" ? "English" : l === "IT" ? "Italiano" : l === "FR" ? "Français" : l === "JA" ? "日本語" : "العربية"}</DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <IconBtn label="Messages" badge={3}>
          <MessageSquare className="size-[18px]" strokeWidth={1.75} />
        </IconBtn>

        <Popover>
          <PopoverTrigger asChild>
            <button className="relative h-10 w-10 grid place-items-center rounded-xl hover:bg-muted transition">
              <Bell className="size-[18px]" strokeWidth={1.75} />
              {unread > 0 && (
                <span className="absolute top-2 right-2 size-4 rounded-full bg-gold text-gold-foreground text-[10px] font-bold grid place-items-center">
                  {unread}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-96 p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div className="font-display text-base font-semibold">Notifications</div>
              <button className="text-xs text-muted-foreground hover:text-foreground">Mark all read</button>
            </div>
            <div className="max-h-96 overflow-y-auto scrollbar-luxe">
              {NOTIFICATIONS.map((n) => (
                <div key={n.id} className="flex gap-3 px-4 py-3 hover:bg-muted/60 border-b border-border/60 last:border-0 cursor-pointer">
                  <span className={cn(
                    "mt-1 size-2 shrink-0 rounded-full",
                    n.type === "success" && "bg-success",
                    n.type === "warning" && "bg-warning",
                    n.type === "info" && "bg-info",
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="font-medium text-sm truncate">{n.title}</div>
                      <div className="text-[10px] text-muted-foreground shrink-0">{n.time}</div>
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 ml-1 h-10 pl-1 pr-3 rounded-xl hover:bg-muted transition">
              <div className="size-8 rounded-lg gradient-primary grid place-items-center text-primary-foreground text-xs font-semibold shadow-luxury">
                {user.avatar}
              </div>
              <div className="hidden md:block text-left leading-tight">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-[11px] text-muted-foreground">{user.title}</div>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="px-3 py-3">
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
              <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-gold font-semibold">
                <span className="size-1.5 rounded-full bg-gold" /> {user.role} · {user.employeeId}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem><User className="size-4 mr-2" /> My Profile</DropdownMenuItem>
            <DropdownMenuItem><Settings className="size-4 mr-2" /> Preferences</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { logout(); navigate({ to: "/login" }); }} className="text-destructive focus:text-destructive">
              <LogOut className="size-4 mr-2" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

function IconBtn({ children, onClick, label, badge }: { children: React.ReactNode; onClick?: () => void; label: string; badge?: number }) {
  return (
    <button onClick={onClick} aria-label={label} className="relative h-10 w-10 grid place-items-center rounded-xl hover:bg-muted transition">
      {children}
      {badge ? (
        <span className="absolute top-2 right-2 min-w-4 h-4 px-1 rounded-full bg-gold text-gold-foreground text-[10px] font-bold grid place-items-center">{badge}</span>
      ) : null}
    </button>
  );
}
