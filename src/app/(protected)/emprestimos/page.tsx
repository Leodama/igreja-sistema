"use client";

import { useState, useEffect } from "react";
import type { Emprestimo, Item } from "@/types";
import { formatDate, fetchJson } from "@/lib/utils";

function codigoEmprestimo(id: string) {
  return id.slice(-8).toUpperCase();
}

const formVazio = {
  itemId: "",
  quantidade: 1,
  responsavel: "",
  evento: "",
  observacao: "",
  dataSaida: new Date().toISOString().split("T")[0],
  dataRetornoPrevisto: "",
};

const devolucaoVazia = {
  dataRetorno: new Date().toISOString().split("T")[0],
  observacao: "",
};

export default function EmprestimosPage() {
  const [emprestimos, setEmprestimos] = useState<Emprestimo[]>([]);
  const [itens, setItens] = useState<Item[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [emprestimoConfirmado, setEmprestimoConfirmado] = useState<Emprestimo | null>(null);
  const [modalDevolucaoCodigo, setModalDevolucaoCodigo] = useState(false);
  const [codigoBusca, setCodigoBusca] = useState("");
  const [emprestimoEncontrado, setEmprestimoEncontrado] = useState<Emprestimo | null>(null);
  const [erroBusca, setErroBusca] = useState("");
  const [modalDevolucao, setModalDevolucao] = useState<Emprestimo | null>(null);
  const [form, setForm] = useState(formVazio);
  const [formDevolucao, setFormDevolucao] = useState(devolucaoVazia);
  const [carregando, setCarregando] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("EM_USO");

  async function carregarDados() {
    const params = new URLSearchParams();
    if (filtroStatus) params.set("status", filtroStatus);
    const [emp, its] = await Promise.all([
      fetchJson<Emprestimo[]>(`/api/emprestimos?${params}`, []),
      fetchJson<Item[]>("/api/itens", []),
    ]);
    setEmprestimos(emp);
    setItens(its);
  }

  useEffect(() => {
    carregarDados();
  }, [filtroStatus]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);

    const res = await fetch("/api/emprestimos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Erro ao registrar empréstimo");
      setCarregando(false);
      return;
    }

    const criado: Emprestimo = await res.json();
    setModalAberto(false);
    setCarregando(false);
    setForm(formVazio);
    setEmprestimoConfirmado(criado);
    carregarDados();
  }

  async function buscarPorCodigo() {
    setErroBusca("");
    setEmprestimoEncontrado(null);
    const codigo = codigoBusca.trim().toUpperCase();
    if (!codigo) return;

    const todos = await fetchJson<Emprestimo[]>("/api/emprestimos?status=EM_USO", []);
    const encontrado = todos.find((e) => codigoEmprestimo(e.id) === codigo);
    if (!encontrado) {
      setErroBusca("Nenhum empréstimo ativo encontrado com esse código.");
    } else {
      setEmprestimoEncontrado(encontrado);
    }
  }

  async function handleDevolver(e: React.FormEvent) {
    e.preventDefault();
    if (!modalDevolucao) return;
    setCarregando(true);

    const res = await fetch(`/api/emprestimos/${modalDevolucao.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formDevolucao),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error || "Erro ao registrar devolução");
      setCarregando(false);
      return;
    }

    setModalDevolucao(null);
    setModalDevolucaoCodigo(false);
    setCodigoBusca("");
    setEmprestimoEncontrado(null);
    setCarregando(false);
    setFormDevolucao(devolucaoVazia);
    carregarDados();
  }

  const emUso = emprestimos.filter((e) => e.status === "EM_USO").length;
  const emAtraso = emprestimos.filter(
    (e) =>
      e.status === "EM_USO" &&
      e.dataRetornoPrevisto &&
      new Date(e.dataRetornoPrevisto) < new Date()
  ).length;

  const itemSelecionado = itens.find((i) => i.id === form.itemId);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Empréstimos</h1>
          <p className="text-gray-500 text-sm mt-1">
            Controle de itens emprestados e devoluções
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => {
              setModalDevolucaoCodigo(true);
              setCodigoBusca("");
              setEmprestimoEncontrado(null);
              setErroBusca("");
              setFormDevolucao(devolucaoVazia);
            }}
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Registrar Devolução
          </button>
          <button
            onClick={() => setModalAberto(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            + Registrar Empréstimo
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="flex gap-4 mb-6">
        <div className="bg-purple-50 border border-purple-100 rounded-lg px-4 py-2 text-sm">
          <span className="text-purple-700 font-medium">{emUso} em uso</span>
        </div>
        {emAtraso > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm">
            <span className="text-red-700 font-medium">⚠ {emAtraso} em atraso</span>
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {(["EM_USO", "RETORNADO", ""] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFiltroStatus(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filtroStatus === s
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {s === "EM_USO" ? "Em Uso" : s === "RETORNADO" ? "Devolvidos" : "Todos"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Item</th>
                <th className="px-4 py-3">Qtd</th>
                <th className="px-4 py-3">Responsável</th>
                <th className="px-4 py-3">Evento</th>
                <th className="px-4 py-3">Saída</th>
                <th className="px-4 py-3">Prev. Retorno</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ações</th>
              </tr>
            </thead>
            <tbody>
              {emprestimos.map((emp) => {
                const emAtrasoItem =
                  emp.status === "EM_USO" &&
                  emp.dataRetornoPrevisto &&
                  new Date(emp.dataRetornoPrevisto) < new Date();

                return (
                  <tr
                    key={emp.id}
                    className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded tracking-widest">
                        {codigoEmprestimo(emp.id)}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 text-sm">
                      {emp.item.nome}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {emp.quantidade} {emp.item.unidade}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {emp.responsavel}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {emp.evento || "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {formatDate(emp.dataSaida)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {emp.dataRetornoPrevisto ? (
                        <span className={emAtrasoItem ? "text-red-600 font-semibold" : "text-gray-400"}>
                          {formatDate(emp.dataRetornoPrevisto)}
                          {emAtrasoItem && " ⚠"}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          emp.status === "EM_USO"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {emp.status === "EM_USO" ? "Em uso" : "Devolvido"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {emp.status === "EM_USO" && (
                        <button
                          onClick={() => {
                            setModalDevolucao(emp);
                            setFormDevolucao(devolucaoVazia);
                          }}
                          className="text-green-700 hover:text-green-900 text-xs font-medium border border-green-200 bg-green-50 px-2 py-1 rounded"
                        >
                          Devolver
                        </button>
                      )}
                      {emp.status === "RETORNADO" && emp.dataRetorno && (
                        <span className="text-xs text-gray-400">
                          {formatDate(emp.dataRetorno)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {emprestimos.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-gray-400 text-sm">
                    Nenhum empréstimo encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Registrar Empréstimo */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white">
              <h2 className="text-lg font-semibold text-gray-800">Registrar Empréstimo</h2>
              <button onClick={() => setModalAberto(false)} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item *</label>
                <select
                  value={form.itemId}
                  onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                  required
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Selecione o item...</option>
                  {itens.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.nome} — {i.quantidadeDisponivel ?? i.quantidade} {i.unidade} disponível
                    </option>
                  ))}
                </select>
                {itemSelecionado && (
                  <p className="text-xs text-gray-400 mt-1">
                    Disponível: {itemSelecionado.quantidadeDisponivel ?? itemSelecionado.quantidade} {itemSelecionado.unidade}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
                <input
                  type="number"
                  value={form.quantidade}
                  onChange={(e) => setForm({ ...form, quantidade: Number(e.target.value) })}
                  required
                  min={1}
                  step={1}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsável *</label>
                <input
                  value={form.responsavel}
                  onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
                  required
                  placeholder="Nome de quem está pegando..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Evento / Finalidade</label>
                <input
                  value={form.evento}
                  onChange={(e) => setForm({ ...form, evento: e.target.value })}
                  placeholder="Ex: Culto de domingo, Retiro..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data de Saída</label>
                  <input
                    type="date"
                    value={form.dataSaida}
                    onChange={(e) => setForm({ ...form, dataSaida: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prev. Retorno</label>
                  <input
                    type="date"
                    value={form.dataRetornoPrevisto}
                    onChange={(e) => setForm({ ...form, dataRetornoPrevisto: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                <input
                  value={form.observacao}
                  onChange={(e) => setForm({ ...form, observacao: e.target.value })}
                  placeholder="Observações adicionais..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalAberto(false)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                  Cancelar
                </button>
                <button type="submit" disabled={carregando} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50">
                  {carregando ? "Salvando..." : "Registrar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Código do empréstimo criado */}
      {emprestimoConfirmado && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm text-center p-8">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">Empréstimo Registrado!</h2>
            <p className="text-sm text-gray-500 mb-6">
              Anote o código abaixo. O responsável deverá apresentá-lo na devolução.
            </p>
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl py-5 px-4 mb-4">
              <p className="text-xs text-gray-400 mb-2 uppercase tracking-widest">Código do Empréstimo</p>
              <p className="font-mono text-3xl font-bold text-indigo-700 tracking-widest">
                {codigoEmprestimo(emprestimoConfirmado.id)}
              </p>
            </div>
            <div className="text-left text-sm text-gray-600 space-y-1 mb-6 bg-gray-50 rounded-lg px-4 py-3">
              <p><span className="text-gray-400">Item:</span> {emprestimoConfirmado.item.nome}</p>
              <p><span className="text-gray-400">Qtd:</span> {emprestimoConfirmado.quantidade} {emprestimoConfirmado.item.unidade}</p>
              <p><span className="text-gray-400">Responsável:</span> {emprestimoConfirmado.responsavel}</p>
              {emprestimoConfirmado.evento && (
                <p><span className="text-gray-400">Evento:</span> {emprestimoConfirmado.evento}</p>
              )}
              {emprestimoConfirmado.dataRetornoPrevisto && (
                <p><span className="text-gray-400">Retorno previsto:</span> {formatDate(emprestimoConfirmado.dataRetornoPrevisto)}</p>
              )}
            </div>
            <button
              onClick={() => setEmprestimoConfirmado(null)}
              className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* Modal: Devolução por Código */}
      {modalDevolucaoCodigo && !modalDevolucao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Registrar Devolução</h2>
              <button
                onClick={() => { setModalDevolucaoCodigo(false); setCodigoBusca(""); setEmprestimoEncontrado(null); setErroBusca(""); }}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >✕</button>
            </div>
            <div className="p-5">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código do Empréstimo
              </label>
              <div className="flex gap-2">
                <input
                  value={codigoBusca}
                  onChange={(e) => { setCodigoBusca(e.target.value.toUpperCase()); setErroBusca(""); setEmprestimoEncontrado(null); }}
                  onKeyDown={(e) => e.key === "Enter" && buscarPorCodigo()}
                  placeholder="Ex: A1B2C3D4"
                  maxLength={8}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={buscarPorCodigo}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                >
                  Buscar
                </button>
              </div>

              {erroBusca && (
                <p className="text-sm text-red-600 mt-2">{erroBusca}</p>
              )}

              {emprestimoEncontrado && (
                <div className="mt-4 border border-green-200 bg-green-50 rounded-lg px-4 py-3 text-sm text-gray-700 space-y-1">
                  <p className="font-semibold text-green-800">Empréstimo encontrado</p>
                  <p><span className="text-gray-400">Item:</span> {emprestimoEncontrado.item.nome}</p>
                  <p><span className="text-gray-400">Qtd:</span> {emprestimoEncontrado.quantidade} {emprestimoEncontrado.item.unidade}</p>
                  <p><span className="text-gray-400">Responsável:</span> {emprestimoEncontrado.responsavel}</p>
                  {emprestimoEncontrado.evento && (
                    <p><span className="text-gray-400">Evento:</span> {emprestimoEncontrado.evento}</p>
                  )}
                  <p><span className="text-gray-400">Saiu em:</span> {formatDate(emprestimoEncontrado.dataSaida)}</p>
                  <button
                    onClick={() => {
                      setModalDevolucao(emprestimoEncontrado);
                      setFormDevolucao(devolucaoVazia);
                    }}
                    className="mt-2 w-full bg-green-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-green-700"
                  >
                    Confirmar Devolução
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Formulário de Devolução */}
      {modalDevolucao && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Confirmar Devolução</h2>
              <button
                onClick={() => setModalDevolucao(null)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >✕</button>
            </div>
            <div className="px-5 pt-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded tracking-widest">
                  {codigoEmprestimo(modalDevolucao.id)}
                </span>
              </div>
              <p className="text-sm text-gray-700 font-medium">{modalDevolucao.item.nome}</p>
              <p className="text-xs text-gray-400">
                {modalDevolucao.quantidade} {modalDevolucao.item.unidade} · Responsável: {modalDevolucao.responsavel}
              </p>
            </div>
            <form onSubmit={handleDevolver} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Devolução</label>
                <input
                  type="date"
                  value={formDevolucao.dataRetorno}
                  onChange={(e) => setFormDevolucao({ ...formDevolucao, dataRetorno: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observação</label>
                <input
                  value={formDevolucao.observacao}
                  onChange={(e) => setFormDevolucao({ ...formDevolucao, observacao: e.target.value })}
                  placeholder="Condições, observações..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalDevolucao(null)} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800">
                  Cancelar
                </button>
                <button type="submit" disabled={carregando} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                  {carregando ? "Salvando..." : "Confirmar Devolução"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
