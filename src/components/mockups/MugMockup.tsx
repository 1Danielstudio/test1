import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check } from "lucide-react";
import { ProductVariant } from "@/services/printful";

interface MugMockupProps {
  image?: string;
  styleApplied?: boolean;
  view?: "front" | "back";
  position?: { x: number; y: number };
  rotation?: number;
  zoom?: number;
  variant?: ProductVariant | null;
  onViewChange?: (view: "front" | "back") => void;
}

const MugMockup = ({
  image = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
  styleApplied = true,
  view = "front",
  position = { x: 0, y: 0 },
  rotation = 0,
  zoom = 100,
  variant = null,
  onViewChange,
}: MugMockupProps) => {
  // Product mockup backgrounds
  const productBackgrounds = {
    front:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80",
    back: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=500&q=80",
  };

  const handleViewChange = (newView: "front" | "back") => {
    if (onViewChange) {
      onViewChange(newView);
    }
  };

  return (
    <Card className="w-full max-w-[500px] h-auto bg-background">
      <CardContent className="p-6">
        <div className="relative w-full h-[400px] bg-muted rounded-md overflow-hidden">
          {/* Product mockup background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${productBackgrounds[view]})`,
              backgroundSize: "cover",
            }}
          />

          {/* Design overlay with applied transformations */}
          {image && (
            <div
              className="absolute transform-gpu"
              style={{
                top: "50%",
                left: "50%",
                transform: `translate(-50%, -50%) rotate(${rotation}deg) scale(${zoom / 100})`,
                width: "30%",
                maxHeight: "30%",
                opacity: styleApplied ? 1 : 0.7,
                position: "relative",
              }}
            >
              <img
                src={image}
                alt="Mug design"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* View toggle buttons */}
          <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-md p-1">
            <Tabs
              defaultValue="front"
              value={view}
              onValueChange={(v) => handleViewChange(v as "front" | "back")}
            >
              <TabsList>
                <TabsTrigger value="front">Front</TabsTrigger>
                <TabsTrigger value="back">Back</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Status indicators */}
          <div className="absolute bottom-4 left-4 flex flex-col gap-2">
            {styleApplied && (
              <div className="bg-green-500/80 text-white px-2 py-1 rounded-md text-xs flex items-center gap-1">
                <Check size={12} />
                <span>Style Applied</span>
              </div>
            )}
          </div>

          {/* Variant indicator */}
          {variant && (
            <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm text-foreground px-2 py-1 rounded-md text-xs">
              {variant.name}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MugMockup;
