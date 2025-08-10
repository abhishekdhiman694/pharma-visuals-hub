import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import SiteHeader from "@/components/layout/SiteHeader";
import CategoryGrid from "@/components/CategoryGrid";
import ProductViewer from "@/components/ProductViewer";
import { categories, products } from "@/data/products";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(categories[0]?.id ?? null);

  const categoryProducts = useMemo(
    () => products.filter((p) => p.categoryId === activeCategory),
    [activeCategory]
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden">
          <div className="bg-hero">
            <div className="container mx-auto px-6 py-20">
              <div className="max-w-3xl animate-fade-in">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                  Pharma product visuals, made immersive
                </h1>
                <p className="text-lg text-muted-foreground mb-6">
                  Browse by category, open crisp visuals, and zoom to present clearly on tablets.
                </p>
                <div className="flex gap-3">
                  <Button variant="hero" size="lg" asChild>
                    <a href="#categories" aria-label="Explore categories">Explore categories</a>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href="/admin" aria-label="Open admin">Admin</a>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="categories" className="container mx-auto px-6 py-12">
          <header className="mb-6">
            <h2 className="text-2xl font-semibold">Categories</h2>
          </header>
          <CategoryGrid
            categories={categories}
            selectedId={activeCategory}
            onSelect={setActiveCategory}
          />
        </section>

        {activeCategory && (
          <section className="container mx-auto px-6 pb-20 animate-fade-in">
            <ProductViewer categoryId={activeCategory} products={categoryProducts} />
          </section>
        )}
      </main>
    </div>
  );
};

export default Index;
