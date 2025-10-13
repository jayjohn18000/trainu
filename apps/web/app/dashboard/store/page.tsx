"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";

// Placeholder product type until we integrate with real API
type AffiliateProduct = {
  id: string;
  title: string;
  brand: string;
  price: number;
  imageUrl: string;
  url: string;
  category: string;
};

// Mock data - replace with actual API call
const mockProducts: AffiliateProduct[] = [
  {
    id: "1",
    title: "Premium Protein Powder",
    brand: "OptimumNutrition",
    price: 59.99,
    imageUrl: "/placeholder.svg",
    url: "https://example.com",
    category: "Supplements",
  },
  {
    id: "2",
    title: "Resistance Bands Set",
    brand: "FitGear",
    price: 29.99,
    imageUrl: "/placeholder.svg",
    url: "https://example.com",
    category: "Equipment",
  },
  {
    id: "3",
    title: "Yoga Mat Pro",
    brand: "YogaEssentials",
    price: 39.99,
    imageUrl: "/placeholder.svg",
    url: "https://example.com",
    category: "Equipment",
  },
];

export default function StorePage() {
  const [products, setProducts] = useState<AffiliateProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 500);
  }, []);

  const handleProductClick = (product: AffiliateProduct) => {
    window.open(product.url, '_blank');
    toast.success("Opening product", {
      description: "Redirecting to store..."
    });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store</h1>
          <p className="text-muted-foreground">Shop our recommended products and gear</p>
        </div>
        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No products available"
          description="Check back soon for recommended products and gear"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-square bg-muted relative">
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="object-cover w-full h-full"
                />
                <Badge className="absolute top-2 right-2" variant="secondary">
                  {product.category}
                </Badge>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">{product.brand}</p>
                  <h3 className="font-semibold">{product.title}</h3>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-2xl font-bold">${product.price.toFixed(2)}</p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleProductClick(product)}
                    className="gap-2"
                  >
                    View <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <div className="text-center space-y-4">
          <h3 className="text-xl font-semibold">Affiliate Disclosure</h3>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Some products may include affiliate links. We only recommend products we believe in
            and that can help you achieve your fitness goals. Your support helps us continue
            providing great content and coaching.
          </p>
        </div>
      </Card>
    </div>
  );
}

