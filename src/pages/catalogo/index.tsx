import { useState, useMemo, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, X, ChevronDown, Search, Grid2X2, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Slider } from "@/components/ui/slider.tsx";
import { Checkbox } from "@/components/ui/checkbox.tsx";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select.tsx";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api.js";
import {
  CATEGORIES,
  formatPrice,
  getDiscount,
  type Product
} from "@/lib/products-data.ts";
import { useWishlistStore } from "@/hooks/use-wishlist.ts";
import { useCartStore } from "@/hooks/use-cart.ts";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard.tsx";
import { cn } from "@/lib/utils.ts";

const ALL_SIZES = ["25","26","27","28","29","30","31","32","33","34","35","36","37","38","39","40","41","42","43","44","45"];
// Removed static ALL_BRANDS calculation
const SORT_OPTIONS = [
  { value: "relevance", label: "Relevância" },
  { value: "price-asc", label: "Menor preço" },
  { value: "price-desc", label: "Maior preço" },
  { value: "rating", label: "Mais avaliados" },
  { value: "newest", label: "Novidades" },
];

function sortProducts(products: Product[], sort: string): Product[] {
  switch (sort) {
    case "price-asc": return [...products].sort((a, b) => a.price - b.price);
    case "price-desc": return [...products].sort((a, b) => b.price - a.price);
    case "rating": return [...products].sort((a, b) => b.rating - a.rating);
    case "newest": return [...products].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    default: return products;
  }
}

