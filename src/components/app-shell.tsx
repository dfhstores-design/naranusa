"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { BookOpen, ChartNoAxesColumn, GraduationCap, LogOut, MessageCircle, ShieldCheck } from "lucide-react";
import { ApiError, gasAction } from "@/lib/api";
import { clearSessionToken, readSessionToken } from "@/lib/session";

export type AppRole = "murid" | "orang_tua" | "guru" | "pemilik_admin";
export type SessionUser = { username: string; peran: AppRole };
const SessionContext = createContext<SessionUser | null>(null);
export function useSessionUser() { return useContext(SessionContext); }

export default function AppShell({ children, audience, title }: { children: ReactNode; audience: "student" | "adult"; title: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [problem, setProblem] = useState("");

  useEffect(() => {
    let active = true;
    const token = readSessionToken();
    if (!token) {
      router.replace("/masuk");
      return () => { active = false; };
    }
    gasAction<{ ok: true; username: string; peran: AppRole }>("me.get", { token })
      .then((result) => { if (active) setUser({ username: result.username, peran: result.peran }); })
      .catch((error: unknown) => {
        if (!active) return;
        if (error instanceof ApiError && error.code === "UNAUTHORIZED") {
          clearSessionToken();
          router.replace("/masuk");
        } else {
          setProblem(error instanceof Error ? error.message : "Belum bisa memeriksa sesi. Coba lagi.");
        }
      })
      .finally(() => { if (active) setLoading(false); });
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/pwa-edukasi-kelas4/sw.js", { scope: "/pwa-edukasi-kelas4/" }).catch(() => undefined);
    }
    return () => { active = false; };
  }, [router]);

  useEffect(() => {
    if (!user) return;
    if (audience === "student" && user.peran !== "murid") router.replace("/admin");
    if (audience === "adult" && user.peran === "murid") router.replace("/");
  }, [audience, router, user]);

  const allowed = !!user && ((audience === "student" && user.peran === "murid") || (audience === "adult" && user.peran !== "murid"));
  const roleLabel = useMemo(() => user?.peran === "pemilik_admin" ? "Pemilik/admin" : user?.peran === "orang_tua" ? "Orang tua" : user?.peran === "guru" ? "Guru" : "Murid", [user]);

  async function logout() {
    const token = readSessionToken();
    try { if (token) await gasAction<{ ok: true }>("auth.logout", { token }); } catch { /* Local logout must still finish. */ }
    clearSessionToken();
    router.replace("/masuk");
  }

  if (loading || !allowed) {
    return <main className="center-page"><section className="message-card loading-card"><div className="mini-spinner" /><p>{problem || "Memeriksa sesi belajar…"}</p>{problem && <button className="button secondary" onClick={() => window.location.reload()}>Coba lagi</button>}</section></main>;
  }

  const links = audience === "student"
    ? [{ href: "/", label: "Beranda", icon: GraduationCap }, { href: "/mapel/matematika", label: "Jelajahi topik", icon: BookOpen }, { href: "/hasil", label: "Progresku", icon: ChartNoAxesColumn }, { href: "/tutor", label: "Tanya Nara", icon: MessageCircle }]
    : [{ href: "/admin", label: "Workbench dewasa", icon: ShieldCheck }];

  return (
    <SessionContext.Provider value={user}>
      <div className="app-frame">
        <header className="app-header">
          <Link href={audience === "adult" ? "/admin" : "/"} className="brand-link"><span className="brand-mark"><Image src="/pwa-edukasi-kelas4/icon.svg" alt="" aria-hidden="true" width={44} height={44} /></span><span className="brand-text"><strong>NaraNusa</strong><small>{audience === "adult" ? "Workbench dewasa" : "jelajah ilmu, seru!"}</small></span></Link>
          <nav className="header-nav" aria-label={audience === "adult" ? "Menu dewasa" : "Menu belajar"}>
            {links.map((item) => { const Icon = item.icon; return <Link className={pathname === item.href ? "nav-link active" : "nav-link"} href={item.href} key={item.href}><Icon size={18} /><span>{item.label}</span></Link>; })}
          </nav>
          <div className="account-bar"><span className="role-chip">{roleLabel}</span><span className="account-name">{user.username}</span><button className="icon-button" onClick={logout} aria-label="Keluar" title="Keluar"><LogOut size={18} /></button></div>
        </header>
        <main className="page-main"><div className="page-heading"><div><p className="eyebrow">{audience === "adult" ? "AREA DEWASA" : "RUANG BELAJAR KELAS 4"}</p><h1>{title}</h1></div>{audience === "adult" && <span className="secure-label"><ShieldCheck size={16} /> Akses terkelola</span>}</div>{children}</main>
        <nav className="mobile-dock" aria-label="Navigasi bawah">
          {links.map((item) => { const Icon = item.icon; return <Link className={pathname === item.href ? "active" : ""} href={item.href} key={item.href}><Icon size={19} /><span>{item.label}</span></Link>; })}
        </nav>
      </div>
    </SessionContext.Provider>
  );
}
