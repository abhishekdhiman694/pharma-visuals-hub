import { FC, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  alt: string;
};

const ProductZoomDialog: FC<Props> = ({ open, onOpenChange, src, alt }) => {
  const [zoomed, setZoomed] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-2 sm:p-4 bg-background/95">
        <div className="relative">
          <img
            ref={imgRef}
            src={src}
            alt={alt}
            className={`w-full h-auto rounded-md select-none ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`}
            onClick={() => setZoomed((z) => !z)}
            style={{ transform: zoomed ? "scale(1.5)" : "scale(1)", transition: "transform 200ms ease" }}
          />
          <p className="sr-only">{alt}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductZoomDialog;
