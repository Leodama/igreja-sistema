"use client";

import { useState, useEffect } from "react";
import type { Doacao } from "@/types";
import { formatDate, formatCurrency, fetchJson } from "@/lib/utils";

const formVazio = {
  doador: "",
  contato: "",
  descricao: "",
  quantidade: "",
  unidade: "",
  valorEstimado: "",
  dataDoacao: new Date().toISOString().split("T")[0],
  observacoes: "",
};

export default function DoacoesPage() {
  const [doacoes, setDoacoes] = useState<Doacao[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Doacao | null>(null);
  const [form, setForm] = useState(formVazio);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");

  async function carregarDados() {
    setDoacoes(await fetchJson<Doacao[]>("/api/doacoes", []));
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function abrirAdicionar() {
    setEditando(null);
    setForm(formVazio);
    setModalAberto(true);
  }

  function abrirEditar(d: Doacao) {
    setEditando(d);
    setForm({
      doador: d.doador || "",
      contato: d.contato || "",
      descricao: d.descricao,
      quantidade: d.quantidade ? String(d.quantidade) : "",
      unidade: d.unidade || "",
      valorEstimado: d.valorEstimado ? String(d.valorEstimado) : "",
      dataDoacao: new Date(d.dataDoacao).toISOString().split("T")[0],
      observacoes: d.observacoes || "",
    });
    setModalAberto(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    const url = editando ? `/api/doacoes/${editando.id}` : "/api/doacoes";
    const method = editando ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        quantidade: form.quantidade ? Number(form.quantidade) : null,
        valorEstimado: form.valorEstimado ? Number(form.valorEstimado) : null,
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
    if (!confirm("Deseja remover esta doação?")) return;
    await fetch(`/api/doacoes/${id}`, { method: "DELETE" });
    carregarDados();
  }

  const filtradas = doacoes.filter(
    (d) =>
      d.descricao.toLowerCase().includes(busca.toLowerCase()) ||
      (d.doador || "").toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Doações</h1>
          <p className="text-gray-500 text-sm mt-1">Registro de doações recebidas</p>
        </div>
        <button
          onClick={abrirAdicionar}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Nova Doação
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <input
            type="text"
            placeholder="Buscar por doador ou descrição..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3">Doador</th>
                <th className="px-4 py-3">Quantidade</th>
                <th className="px-4 py-3">Valor Est.</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map((d) => (
                <tr
                  key={d.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-800 text-sm">
                    {d.descricao}
                    {d.observacoes && (
                      <p className="text-xs text-gray-400 font-normal">
                        {d.observacoes}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {d.doador || "Anônimo"}
                    {d.contato && (
                      <p className="text-xs text-gray-400">{d.contato}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {d.quantidade
                      ? `${d.quantidade} ${d.unidade || ""}`
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {d.valorEstimado ? formatCurrency(d.valorEstimado) : "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {formatDate(d.dataDoacao)}
                  </td>
                  <td className="px-4 py-3 flex gap-3">
                    <button
                      onClick={() => abrirEditar(d)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeletar(d.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
              {filtradas.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-gray-400 text-sm"
                  >
                    Nenhuma doação registrada
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
                {editando ? "Editar Doação" : "Nova Doação"}
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
                    Descrição do item doado *
                  </label>
                  <input
                    value={form.descricao}
                    onChange={(e) =>
                      setForm({ ...form, descricao: e.target.value })
                    }
                    required
                    placeholder="Ex: Arroz, Roupas, Cadeiras..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Doador
                  </label>
                  <input
                    value={form.doador}
                    onChange={(e) =>
                      setForm({ ...form, doador: e.target.value })
                    }
                    placeholder="Nome do doador"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contato
                  </label>
                  <input
                    value={form.contato}
                    onChange={(e) =>
                      setForm({ ...form, contato: e.target.value })
                    }
                    placeholder="Telefone ou email"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    value={form.quantidade}
                    onChange={(e) =>
                      setForm({ ...form, quantidade: e.target.value })
                    }
                    min={0}
                    step={0.001}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidade
                  </label>
                  <input
                    value={form.unidade}
                    onChange={(e) =>
                      setForm({ ...form, unidade: e.target.value })
                    }
                    placeholder="kg, un, cx..."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Estimado (R$)
                  </label>
                  <input
                    type="number"
                    value={form.valorEstimado}
                    onChange={(e) =>
                      setForm({ ...form, valorEstimado: e.target.value })
                    }
                    min={0}
                    step={0.01}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data da Doação *
                  </label>
                  <input
                    type="date"
                    value={form.dataDoacao}
                    onChange={(e) =>
                      setForm({ ...form, dataDoacao: e.target.value })
                    }
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={form.observacoes}
                    onChange={(e) =>
                      setForm({ ...form, observacoes: e.target.value })
                    }
                    rows={2}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
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
