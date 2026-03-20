"use client";

import { useEffect, useState } from "react";
import { Package, Building2, Heart, AlertTriangle } from "lucide-react";
import type { DashboardStats } from "@/types";
import { formatDate, formatCurrency } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error(`Erro ${r.status}`);
        return r.json();
      })
      .then((data: DashboardStats) => {
        // Garantir que arrays sempre existam mesmo que a API retorne incompleto
        setStats({
          totalItens: data.totalItens ?? 0,
          totalPatrimonios: data.totalPatrimonios ?? 0,
          totalDoacoes: data.totalDoacoes ?? 0,
          doacoesMes: data.doacoesMes ?? 0,
          itensBaixoEstoque: data.itensBaixoEstoque ?? [],
          ultimasMovimentacoes: data.ultimasMovimentacoes ?? [],
          valorTotalPatrimonios: data.valorTotalPatrimonios ?? 0,
        });
      })
      .catch((e) => setErro(e.message));
  }, []);

  if (erro) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-500 font-medium">Erro ao carregar dashboard</p>
          <p className="text-gray-400 text-sm mt-1">{erro}</p>
          <button
            onClick={() => { setErro(null); window.location.reload(); }}
            className="mt-3 text-indigo-600 text-sm hover:underline"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 flex items-center justify-center h-64">
        <p className="text-gray-400">Carregando...</p>
      </div>
    );
  }

  const cards = [
    {
      label: "Total de Itens",
      value: stats.totalItens,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Patrimônios",
      value: stats.totalPatrimonios,
      icon: Building2,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Doações este mês",
      value: stats.doacoesMes,
      icon: Heart,
      color: "bg-pink-50 text-pink-600",
    },
    {
      label: "Baixo Estoque",
      value: stats.itensBaixoEstoque.length,
      icon: AlertTriangle,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Visão geral do sistema</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className={`inline-flex p-2 rounded-lg ${color} mb-3`}>
              <Icon size={20} />
            </div>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
            <p className="text-sm text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low stock items */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h2 className="font-semibold text-gray-700">Itens com Baixo Estoque</h2>
          </div>
          {stats.itensBaixoEstoque.length === 0 ? (
            <p className="p-4 text-sm text-gray-400 text-center">
              Nenhum item com estoque baixo
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-50">
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">Qtd</th>
                  <th className="px-4 py-2">Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {stats.itensBaixoEstoque.map((item) => (
                  <tr key={item.id} className="border-b border-gray-50">
                    <td className="px-4 py-2.5 text-sm font-medium text-gray-800">
                      {item.nome}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-red-600 font-semibold">
                      {item.quantidade} {item.unidade}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-gray-400">
                      {item.quantidadeMinima} {item.unidade}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Recent movements */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-700">Últimas Movimentações</h2>
          </div>
          {stats.ultimasMovimentacoes.length === 0 ? (
            <p className="p-4 text-sm text-gray-400 text-center">
              Nenhuma movimentação registrada
            </p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-50">
                  <th className="px-4 py-2">Item</th>
                  <th className="px-4 py-2">Tipo</th>
                  <th className="px-4 py-2">Qtd</th>
                  <th className="px-4 py-2">Data</th>
                </tr>
              </thead>
              <tbody>
                {stats.ultimasMovimentacoes.map((m) => (
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
                    <td className="px-4 py-2.5 text-xs text-gray-400">
                      {formatDate(m.criadoEm)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {stats.valorTotalPatrimonios > 0 && (
        <div className="mt-4 bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm text-gray-500">
            Valor total de patrimônios ativos:{" "}
            <span className="font-semibold text-gray-800">
              {formatCurrency(stats.valorTotalPatrimonios)}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
