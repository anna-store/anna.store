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
      {/* Categories */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Categorias</h3>
        <div className="space-y-1">
          {ALL_CATEGORIES_DYNAMIC.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer ${
                activeCategory === cat
                  ? "bg-[#ea3372] text-white font-medium"
                  : "hover:bg-muted text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Gender / Public */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Público</h3>
        <div className="flex flex-wrap gap-2">
          {ALL_GENDERS_DYNAMIC.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGender(g)}
              className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border ${
                activeGender === g
                  ? "bg-[#38b6ff] border-[#38b6ff] text-white shadow-lg shadow-[#38b6ff]/20"
                  : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Faixa de Preço</h3>
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
        <h3 className="font-semibold text-sm mb-3">Tamanhos</h3>
        <div className="flex flex-wrap gap-2">
          {ALL_SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleSize(size)}
              className={`w-10 h-10 rounded-lg border-2 text-xs font-medium transition-colors cursor-pointer ${
                selectedSizes.includes(size)
                  ? "border-[#ea3372] bg-[#ea3372] text-white"
                  : "border-border hover:border-[#ea3372] text-foreground"
                }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Marcas</h3>
        <div className="space-y-2">
          {ALL_BRANDS.map((brand) => (
            <div key={brand} className="flex items-center gap-2">
              <Checkbox
                id={`brand-${brand}`}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
                className="data-[state=checked]:bg-[#ea3372] data-[state=checked]:border-[#ea3372]"
              />
              <label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      {activeFilterCount > 0 && (
        <Button variant="ghost" onClick={clearFilters} className="w-full text-[#ea3372] cursor-pointer">
          <X className="h-4 w-4 mr-2" />
          Limpar filtros ({activeFilterCount})
        </Button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1">
        <Link to="/" className="hover:text-[#ea3372]">Início</Link>
        <span>/</span>
        <span className="text-foreground">Catálogo</span>
        {activeCategory !== "Todos" && (
          <>
            <span>/</span>
            <span className="text-foreground">{activeCategory}</span>
          </>
        )}
      </nav>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-black text-foreground mb-1">
          {isPromo ? "Promoções" : isNew ? "Novidades" : activeCategory !== "Todos" ? activeCategory : "Catálogo"}
        </h1>
        <p className="text-muted-foreground text-sm">{filtered.length} produtos encontrados</p>
      </div>

      {/* Search + Controls */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar produtos..."
            className="pl-9"
          />
        </div>

        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-44">
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
                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] bg-[#ea3372] border-0">
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
        <div className="flex border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 transition-colors cursor-pointer ${viewMode === "grid" ? "bg-[#ea3372] text-white" : "hover:bg-muted"}`}
          >
            <Grid2X2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 transition-colors cursor-pointer ${viewMode === "list" ? "bg-[#ea3372] text-white" : "hover:bg-muted"}`}
          >
            <LayoutList className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {activeCategory !== "Todos" && (
            <Badge variant="secondary" className="gap-1 cursor-pointer" onClick={() => setActiveCategory("Todos")}>
              {activeCategory} <X className="h-3 w-3" />
            </Badge>
          )}
          {selectedSizes.map((s) => (
            <Badge key={s} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleSize(s)}>
              Nº {s} <X className="h-3 w-3" />
            </Badge>
          ))}
          {selectedBrands.map((b) => (
            <Badge key={b} variant="secondary" className="gap-1 cursor-pointer" onClick={() => toggleBrand(b)}>
              {b} <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-8">
        {/* Desktop sidebar filters */}
        <aside className="hidden md:block w-56 shrink-0">
          <div className="sticky top-24 bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm">Filtros</h2>
              {activeFilterCount > 0 && (
                <Badge className="bg-[#ea3372] text-white border-0 text-xs">{activeFilterCount}</Badge>
              )}
            </div>
            <FiltersPanel />
          </div>
        </aside>

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">👟</p>
              <h3 className="text-lg font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground text-sm mb-4">Tente ajustar os filtros ou buscar por outro termo.</p>
              <Button onClick={clearFilters} className="bg-[#ea3372] hover:bg-[#c9295f] text-white cursor-pointer">
                Limpar filtros
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
  );
}

function ProductListItem({ product }: { product: Product }) {
  const { toggle, has } = useWishlistStore();
  const { addItem } = useCartStore();
  const isWishlisted = has(product.id);

  return (
    <Link to={`/produto/${product.id}`} className="flex gap-4 bg-card border border-border rounded-xl p-4 hover:border-[#ea3372]/40 hover:shadow-md transition-all group">
      <div className="relative w-28 h-28 rounded-lg overflow-hidden bg-muted shrink-0">
        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {product.isNew && <Badge className="absolute top-1 left-1 bg-[#38b6ff] text-white text-[9px] border-0 px-1">NOVO</Badge>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <h3 className="font-semibold text-sm">{product.name}</h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
        <div className="flex items-center gap-4 mt-2">
          <span className="font-bold text-foreground">{formatPrice(product.price)}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <Button size="sm" className="bg-[#ea3372] hover:bg-[#c9295f] text-white text-xs cursor-pointer"
          onClick={(e) => { e.preventDefault(); addItem({ productId: product.id, name: product.name, price: product.price, image: product.images[0], size: product.sizes[0], color: product.colors[0], quantity: 1 }); toast.success("Adicionado!"); }}>
          + Carrinho
        </Button>
        <Button size="sm" variant="secondary" className="text-xs cursor-pointer"
          onClick={(e) => { e.preventDefault(); toggle(product.id); }}>
          {isWishlisted ? "♥" : "♡"} Salvar
        </Button>
      </div>
    </Link>
  );
}
