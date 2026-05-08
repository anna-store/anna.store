export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  images: string[];
  description: string;
  sizes: string[];
  colors: string[];
  rating: number;
  reviews: number;
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isBestSeller?: boolean;
  gender?: string;
  tags: string[];
};

export const CATEGORIES = [
  "Todos",
  "Tênis",
  "Casual",
  "Esportivo",
  "Sandálias",
  "Botas",
  "Chinelos",
  "Infantil",
];

export const PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Tênis Runner Pro X",
    brand: "Nike",
    category: "Tênis",
    gender: "Masculino",
    price: 299.90,
    originalPrice: 399.90,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
    ],
    description: "Tênis de corrida com tecnologia de amortecimento avançada. Ideal para treinos diários e competições. Solado de borracha de alta durabilidade com cabedal em mesh respirável.",
    sizes: ["38", "39", "40", "41", "42", "43", "44"],
    colors: ["Preto/Rosa", "Branco/Azul", "Cinza"],
    rating: 4.8,
    reviews: 142,
    inStock: true,
    isNew: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ["corrida", "esporte", "masculino"],
  },
  {
    id: "2",
    name: "Sneaker Street Style",
    brand: "Adidas",
    category: "Casual",
    gender: "Unissex",
    price: 249.90,
    originalPrice: 329.90,
    images: [
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
    ],
    description: "Tênis casual com design moderno e urbano. Combina estilo e conforto para o dia a dia. Palmilha anatômica e solado antiderrapante.",
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
    colors: ["Branco", "Preto", "Azul Marinho"],
    rating: 4.6,
    reviews: 89,
    inStock: true,
    isFeatured: true,
    tags: ["casual", "urbano", "unissex"],
  },
  {
    id: "3",
    name: "Tênis Feminino Glam",
    brand: "Vans",
    category: "Tênis",
    gender: "Feminino",
    price: 219.90,
    images: [
      "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&q=80",
      "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=800&q=80",
    ],
    description: "Tênis feminino com design elegante e moderno. Perfeito para looks casuais e despojados. Material premium with acabamento sofisticado.",
    sizes: ["34", "35", "36", "37", "38", "39"],
    colors: ["Rosa", "Branco Floral", "Lilás"],
    rating: 4.9,
    reviews: 213,
    inStock: true,
    isNew: true,
    isFeatured: true,
    isBestSeller: true,
    tags: ["feminino", "casual", "fashion"],
  },
  {
    id: "4",
    name: "Boot Couro Premium",
    brand: "Timberland",
    category: "Botas",
    gender: "Masculino",
    price: 459.90,
    originalPrice: 579.90,
    images: [
      "https://images.unsplash.com/photo-1664551585759-8a6259161936?w=800&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    ],
    description: "Bota de couro legítimo com solado robusto. Ideal para trilhas e uso urbano. Resistente à água com forro interno confortável.",
    sizes: ["39", "40", "41", "42", "43", "44"],
    colors: ["Caramelo", "Preto", "Marrom"],
    rating: 4.7,
    reviews: 67,
    inStock: true,
    isFeatured: true,
    tags: ["bota", "couro", "premium"],
  },
  {
    id: "5",
    name: "Sandália Comfort Plus",
    brand: "Birkenstock",
    category: "Sandálias",
    gender: "Feminino",
    price: 189.90,
    images: [
      "https://images.unsplash.com/photo-1611086074785-6b5b9b0d0a9d?w=800&q=80",
      "https://images.unsplash.com/photo-1625813112867-ab7dab3bce61?w=800&q=80",
    ],
    description: "Sandália anatômica com palmilha de cortiça natural. Proporciona suporte e conforto para uso prolongado. Tiras ajustáveis em couro.",
    sizes: ["35", "36", "37", "38", "39", "40"],
    colors: ["Natural", "Preto", "Marrom"],
    rating: 4.5,
    reviews: 98,
    inStock: true,
    tags: ["sandália", "conforto", "verão"],
  },
  {
    id: "6",
    name: "Tênis Infantil Sport",
    brand: "Nike",
    category: "Infantil",
    gender: "Kids",
    price: 159.90,
    originalPrice: 199.90,
    images: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    ],
    description: "Tênis infantil durável e confortável para crianças ativas. Solado reforçado e cabedal lavável. Fechamento em velcro para facilitar o uso.",
    sizes: ["25", "26", "27", "28", "29", "30", "31", "32", "33"],
    colors: ["Azul/Branco", "Rosa/Branco", "Verde/Preto"],
    rating: 4.8,
    reviews: 156,
    inStock: true,
    isBestSeller: true,
    tags: ["infantil", "criança", "esporte"],
  },
  {
    id: "7",
    name: "Air Cushion Runner",
    brand: "New Balance",
    category: "Esportivo",
    price: 349.90,
    originalPrice: 429.90,
    images: [
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
    ],
    description: "Tênis esportivo de alta performance com sistema de amortecimento por câmaras de ar. Cabedal em mesh 3D ultra respirável. Para atletas exigentes.",
    sizes: ["38", "39", "40", "41", "42", "43", "44", "45"],
    colors: ["Cinza/Laranja", "Preto/Vermelho", "Branco/Azul"],
    rating: 4.9,
    reviews: 201,
    inStock: true,
    isNew: true,
    isBestSeller: true,
    tags: ["corrida", "esporte", "alta performance"],
  },
  {
    id: "8",
    name: "Slip-On Canvas Urban",
    brand: "Vans",
    category: "Casual",
    price: 179.90,
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&q=80",
    ],
    description: "Slip-on em lona canvas com design clássico e atemporal. Fácil de calçar e tirar. Palmilha macia para conforto o dia todo.",
    sizes: ["36", "37", "38", "39", "40", "41", "42"],
    colors: ["Preto Liso", "Xadrez", "Branco"],
    rating: 4.4,
    reviews: 88,
    inStock: true,
    tags: ["casual", "slip-on", "skate"],
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCTS.filter((p) => p.isFeatured);
}

export function getBestSellers(): Product[] {
  return PRODUCTS.filter((p) => p.isBestSeller);
}

export function getNewProducts(): Product[] {
  return PRODUCTS.filter((p) => p.isNew);
}

export function getProductsByCategory(category: string): Product[] {
  if (category === "Todos") return PRODUCTS;
  return PRODUCTS.filter((p) => p.category === category);
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price);
}

export function getDiscount(price: number, originalPrice: number): number {
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
