import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Rotate3D, ZoomIn, Move, Check, Pencil, Save } from "lucide-react";
import TShirtMockup from "./mockups/TShirtMockup";
import MugMockup from "./mockups/MugMockup";
import PosterMockup from "./mockups/PosterMockup";
import HoodieMockup from "./mockups/HoodieMockup";
import { ProductVariant } from "@/services/printful";

interface PrintfulMockupCreatorProps {
  image?: string;
  onSave?: (data: MockupData) => void;
  onEdit?: () => void;
  initialProductType?: ProductType;
  initialStyle?: string;
}

export type ProductType = "tshirt" | "mug" | "poster" | "hoodie";

export interface MockupData {
  productType: ProductType;
  view: "front" | "back";
  position: { x: number; y: number };
  rotation: number;
  zoom: number;
  variant: ProductVariant | null;
  styleApplied: boolean;
}

const PrintfulMockupCreator = ({
  image = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
  onSave = () => {},
  onEdit = () => {},
  initialProductType = "tshirt",
  initialStyle = "",
}: PrintfulMockupCreatorProps) => {
  // State for mockup configuration
  const [productType, setProductType] =
    useState<ProductType>(initialProductType);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [view, setView] = useState<"front" | "back">("front");
  const [styleApplied, setStyleApplied] = useState(!!initialStyle);
  const [variant, setVariant] = useState<ProductVariant | null>(null);

  // Sample variants for demonstration
  const variants: Record<ProductType, ProductVariant[]> = {
    tshirt: [
      { id: "1", name: "Unisex Cotton T-shirt", color: "White" },
      { id: "2", name: "Premium T-shirt", color: "Black" },
      { id: "3", name: "Unisex Tri-Blend T-shirt", color: "Navy" },
    ],
    mug: [
      { id: "4", name: "White Glossy Mug", color: "White" },
      { id: "5", name: "White Ceramic Mug", color: "White" },
      { id: "6", name: "Black Magic Mug", color: "Black" },
    ],
    poster: [
      { id: "7", name: "Enhanced Matte Paper Poster", color: "White" },
      { id: "8", name: "Premium Luster Photo Paper Poster", color: "White" },
      { id: "9", name: "Canvas Print", color: "White" },
    ],
    hoodie: [
      { id: "10", name: "Unisex Heavy Blend Hoodie", color: "Black" },
      { id: "11", name: "Premium Eco Hoodie", color: "Navy" },
      { id: "12", name: "Unisex Lightweight Zip Hoodie", color: "Gray" },
    ],
  };

  // Handle rotation change
  const handleRotationChange = (value: number[]) => {
    setRotation(value[0]);
  };

  // Handle zoom change
  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };

  // Handle position change
  const handlePositionChange = (axis: "x" | "y", value: number[]) => {
    setPosition((prev) => ({
      ...prev,
      [axis]: value[0],
    }));
  };

  // Handle product type change
  const handleProductTypeChange = (value: string) => {
    setProductType(value as ProductType);
    setVariant(null); // Reset variant when product type changes
  };

  // Handle variant change
  const handleVariantChange = (value: string) => {
    const selectedVariant =
      variants[productType].find((v) => v.id === value) || null;
    setVariant(selectedVariant);
  };

  // Handle view change
  const handleViewChange = (newView: "front" | "back") => {
    setView(newView);
  };

  // Handle save
  const handleSave = () => {
    onSave({
      productType,
      view,
      position,
      rotation,
      zoom,
      variant,
      styleApplied,
    });
  };

  // Render the appropriate mockup based on product type
  const renderMockup = () => {
    const mockupProps = {
      image,
      styleApplied,
      view,
      position,
      rotation,
      zoom,
      variant,
      onViewChange: handleViewChange,
    };

    switch (productType) {
      case "tshirt":
        return <TShirtMockup {...mockupProps} />;
      case "mug":
        return <MugMockup {...mockupProps} />;
      case "poster":
        return <PosterMockup {...mockupProps} />;
      case "hoodie":
        return (
          <HoodieMockup
            imageUrl={image}
            appliedStyle={styleApplied ? initialStyle : ""}
          />
        );
      default:
        return <TShirtMockup {...mockupProps} />;
    }
  };

  return (
    <Card className="w-full max-w-[800px] h-auto bg-background">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          {/* Product Type Selector */}
          <div className="flex gap-4">
            <div className="w-1/2">
              <Label htmlFor="product-type">Product Type</Label>
              <Select
                value={productType}
                onValueChange={handleProductTypeChange}
              >
                <SelectTrigger id="product-type">
                  <SelectValue placeholder="Select product type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tshirt">T-Shirt</SelectItem>
                  <SelectItem value="mug">Mug</SelectItem>
                  <SelectItem value="poster">Poster</SelectItem>
                  <SelectItem value="hoodie">Hoodie</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-1/2">
              <Label htmlFor="variant">Variant</Label>
              <Select
                value={variant?.id || ""}
                onValueChange={handleVariantChange}
              >
                <SelectTrigger id="variant">
                  <SelectValue placeholder="Select variant" />
                </SelectTrigger>
                <SelectContent>
                  {variants[productType].map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} - {v.color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mockup Preview */}
          <div className="w-full">{renderMockup()}</div>

          {/* Controls for positioning, rotation, and zoom */}
          <div className="space-y-4 bg-gray-50 p-4 rounded-md">
            <div className="space-y-2">
              <div className="flex items-center">
                <Move className="w-4 h-4 mr-2" />
                <Label className="text-sm">Position X</Label>
              </div>
              <Slider
                value={[position.x]}
                onValueChange={(value) => handlePositionChange("x", value)}
                min={-50}
                max={50}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Move className="w-4 h-4 mr-2" />
                <Label className="text-sm">Position Y</Label>
              </div>
              <Slider
                value={[position.y]}
                onValueChange={(value) => handlePositionChange("y", value)}
                min={-50}
                max={50}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <Rotate3D className="w-4 h-4 mr-2" />
                <Label className="text-sm">Rotation</Label>
              </div>
              <Slider
                value={[rotation]}
                onValueChange={handleRotationChange}
                min={-180}
                max={180}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <ZoomIn className="w-4 h-4 mr-2" />
                <Label className="text-sm">Zoom</Label>
              </div>
              <Slider
                value={[zoom]}
                onValueChange={handleZoomChange}
                min={50}
                max={150}
                step={1}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onEdit}>
              <Pencil size={16} className="mr-2" />
              Edit Image
            </Button>
            <Button onClick={handleSave}>
              <Save size={16} className="mr-2" />
              Save Mockup
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrintfulMockupCreator;
