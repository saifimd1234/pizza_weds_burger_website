/** Gallery images — swap these URLs for your own shots. */
export type GalleryImage = {
  src: string;
  alt: string;
  /** tailwind span classes to build a mosaic layout */
  span?: string;
};

export const gallery: GalleryImage[] = [
  {
    src: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=80",
    alt: "Fresh-baked supreme pizza on a wooden board",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80",
    alt: "Juicy double smash burger",
  },
  {
    src: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
    alt: "Loaded cheese fries",
  },
  {
    src: "https://images.unsplash.com/photo-1593504049359-74330189a345?auto=format&fit=crop&w=800&q=80",
    alt: "Chef sliding a pizza into a wood-fired oven",
    span: "md:row-span-2",
  },
  {
    src: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=800&q=80",
    alt: "Crispy peri-peri chicken burger",
  },
  {
    src: "https://images.unsplash.com/photo-1571066811602-716837d681de?auto=format&fit=crop&w=800&q=80",
    alt: "Pepperoni pizza close-up",
  },
  {
    src: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80",
    alt: "Thick milkshake with whipped cream",
  },
];
