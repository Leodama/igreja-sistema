"use client";

import { useState, useEffect } from "react";
import type { Item, Categoria, Localizacao } from "@/types";
import { fetchJson } from "@/lib/utils";

const UNIDADES = ["kg", "g", "un", "litro", "ml", "cx", "pct", "dz", "par"];

const formVazio = {
  nome: "",
  descricao: "",
  unidade: "un",
  quantidade: 0,
  quantidadeMinima: 0,
  categoriaId: "",
  localizacaoId: "",
};

export default function ItensPage() {
  const [itens, setItens] = useState<Item[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [localizacoes, setLocalizacoes] = useState<Localizacao[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Item | null>(null);
  const [form, setForm] = useState(formVazio);
  const [carregando, setCarregando] = useState(false);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");

  async function carregarDados() {
    const [itens, categorias, localizacoes] = await Promise.all([
      fetchJson<Item[]>("/api/itens", []),
      fetchJson<Categoria[]>("/api/categorias", []),
      fetchJson<Localizacao[]>("/api/localizacoes", []),
    ]);
    setItens(itens);
    setCategorias(categorias);
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

  function abrirEditar(item: Item) {
    setEditando(item);
    setForm({
      nome: item.nome,
      descricao: item.descricao || "",
      unidade: item.unidade,
      quantidade: item.quantidade,
      quantidadeMinima: item.quantidadeMinima,
      categoriaId: item.categoriaId || "",
      localizacaoId: item.localizacaoId || "",
    });
    setModalAberto(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    const url = editando ? `/api/itens/${editando.id}` : "/api/itens";
    const method = editando ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
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
    if (!confirm("Deseja remover este item?")) return;
    await fetch(`/api/itens/${id}`, { method: "DELETE" });
    carregarDados();
  }

  const itensFiltrados = itens.filter((i) => {
    const buscaOk =
      i.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (i.categoria?.nome || "").toLowerCase().includes(busca.toLowerCase());
    const tipoOk = !filtroTipo || i.categoria?.tipo === filtroTipo;
    return buscaOk && tipoOk;
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Itens</h1>
          <p className="text-gray-500 text-sm mt-1">
            Mantimentos e utensílios cadastrados
          </p>
        </div>
        <button
          onClick={abrirAdicionar}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
        >
          + Novo Item
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-4 border-b border-gray-100 flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Buscar por nome ou categoria..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm flex-1 min-w-48 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Todos os tipos</option>
            <option value="MANTIMENTO">Mantimentos</option>
            <option value="UTENSILIO">Utensílios</option>
            <option value="OUTRO">Outros</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Categoria</th>
                <th className="px-4 py-3">Quantidade</th>
                <th className="px-4 py-3">Mínimo</th>
                <th className="px-4 py-3">Localização</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.map((item) => {
                const baixo = item.quantidade <= item.quantidadeMinima;
                return (
                  <tr
                    key={item.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-gray-800 text-sm">
                      {item.nome}
                      {item.descricao && (
                        <p className="text-xs text-gray-400 font-normal">
                          {item.descricao}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.categoria?.nome || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={baixo ? "text-red-600 font-semibold" : "text-gray-700"}>
                        {item.quantidade} {item.unidade}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {item.quantidadeMinima} {item.unidade}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {item.localizacao?.nome || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {baixo ? (
                        <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          Baixo estoque
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">
                          OK
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 flex gap-3">
                      <button
                        onClick={() => abrirEditar(item)}
                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeletar(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                );
              })}
              {itensFiltrados.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-gray-400 text-sm"
                  >
                    Nenhum item encontrado
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
                {editando ? "Editar Item" : "Novo Item"}
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
                    Categoria *
                  </label>
                  <select
                    value={form.categoriaId}
                    onChange={(e) =>
                      setForm({ ...form, categoriaId: e.target.value })
                    }
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Selecione...</option>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidade *
                  </label>
                  <select
                    value={form.unidade}
                    onChange={(e) =>
                      setForm({ ...form, unidade: e.target.value })
                    }
                    required
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {UNIDADES.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qtd. Mínima
                  </label>
                  <input
                    type="number"
                    value={form.quantidadeMinima}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        quantidadeMinima: Number(e.target.value),
                      })
                    }
                    min={0}
                    step={0.001}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                {!editando && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade Inicial
                    </label>
                    <input
                      type="number"
                      value={form.quantidade}
                      onChange={(e) =>
                        setForm({ ...form, quantidade: Number(e.target.value) })
                      }
                      min={0}
                      step={0.001}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}
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
