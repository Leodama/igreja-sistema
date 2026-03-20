"use client";

import { useState, useEffect } from "react";
import type { Movimentacao } from "@/types";
import { formatDateTime, fetchJson } from "@/lib/utils";

export default function HistoricoPage() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  async function carregarDados() {
    const params = new URLSearchParams();
    if (busca) params.set("busca", busca);
    if (filtroTipo) params.set("tipo", filtroTipo);
    if (dataInicio) params.set("dataInicio", dataInicio);
    if (dataFim) params.set("dataFim", dataFim);

    setMovimentacoes(
      await fetchJson<Movimentacao[]>(`/api/movimentacoes?${params}`, [])
    );
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function handleFiltrar(e: React.FormEvent) {
    e.preventDefault();
    carregarDados();
  }

  const totalEntradas = movimentacoes
    .filter((m) => m.tipo === "ENTRADA")
    .reduce((acc, m) => acc + m.quantidade, 0);

  const totalSaidas = movimentacoes
    .filter((m) => m.tipo === "SAIDA")
    .reduce((acc, m) => acc + m.quantidade, 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Histórico</h1>
        <p className="text-gray-500 text-sm mt-1">
          Todas as movimentações de estoque
        </p>
      </div>

      {/* Filters */}
      <form
        onSubmit={handleFiltrar}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mb-6"
      >
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Buscar item
            </label>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Nome do item..."
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Tipo
            </label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos</option>
              <option value="ENTRADA">Entradas</option>
              <option value="SAIDA">Saídas</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Data início
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Data fim
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700"
          >
            Filtrar
          </button>
          <button
            type="button"
            onClick={() => {
              setBusca("");
              setFiltroTipo("");
              setDataInicio("");
              setDataFim("");
              setTimeout(carregarDados, 0);
            }}
            className="text-gray-500 hover:text-gray-700 text-sm px-2 py-1.5"
          >
            Limpar
          </button>
        </div>
      </form>

      {/* Summary */}
      {movimentacoes.length > 0 && (
        <div className="flex gap-4 mb-4">
          <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-2 text-sm">
            <span className="text-green-700 font-medium">
              ↑ {movimentacoes.filter((m) => m.tipo === "ENTRADA").length}{" "}
              entradas
            </span>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-lg px-4 py-2 text-sm">
            <span className="text-red-700 font-medium">
              ↓ {movimentacoes.filter((m) => m.tipo === "SAIDA").length} saídas
            </span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Quantidade</th>
                <th className="px-4 py-3">Entregue/Recebido</th>
                <th className="px-4 py-3">Observação</th>
                <th className="px-4 py-3">Registrado por</th>
                <th className="px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-800 text-sm">
                    {m.item.nome}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        m.tipo === "ENTRADA"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {m.tipo === "ENTRADA" ? "↑ Entrada" : "↓ Saída"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {m.quantidade} {m.item.unidade}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {m.destinatario || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {m.observacao || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {m.usuario.nome}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {formatDateTime(m.dataMovimentacao || m.criadoEm)}
                  </td>
                </tr>
              ))}
              {movimentacoes.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-400 text-sm"
                  >
                    Nenhuma movimentação encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
