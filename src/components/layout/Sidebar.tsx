"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  HandshakeIcon,
  MapPin,
  History,
  Users,
  LogOut,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/itens", label: "Itens", icon: Package },
  { href: "/estoque", label: "Estoque", icon: ArrowLeftRight },
  { href: "/emprestimos", label: "Empréstimos", icon: HandshakeIcon },
  { href: "/localizacoes", label: "Localizações", icon: MapPin },
  { href: "/historico", label: "Histórico", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.papel === "ADMINISTRADOR";

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-start gap-2">
          <span className="text-2xl mt-0.5">⛪</span>
          <div>
            <h1 className="text-sm font-bold text-indigo-700 leading-tight">
              Sistema Patrimônio e Suprimentos
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 leading-tight">
              Santuário N. Sra. da Aparecida
            </p>
            <p className="text-xs text-gray-400 leading-tight">
              Diálogo Conjugal
            </p>
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

        {isAdmin && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Administração
              </p>
            </div>
            <Link
              href="/usuarios"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/usuarios"
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Users size={18} className={pathname === "/usuarios" ? "text-indigo-600" : "text-gray-400"} />
              Usuários
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
            {session?.user?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-700 truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-gray-400 truncate">{session?.user?.email}</p>
          </div>
        </div>
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
