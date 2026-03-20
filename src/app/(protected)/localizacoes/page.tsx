"use client";

import { useState, useEffect } from "react";
import type { Localizacao } from "@/types";
import { fetchJson } from "@/lib/utils";

const formVazio = { nome: "", descricao: "" };

export default function LocalizacoesPage() {
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Localizacao | null>(null);
  const [form, setForm] = useState(formVazio);
  const [carregando, setCarregando] = useState(false);

  async function carregarDados() {
    setLocalizacoes(await fetchJson<Localizacao[]>("/api/localizacoes", []));
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function abrirAdicionar() {
    setEditando(null);
    setForm(formVazio);
    setModalAberto(true);
  }

  function abrirEditar(loc: Localizacao) {
    setEditando(loc);
    setForm({ nome: loc.nome, descricao: loc.descricao || "" });
    setModalAberto(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    const url = editando
      ? `/api/localizacoes/${editando.id}`
      : "/api/localizacoes";
    const method = editando ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setModalAberto(false);
    setCarregando(false);
    carregarDados();
  }

  async function handleDeletar(id: string) {
    if (!confirm("Deseja remover esta localização?")) return;
    await fetch(`/api/localizacoes/${id}`, { method: "DELETE" });
    carregarDados();
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Localizações</h1>
          <p className="text-gray-500 text-sm mt-1">
            Cadastro de locais de armazenamento
          </p>
        </div>
        <button
          onClick={abrirAdicionar}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Nova Localização
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {localizacoes.map((loc) => (
                <tr
                  key={loc.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-800 text-sm">
                    {loc.nome}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {loc.descricao || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        loc.ativo
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {loc.ativo ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-3">
                    <button
                      onClick={() => abrirEditar(loc)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeletar(loc.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
              {localizacoes.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-gray-400 text-sm"
                  >
                    Nenhuma localização cadastrada
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
                {editando ? "Editar Localização" : "Nova Localização"}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome *
                </label>
                <input
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  required
                  placeholder="Ex: Almoxarifado, Cozinha..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={form.descricao}
                  onChange={(e) =>
                    setForm({ ...form, descricao: e.target.value })
                  }
                  rows={2}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
