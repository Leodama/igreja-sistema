"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Building2,
  MapPin,
  Heart,
  History,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/itens", label: "Itens", icon: Package },
  { href: "/estoque", label: "Estoque", icon: ArrowLeftRight },
  { href: "/patrimonio", label: "Patrimônio", icon: Building2 },
  { href: "/localizacoes", label: "Localizações", icon: MapPin },
  { href: "/doacoes", label: "Doações", icon: Heart },
  { href: "/historico", label: "Histórico", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">⛪</span>
          <div>
            <h1 className="text-base font-bold text-indigo-700 leading-tight">
              Igreja Sistema
            </h1>
            <p className="text-xs text-gray-400">Gestão de Recursos</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon size={18} className={active ? "text-indigo-600" : "text-gray-400"} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <p className="text-xs font-medium text-gray-700 truncate mb-1">
          {session?.user?.name}
        </p>
        <p className="text-xs text-gray-400 truncate mb-3">
          {session?.user?.email}
        </p>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
