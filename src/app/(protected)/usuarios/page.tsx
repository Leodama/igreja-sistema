"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { Usuario } from "@/types";
import { fetchJson } from "@/lib/utils";

const PAPEIS = [
  { value: "ADMINISTRADOR", label: "Administrador", desc: "Acesso total — incluindo gerenciar usuários" },
  { value: "OPERADOR", label: "Operador", desc: "Pode adicionar e editar registros, mas não excluir" },
  { value: "VISUALIZADOR", label: "Visualizador", desc: "Somente leitura" },
];

const PAPEL_COLORS: Record<string, string> = {
  ADMINISTRADOR: "bg-purple-100 text-purple-700",
  OPERADOR: "bg-blue-100 text-blue-700",
  VISUALIZADOR: "bg-gray-100 text-gray-600",
};

const formVazio = { nome: "", email: "", senha: "", papel: "VISUALIZADOR" };

export default function UsuariosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState(formVazio);
  const [carregando, setCarregando] = useState(false);

  // Only admins can access this page
  useEffect(() => {
    if (status === "authenticated" && session?.user?.papel !== "ADMINISTRADOR") {
      router.replace("/dashboard");
    }
  }, [status, session, router]);

  async function carregarDados() {
    setUsuarios(await fetchJson<Usuario[]>("/api/usuarios", []));
  }

  useEffect(() => {
    if (status === "authenticated" && session?.user?.papel === "ADMINISTRADOR") {
      carregarDados();
    }
  }, [status, session]);

  function abrirAdicionar() {
    setEditando(null);
    setForm(formVazio);
    setModalAberto(true);
  }

  function abrirEditar(u: Usuario) {
    setEditando(u);
    setForm({ nome: u.nome, email: u.email, senha: "", papel: u.papel });
    setModalAberto(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    const url = editando ? `/api/usuarios/${editando.id}` : "/api/usuarios";
    const method = editando ? "PUT" : "POST";

    const body: Record<string, unknown> = { nome: form.nome, email: form.email, papel: form.papel };
    if (!editando || form.senha) body.senha = form.senha;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setCarregando(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || `Erro ao salvar (${res.status})`);
      return;
    }

    setModalAberto(false);
    carregarDados();
  }

  async function handleToggleAtivo(u: Usuario) {
    if (u.email === "admin@igreja.com") return;
    const res = await fetch(`/api/usuarios/${u.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ativo: !u.ativo }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Erro ao alterar status");
      return;
    }
    carregarDados();
  }

  async function handleDeletar(u: Usuario) {
    if (!confirm(`Deseja excluir o usuário "${u.nome}"? Esta ação não pode ser desfeita.`)) return;
    const res = await fetch(`/api/usuarios/${u.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Erro ao excluir");
      return;
    }
    carregarDados();
  }

  if (status === "loading") {
    return <div className="p-6 text-gray-400 text-sm">Carregando...</div>;
  }

  if (session?.user?.papel !== "ADMINISTRADOR") return null;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
          <p className="text-gray-500 text-sm mt-1">Gerenciamento de acesso ao sistema</p>
        </div>
        <button
          onClick={abrirAdicionar}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Novo Usuário
        </button>
      </div>

      {/* Permission legend */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {PAPEIS.map((p) => (
          <div key={p.value} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAPEL_COLORS[p.value]}`}>
              {p.label}
            </span>
            <p className="text-xs text-gray-500 mt-2">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Papel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Cadastro</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const isMe = u.email === session?.user?.email;
                const isProtected = u.email === "admin@igreja.com";
                return (
                  <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800 text-sm">
                      {u.nome}
                      {isMe && (
                        <span className="ml-2 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                          você
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAPEL_COLORS[u.papel]}`}>
                        {PAPEIS.find((p) => p.value === u.papel)?.label ?? u.papel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => !isProtected && !isMe && handleToggleAtivo(u)}
                        disabled={isProtected || isMe}
                        className={`text-xs px-2 py-0.5 rounded-full font-medium transition-colors ${
                          u.ativo
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        } disabled:opacity-50 disabled:cursor-default`}
                        title={isProtected ? "Administrador principal não pode ser alterado" : isMe ? "Você não pode se desativar" : ""}
                      >
                        {u.ativo ? "Ativo" : "Inativo"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(u.criadoEm).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 flex gap-3">
                      {!isProtected && (
                        <button
                          onClick={() => abrirEditar(u)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm"
                        >
                          Editar
                        </button>
                      )}
                      {!isProtected && !isMe && (
                        <button
                          onClick={() => handleDeletar(u)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Excluir
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                    Nenhum usuário encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                {editando ? "Editar Usuário" : "Novo Usuário"}
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha {editando ? "(deixe em branco para manter)" : "*"}
                </label>
                <input
                  type="password"
                  value={form.senha}
                  onChange={(e) => setForm({ ...form, senha: e.target.value })}
                  required={!editando}
                  minLength={6}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder={editando ? "••••••" : "Mínimo 6 caracteres"}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Papel *</label>
                <select
                  value={form.papel}
                  onChange={(e) => setForm({ ...form, papel: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {PAPEIS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label} — {p.desc}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={carregando}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
                >
                  {carregando ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
