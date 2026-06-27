import type { Metadata, Viewport } from "next";
import { Anton, Inter, Caveat } from "next/font/google";
import "./globals.css";
import { restaurant, fullAddress } from "@/data/restaurant";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://pizzawedsburger.vercel.app"),
  title: {
    default: `${restaurant.name} — ${restaurant.tagline}`,
    template: `%s · ${restaurant.name}`,
  },
  description: restaurant.subtagline,
  keywords: [
    "pizza",
    "burger",
    "restaurant",
    "wood-fired pizza",
    "smash burger",
    restaurant.address.city,
    "order online",
    "table booking",
  ],
  openGraph: {
    title: `${restaurant.name} — ${restaurant.tagline}`,
    description: restaurant.subtagline,
    type: "website",
    locale: "en_IN",
    siteName: restaurant.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${restaurant.name} — ${restaurant.tagline}`,
    description: restaurant.subtagline,
  },
  icons: {
    icon: [
      {
        url:
          "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🍕</text></svg>",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#120c0a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: restaurant.name,
    description: restaurant.subtagline,
    servesCuisine: ["Pizza", "Burgers", "Fast Food"],
    telephone: `+${restaurant.phone}`,
    email: restaurant.email,
    priceRange: "₹₹",
    address: {
      "@type": "PostalAddress",
      streetAddress: `${restaurant.address.line1}, ${restaurant.address.line2}`,
      addressLocality: restaurant.address.city,
      addressRegion: restaurant.address.state,
      postalCode: restaurant.address.pincode,
      addressCountry: "IN",
    },
  };

  return (
    <html
      lang="en"
      className={`${anton.variable} ${inter.variable} ${caveat.variable}`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
