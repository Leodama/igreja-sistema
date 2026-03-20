"use client";

import { useState, useEffect } from "react";
import type { Item, Movimentacao } from "@/types";
import { formatDate, fetchJson } from "@/lib/utils";

const formVazio = {
  itemId: "",
  tipo: "ENTRADA" as "ENTRADA" | "SAIDA",
  quantidade: 1,
  observacao: "",
  destinatario: "",
  dataMovimentacao: new Date().toISOString().split("T")[0],
};

export default function EstoquePage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [form, setForm] = useState(formVazio);
  const [carregando, setCarregando] = useState(false);

  async function carregarDados() {
    const [itens, movimentacoes] = await Promise.all([
      fetchJson<Item[]>("/api/itens", []),
      fetchJson<Movimentacao[]>("/api/movimentacoes?limit=30", []),
    ]);
    setItens(itens);
    setMovimentacoes(movimentacoes);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    const res = await fetch("/api/movimentacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Erro ao registrar movimentação");
      setCarregando(false);
      return;
    }

    setModalAberto(false);
    setCarregando(false);
    setForm(formVazio);
    carregarDados();
  }

  const itensBaixoEstoque = itens.filter(
    (i) => i.quantidade <= i.quantidadeMinima
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Estoque</h1>
          <p className="text-gray-500 text-sm mt-1">
            Controle de entradas e saídas
          </p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Registrar Movimentação
        </button>
      </div>

      {itensBaixoEstoque.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <span className="text-amber-500 text-lg">⚠️</span>
          <div>
            <p className="text-sm font-semibold text-amber-800">
              {itensBaixoEstoque.length} item(s) com estoque abaixo do mínimo:
            </p>
            <p className="text-sm text-amber-700 mt-0.5">
              {itensBaixoEstoque.map((i) => i.nome).join(", ")}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current stock */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">Estoque Atual</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-50">
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">Quantidade</th>
                  <th className="px-4 py-2">Localização</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((item) => {
                  const baixo = item.quantidade <= item.quantidadeMinima;
                  return (
                    <tr key={item.id} className="border-b border-gray-50">
                      <td className="px-4 py-2.5 text-sm font-medium text-gray-800">
                        {item.nome}
                      </td>
                      <td className="px-4 py-2.5 text-sm">
                        <span className={baixo ? "text-red-600 font-semibold" : "text-gray-700"}>
                          {item.quantidade} {item.unidade}
                        </span>
                        {baixo && (
                          <span className="ml-2 text-xs text-red-500">
                            (mín: {item.quantidadeMinima})
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-sm text-gray-400">
                        {item.localizacao?.nome || "-"}
                      </td>
                    </tr>
                  );
                })}
                {itens.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-gray-400 text-sm"
                    >
                      Nenhum item cadastrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent movements */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">
              Movimentações Recentes
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-50">
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2">Qtd</th>
                  <th className="px-4 py-2">Entregue/Recebido</th>
                  <th className="px-4 py-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {movimentacoes.map((m) => (
                  <tr key={m.id} className="border-b border-gray-50">
                    <td className="px-4 py-2.5 text-sm text-gray-800">
                      {m.item.nome}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          m.tipo === "ENTRADA"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {m.tipo === "ENTRADA" ? "Entrada" : "Saída"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-600">
                      {m.quantidade} {m.item.unidade}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-500">
                      {m.destinatario || "-"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-gray-400">
                      {formatDate(m.dataMovimentacao || m.criadoEm)}
                    </td>
                  </tr>
                ))}
                {movimentacoes.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-gray-400 text-sm"
                    >
                      Nenhuma movimentação registrada
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>


      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">
                Registrar Movimentação
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
                  Item *
                </label>
                <select
                  value={form.itemId}
                  onChange={(e) =>
                    setForm({ ...form, itemId: e.target.value })
                  }
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione o item...</option>
                  {itens.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nome} — {i.quantidade} {i.unidade} em estoque
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo *
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="ENTRADA"
                      checked={form.tipo === "ENTRADA"}
                      onChange={() => setForm({ ...form, tipo: "ENTRADA" })}
                    />
                    <span className="text-sm font-medium text-green-700">
                      ↑ Entrada
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="SAIDA"
                      checked={form.tipo === "SAIDA"}
                      onChange={() => setForm({ ...form, tipo: "SAIDA" })}
                    />
                    <span className="text-sm font-medium text-red-700">
                      ↓ Saída
                    </span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade *
                </label>
                <input
                  type="number"
                  value={form.quantidade}
                  onChange={(e) =>
                    setForm({ ...form, quantidade: Number(e.target.value) })
                  }
                  required
                  min={1}
                  step={1}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {form.tipo === "SAIDA" ? "Entregue para" : "Recebido de"}
                  </label>
                  <input
                    value={form.destinatario}
                    onChange={(e) =>
                      setForm({ ...form, destinatario: e.target.value })
                    }
                    placeholder={form.tipo === "SAIDA" ? "Nome de quem recebeu..." : "Nome de quem entregou..."}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data da Movimentação
                  </label>
                  <input
                    type="date"
                    value={form.dataMovimentacao}
                    onChange={(e) =>
                      setForm({ ...form, dataMovimentacao: e.target.value })
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observação
                  </label>
                  <input
                    value={form.observacao}
                    onChange={(e) =>
                      setForm({ ...form, observacao: e.target.value })
                    }
                    placeholder="Ex: uso no culto..."
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
                  {carregando ? "Salvando..." : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
