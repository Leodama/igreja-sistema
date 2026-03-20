export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("pt-BR");
}

export function formatDateTime(date: string | Date): string {
  return new Date(date).toLocaleString("pt-BR");
}

export function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Fetch com tratamento de erro — retorna `fallback` se a resposta não for OK */
export async function fetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) return fallback;
    return res.json();
  } catch {
    return fallback;
  }
}
