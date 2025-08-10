import { FC, useMemo, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProductZoomDialog from "@/components/ProductZoomDialog";
import type { Product } from "@/types";

type Props = {
  categoryId: string;
  products: Product[];
};

const ProductViewer: FC<Props> = ({ categoryId, products }) => {
  const [selectedId, setSelectedId] = useState<string | null>(products[0]?.id ?? null);
  const selected = useMemo(() => products.find((p) => p.id === selectedId) ?? products[0], [products, selectedId]);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [zoomAlt, setZoomAlt] = useState<string>("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end gap-4">
        <div className="md:w-80">
          <label className="text-sm text-muted-foreground block mb-2">Select product</label>
          <Select value={selected?.id} onValueChange={(v) => setSelectedId(v)}>
            <SelectTrigger aria-label="Select product">
              <SelectValue placeholder="Choose product" />
            </SelectTrigger>
            <SelectContent>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {selected?.description && (
          <p className="text-sm text-muted-foreground max-w-prose">{selected.description}</p>
        )}
      </div>

      {selected && (
        <Card className="p-4 relative">
          <Carousel className="w-full">
            <CarouselContent>
              {selected.images.map((img, idx) => (
                <CarouselItem key={idx} className="md:basis-1/2 lg:basis-1/3">
                  <button
                    onClick={() => {
                      setZoomSrc(img.src);
                      setZoomAlt(img.alt);
                    }}
                    className="block w-full overflow-hidden rounded-md hover-scale focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <img src={img.src} alt={img.alt} className="w-full h-56 object-cover" loading="lazy" />
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:inline-flex" />
            <CarouselNext className="hidden md:inline-flex" />
          </Carousel>
        </Card>
      )}

      <div className="flex gap-3">
        <Button variant="outline" asChild>
          <a href="#categories">Change category</a>
        </Button>
      </div>

      <ProductZoomDialog
        open={!!zoomSrc}
        onOpenChange={(o) => !o && setZoomSrc(null)}
        src={zoomSrc ?? ""}
        alt={zoomAlt}
      />
    </div>
  );
};

export default ProductViewer;
