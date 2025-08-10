export type Category = {
  id: string;
  name: string;
};

export type ProductImage = {
  src: string;
  alt: string;
};

export type Product = {
  id: string;
  name: string;
  categoryId: string;
  images: ProductImage[];
  description?: string;
};
