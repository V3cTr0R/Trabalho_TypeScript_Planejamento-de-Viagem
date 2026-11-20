/** Busca um elemento pelo id e gera erro claro se o HTML não tiver aquele id. */
export function elemento<T extends HTMLElement = HTMLElement>(id: string): T {
  const encontrado = document.getElementById(id);
  if (!encontrado) {
    throw new Error(`Elemento #${id} não existe no HTML.`);
  }
  return encontrado as T;
}

/** Atalho para input de texto/date. */
export function campo(id: string): HTMLInputElement {
  return elemento<HTMLInputElement>(id);
}

/** Atalho para <select>. */
export function selecao(id: string): HTMLSelectElement {
  return elemento<HTMLSelectElement>(id);
}