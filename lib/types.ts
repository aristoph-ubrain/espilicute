export const TAMANHOS = ["PP", "P", "M", "G", "GG"] as const;
export type Tamanho = (typeof TAMANHOS)[number];

export type Cor = { nome: string; hex: string };

export type EstoqueTamanho = { tamanho: Tamanho; estoque: number };

export type Etiquetas = {
  novidade: boolean;
  maisVendido: boolean;
  oferta: boolean;
};

/** Produto já serializado (pronto para Server/Client Components e para `use cache`). */
export type Produto = {
  id: string;
  slug: string;
  nome: string;
  estilo: string;
  descricao: string;
  tecido: string;
  /** Preço em centavos */
  preco: number;
  /** Preço "de" em centavos — só preencher quando a promoção for real */
  precoOriginal: number | null;
  cores: Cor[];
  tamanhos: EstoqueTamanho[];
  imagens: string[];
  etiquetas: Etiquetas;
  ativo: boolean;
  /** Produto de demonstração criado pelo seed */
  exemplo: boolean;
  criadoEm: string;
};

export const STATUS_PEDIDO = ["novo", "confirmado", "enviado", "entregue", "cancelado"] as const;
export type StatusPedido = (typeof STATUS_PEDIDO)[number];

export const STATUS_LABEL: Record<StatusPedido, string> = {
  novo: "Novo",
  confirmado: "Confirmado",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export type ItemPedido = {
  produtoId: string;
  nome: string;
  cor: string;
  tamanho: Tamanho;
  qtd: number;
  /** Preço unitário em centavos no momento do pedido */
  preco: number;
};

export type Pedido = {
  id: string;
  numero: number;
  itens: ItemPedido[];
  subtotal: number;
  cliente: { nome: string; local: string };
  entrega: "entrega" | "retirada";
  status: StatusPedido;
  criadoEm: string;
};

export type Configuracoes = {
  whatsapp: string;
  avisoTopo: string;
  bannerUrl: string;
  instagram: string;
  razaoSocial: string;
  cnpj: string;
  emailContato: string;
  guiaMedidas: string;
  sobre: string;
  entrega: string;
  trocas: string;
  privacidade: string;
  termos: string;
  faq: string;
};

export const CONFIG_PADRAO: Configuracoes = {
  whatsapp: "",
  avisoTopo: "Peça pelo WhatsApp em poucos cliques",
  bannerUrl: "",
  instagram: "",
  razaoSocial: "",
  cnpj: "",
  emailContato: "",
  guiaMedidas: "",
  sobre: "",
  entrega: "",
  trocas: "",
  privacidade: "",
  termos: "",
  faq: "",
};

/** Item guardado na sacola (navegador). O preço é sempre recalculado no servidor. */
export type ItemSacola = {
  produtoId: string;
  slug: string;
  nome: string;
  cor: string;
  corHex: string;
  tamanho: Tamanho;
  qtd: number;
  preco: number;
  imagem: string | null;
};
