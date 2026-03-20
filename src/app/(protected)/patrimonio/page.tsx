"use client";

import { useState, useEffect } from "react";
import type { Patrimonio, Localizacao } from "@/types";
import { formatDate, formatCurrency, fetchJson } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  EM_MANUTENCAO: "Manutenção",
  DESCARTADO: "Descartado",
};

const STATUS_COLORS: Record<string, string> = {
  ATIVO: "bg-green-100 text-green-700",
  INATIVO: "bg-gray-100 text-gray-600",
  EM_MANUTENCAO: "bg-yellow-100 text-yellow-700",
  DESCARTADO: "bg-red-100 text-red-700",
};

const formVazio = {
  nome: "",
  descricao: "",
  numeroSerie: "",
  valorAquisicao: "",
  dataAquisicao: "",
  status: "ATIVO" as Patrimonio["status"],
  localizacaoId: "",
};

export default function PatrimonioPage() {
  const [patrimonios, setPatrimonios] = useState<Patrimonio[]>([]);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Patrimonio | null>(null);
  const [form, setForm] = useState(formVazio);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  async function carregarDados() {
    const [patrimonios, localizacoes] = await Promise.all([
      fetchJson<Patrimonio[]>("/api/patrimonio", []),
      fetchJson<Localizacao[]>("/api/localizacoes", []),
    ]);
    setPatrimonios(patrimonios);
    setLocalizacoes(localizacoes);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function abrirAdicionar() {
    setEditando(null);
    setForm(formVazio);
    setModalAberto(true);
  }

  function abrirEditar(p: Patrimonio) {
    setEditando(p);
    setForm({
      nome: p.nome,
      descricao: p.descricao || "",
      numeroSerie: p.numeroSerie || "",
      valorAquisicao: p.valorAquisicao ? String(p.valorAquisicao) : "",
      dataAquisicao: p.dataAquisicao
        ? new Date(p.dataAquisicao).toISOString().split("T")[0]
        : "",
      status: p.status,
      localizacaoId: p.localizacaoId || "",
    });
    setModalAberto(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    const url = editando
      ? `/api/patrimonio/${editando.id}`
      : "/api/patrimonio";
    const method = editando ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        valorAquisicao: form.valorAquisicao ? Number(form.valorAquisicao) : null,
        dataAquisicao: form.dataAquisicao || null,
        localizacaoId: form.localizacaoId || null,
      }),
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

  async function handleDeletar(id: string) {
    if (!confirm("Deseja remover este patrimônio?")) return;
    await fetch(`/api/patrimonio/${id}`, { method: "DELETE" });
    carregarDados();
  }

  const filtrados = patrimonios.filter((p) => {
    const buscaOk = p.nome.toLowerCase().includes(busca.toLowerCase());
    const statusOk = !filtroStatus || p.status === filtroStatus;
    return buscaOk && statusOk;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Patrimônio</h1>
          <p className="text-gray-500 text-sm mt-1">
            Controle de bens e equipamentos
          </p>
        </div>
        <button
          onClick={abrirAdicionar}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Novo Patrimônio
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos os status</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">N° Série</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Localização</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Data Aquisição</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-800 text-sm">
                    {p.nome}
                    {p.descricao && (
                      <p className="text-xs text-gray-400 font-normal">
                        {p.descricao}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {p.numeroSerie || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {p.valorAquisicao ? formatCurrency(p.valorAquisicao) : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {p.localizacao?.nome || "-"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status]}`}
                    >
                      {STATUS_LABELS[p.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {p.dataAquisicao ? formatDate(p.dataAquisicao) : "-"}
                  </td>
                  <td className="px-4 py-3 flex gap-3">
                    <button
                      onClick={() => abrirEditar(p)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeletar(p.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
              {filtrados.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-400 text-sm"
                  >
                    Nenhum patrimônio encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                {editando ? "Editar Patrimônio" : "Novo Patrimônio"}
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <input
                    value={form.descricao}
                    onChange={(e) =>
                      setForm({ ...form, descricao: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Série
                  </label>
                  <input
                    value={form.numeroSerie}
                    onChange={(e) =>
                      setForm({ ...form, numeroSerie: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor de Aquisição (R$)
                  </label>
                  <input
                    type="number"
                    value={form.valorAquisicao}
                    onChange={(e) =>
                      setForm({ ...form, valorAquisicao: e.target.value })
                    }
                    min={0}
                    step={0.01}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Aquisição
                  </label>
                  <input
                    type="date"
                    value={form.dataAquisicao}
                    onChange={(e) =>
                      setForm({ ...form, dataAquisicao: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status *
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as Patrimonio["status"],
                      })
                    }
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Localização
                  </label>
                  <select
                    value={form.localizacaoId}
                    onChange={(e) =>
                      setForm({ ...form, localizacaoId: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Nenhuma</option>
                    {localizacoes.map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.nome}
                      </option>
                    ))}
                  </select>
                </div>
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
