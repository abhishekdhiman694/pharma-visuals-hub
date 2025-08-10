import heroImage from "@/assets/hero-medical.jpg";
import blisterImg from "@/assets/product-blister.webp";
import bottleImg from "@/assets/product-bottle.webp";
import syrupImg from "@/assets/product-syrup.webp";
import vialImg from "@/assets/product-vial.webp";
import type { Category, Product } from "@/types";

export const categories: Category[] = [
  { id: "ortho", name: "Ortho" },
  { id: "gyne", name: "Gyne" },
  { id: "cardio", name: "Cardio" },
  { id: "neuro", name: "Neuro" },
];

export const hero = heroImage;

export const products: Product[] = [
  {
    id: "calci-flex",
    name: "CalciFlex Tabs",
    categoryId: "ortho",
    images: [
      { src: blisterImg, alt: "CalciFlex blister pack" },
      { src: bottleImg, alt: "CalciFlex bottle" },
    ],
    description: "Calcium + D3 supplement for bone health.",
  },
  {
    id: "fem-care",
    name: "FemCare Syrup",
    categoryId: "gyne",
    images: [
      { src: syrupImg, alt: "FemCare syrup bottle" },
    ],
    description: "Women's wellness tonic.",
  },
  {
    id: "cardio-safe",
    name: "CardioSafe Vial",
    categoryId: "cardio",
    images: [
      { src: vialImg, alt: "CardioSafe injection vial" },
    ],
    description: "Cardiovascular support injection.",
  },
  {
    id: "neuro-plus",
    name: "NeuroPlus Tabs",
    categoryId: "neuro",
    images: [
      { src: blisterImg, alt: "NeuroPlus blister pack" },
    ],
    description: "B-complex for neurological support.",
  },
];