export default function CatalogoPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("categoria") ?? "Todos";
  const searchParam = searchParams.get("search") ?? "";
  const isPromo = searchParams.get("promo") === "true";
  const isNew = searchParams.get("new") === "true";
  const genderParam = searchParams.get("genero") ?? "Todos";

  const [search, setSearch] = useState(searchParam);
  const [activeCategory, setActiveCategory] = useState(categoryParam);
  const [activeGender, setActiveGender] = useState(genderParam);

  // Sync state with URL params
  useEffect(() => {
    setSearch(searchParam);
  }, [searchParam]);

  useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  useEffect(() => {
    setActiveGender(genderParam);
  }, [genderParam]);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 600]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sort, setSort] = useState("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const dbProducts = useQuery(api.products.getAll) || [];
  const PRODUCTS_DYNAMIC = useMemo(() => dbProducts.map(p => ({ ...p, id: p._id })), [dbProducts]);
  
  const ALL_BRANDS = useMemo(() => [...new Set(PRODUCTS_DYNAMIC.map((p) => p.brand))].sort(), [PRODUCTS_DYNAMIC]);
  const ALL_CATEGORIES_DYNAMIC = useMemo(() => ["Todos", ...new Set(PRODUCTS_DYNAMIC.map((p) => p.category))].sort(), [PRODUCTS_DYNAMIC]);
  const ALL_GENDERS_DYNAMIC = useMemo(() => ["Todos", ...new Set(PRODUCTS_DYNAMIC.map((p: any) => p.gender).filter(Boolean))].sort(), [PRODUCTS_DYNAMIC]);

  const filtered = useMemo(() => {
    let result = PRODUCTS_DYNAMIC;

    if (activeCategory !== "Todos") {
      result = result.filter((p) => p.category === activeCategory);
    }
    if (activeGender !== "Todos") {
      result = result.filter((p: any) => p.gender === activeGender);
    }
    if (isPromo) {
      result = result.filter((p) => p.originalPrice != null);
    }
    if (isNew) {
      result = result.filter((p) => p.isNew);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.some((t) => t.includes(q))
      );
    }
    result = result.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (selectedSizes.length > 0) {
      result = result.filter((p) => selectedSizes.some((s) => p.sizes.includes(s)));
    }
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    return sortProducts(result, sort);
  }, [activeCategory, activeGender, isPromo, isNew, search, priceRange, selectedSizes, selectedBrands, sort]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setActiveCategory("Todos");
    setActiveGender("Todos");
    setPriceRange([0, 600]);
    setSelectedSizes([]);
    setSelectedBrands([]);
    setSearch("");
    setSearchParams({});
  };

  const activeFilterCount =
    (activeCategory !== "Todos" ? 1 : 0) +
    (activeGender !== "Todos" ? 1 : 0) +
    selectedSizes.length +
    selectedBrands.length +
    (priceRange[0] > 0 || priceRange[1] < 600 ? 1 : 0);

  const FiltersPanel = () => (
    <div className="space-y-6">
      {/* Gender / Public */}
      <div>
        <h3 className="font-black uppercase tracking-widest text-[10px] mb-4 text-[#660e14]">Público</h3>
        <div className="flex flex-wrap gap-2">
          {ALL_GENDERS_DYNAMIC.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGender(g)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-2 ${
                activeGender === g
                  ? "bg-[#660e14] border-[#660e14] text-white shadow-lg shadow-[#660e14]/20"
                  : "border-black/5 text-[#660e14]/40 hover:border-[#660e14]/20 hover:text-[#660e14]/60"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-black uppercase tracking-widest text-[10px] mb-4 text-[#660e14]">Faixa de Preço</h3>
        <Slider
          min={0}
          max={600}
          step={10}
          value={priceRange}
          onValueChange={(v) => setPriceRange(v as [number, number])}
          className="mb-3"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>R$ {priceRange[0]}</span>
          <span>R$ {priceRange[1]}</span>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <h3 className="font-black uppercase tracking-widest text-[10px] mb-4 text-[#660e14]">Tamanhos</h3>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`w-10 h-10 rounded-xl border-2 text-xs font-black transition-all cursor-pointer ${
                selectedSizes.includes(size)
                  ? "border-[#ad2335] bg-[#ad2335] text-white shadow-lg shadow-[#ad2335]/20"
                  : "border-black/5 hover:border-[#ad2335] text-[#660e14]"
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="font-black uppercase tracking-widest text-[10px] mb-4 text-[#660e14]">Marcas</h3>
        <div className="space-y-2">
          {ALL_BRANDS.map((brand) => (
            <div key={brand} className="flex items-center gap-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
                className="data-[state=checked]:bg-[#ad2335] data-[state=checked]:border-[#ad2335] border-[#660e14]/20"
              />
              <label htmlFor={`brand-${brand}`} className="text-sm font-bold text-[#660e14]/60 cursor-pointer">
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="ghost" onClick={clearFilters} className="w-full text-[#ad2335] font-black uppercase tracking-widest text-[10px] hover:bg-[#ad2335]/5 cursor-pointer">
          <X className="h-4 w-4 mr-2" />
          Limpar ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdf0e3]">
      <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-[10px] font-black uppercase tracking-widest text-[#660e14]/40 mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-[#ad2335]">Início</Link>
        <span className="text-[#660e14]/20">/</span>
        <span className="text-[#660e14]">Catálogo</span>
        {activeCategory !== "Todos" && (
          <>
            <span className="text-[#660e14]/20">/</span>
            <span className="text-[#660e14]">{activeCategory}</span>
          </>
        )}
      </nav>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-6xl font-normal text-[#660e14] leading-[0.8] mb-2" style={{ fontFamily: "'Last Dream', cursive" }}>
          {isPromo ? "Promoções" : isNew ? "Novidades" : activeCategory !== "Todos" ? activeCategory : "Catálogo"}
        </h1>
        <p className="text-[#660e14]/40 text-xs font-black uppercase tracking-[0.3em]">{filtered.length} Peças Encontradas</p>
      </div>

      {/* Search + Controls */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar peças..."
            className="pl-9 bg-white/50 border-2 border-black/5 rounded-2xl text-[#660e14] placeholder:text-[#660e14]/30"
          />
        </div>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-44 bg-white/50 border-2 border-black/5 rounded-2xl text-[#660e14] font-black uppercase tracking-widest text-[10px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Mobile filters */}
        <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
          <SheetTrigger asChild>
            <Button variant="secondary" className="md:hidden cursor-pointer relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-[#ad2335] text-white border-0 font-black shadow-lg shadow-[#ad2335]/30">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FiltersPanel />
            </div>
          </SheetContent>
        </Sheet>

        {/* View toggle */}
        <div className="flex border-2 border-black/5 rounded-2xl overflow-hidden bg-white/50 backdrop-blur-sm shadow-sm">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-3 transition-all cursor-pointer ${viewMode === "grid" ? "bg-[#660e14] text-white" : "hover:bg-[#660e14]/5 text-[#660e14]"}`}
          >
            <Grid2X2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-3 transition-all cursor-pointer ${viewMode === "list" ? "bg-[#660e14] text-white" : "hover:bg-[#660e14]/5 text-[#660e14]"}`}
          >
            <LayoutList className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {activeCategory !== "Todos" && (
            <Badge className="gap-2 cursor-pointer bg-[#660e14]/10 text-[#660e14] hover:bg-[#660e14]/20 border-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider" onClick={() => setActiveCategory("Todos")}>
              {activeCategory} <X className="h-3 w-3" />
            </Badge>
          )}
          {selectedSizes.map((s) => (
            <Badge key={s} className="gap-2 cursor-pointer bg-[#660e14]/10 text-[#660e14] hover:bg-[#660e14]/20 border-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider" onClick={() => toggleSize(s)}>
              Nº {s} <X className="h-3 w-3" />
            </Badge>
          ))}
          {selectedBrands.map((b) => (
            <Badge key={b} className="gap-2 cursor-pointer bg-[#660e14]/10 text-[#660e14] hover:bg-[#660e14]/20 border-0 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider" onClick={() => toggleBrand(b)}>
              {b} <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar filters */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24 bg-white/40 backdrop-blur-md rounded-3xl border border-black/5 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-black uppercase tracking-[0.2em] text-xs text-[#660e14]">Filtros</h2>
              {activeFilterCount > 0 && (
                <Badge className="bg-[#ad2335] text-white border-0 text-[10px] font-black px-2 shadow-lg shadow-[#ad2335]/20">{activeFilterCount}</Badge>
              )}
            </div>
            <FiltersPanel />
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">{isPromo ? "✨" : "👟"}</p>
              <p className="text-xs text-[#660e14]/40 font-black uppercase tracking-widest">
                {isPromo ? "As promoções estão chegando!" : "Nenhuma peça encontrada"}
              </p>
              <p className="text-[#660e14]/30 text-[10px] mb-6 uppercase font-bold px-10">
                {isPromo ? "Estamos preparando ofertas exclusivas e descontos imperdíveis para você. Fique de olho em nossas redes!" : "Tente ajustar os filtros de busca para encontrar o que procura."}
              </p>
              <Button onClick={clearFilters} className="bg-[#ad2335] hover:bg-[#8b1c2b] text-white font-black uppercase tracking-widest text-xs px-8 h-12 rounded-2xl shadow-xl shadow-[#ad2335]/20">
                Limpar Tudo
              </Button>
            </div>
          ) : (
            <motion.div
              layout
              className={`grid gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              <AnimatePresence>
                {filtered.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    {viewMode === "grid" ? (
                      <ProductCard product={product} />
                    ) : (
                      <ProductListItem product={product} />
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}

function ProductListItem({ product }: { product: Product }) {
  const { toggle, has } = useWishlistStore();
  const { addItem } = useCartStore();
  const isWishlisted = has(product.id);

  return (
    <Link 
      to={`/produto/${product.id}`} 
      className="flex flex-col sm:flex-row gap-6 bg-white/40 backdrop-blur-md border border-black/5 rounded-[32px] p-6 hover:border-[#ad2335]/20 hover:shadow-xl transition-all group items-center"
    >
      <div className="relative w-full sm:w-40 h-40 rounded-2xl overflow-hidden bg-[#660e14]/5 shrink-0 border border-black/5">
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        {product.isNew && (
          <Badge className="absolute top-2 left-2 bg-[#660e14] text-white text-[8px] font-black uppercase border-0 px-2 py-0.5 shadow-lg">
            NOVO
          </Badge>
        )}
      </div>

      <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
        <p className="text-[10px] font-black text-[#ad2335] uppercase tracking-[0.3em]">{product.brand}</p>
        <h3 className="font-black text-[#660e14] text-xl leading-tight tracking-tighter">{product.name}</h3>
        <p className="text-xs text-[#660e14]/40 font-bold line-clamp-2 italic">"{product.description}"</p>
        <div className="flex items-center justify-center sm:justify-start gap-4 mt-2">
          <span className="font-black text-[#660e14] text-2xl tracking-tighter">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-sm text-[#660e14]/30 line-through font-bold">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>

      <div className="flex flex-row sm:flex-col gap-3 shrink-0 w-full sm:w-auto">
        <Button 
          size="sm" 
          className="flex-1 sm:flex-none bg-[#660e14] hover:bg-[#4d0a0f] text-white text-[10px] font-black uppercase tracking-widest h-12 px-8 rounded-2xl shadow-xl shadow-[#660e14]/20 cursor-pointer"
          onClick={(e) => { 
            e.preventDefault(); 
            addItem({ productId: product.id, name: product.name, price: product.price, image: product.images[0], size: product.sizes[0], color: product.colors?.[0] || null, quantity: 1 }); 
            toast.success("Adicionado ao carrinho!"); 
          }}
        >
          + Adicionar
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          className={cn(
            "flex-1 sm:flex-none h-12 px-5 rounded-2xl border-2 transition-all cursor-pointer font-black text-[10px] uppercase tracking-widest",
            isWishlisted 
              ? "bg-[#ad2335] border-[#ad2335] text-white shadow-lg shadow-[#ad2335]/20" 
              : "bg-white border-black/5 text-[#ad2335] hover:bg-[#ad2335]/5"
          )}
          onClick={(e) => { e.preventDefault(); toggle(product.id); }}
        >
          {isWishlisted ? "♥ Salvo" : "♡ Salvar"}
        </Button>
      </div>
    </Link>
  );
}
