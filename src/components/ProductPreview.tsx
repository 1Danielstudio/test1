import React from "react";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";

interface ProductPreviewProps {
  image?: string;
  productType?: "tshirt" | "mug" | "poster" | "hoodie";
  styleApplied?: boolean;
  onEdit?: () => void;
}

const ProductPreview = ({
  image = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
  productType = "tshirt",
  styleApplied = true,
  onEdit = () => {},
}: ProductPreviewProps) => {
  return (
    <div className="w-full max-w-[500px] mx-auto">
      <div className="relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden">
        {/* Simple grid background */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 0, 0, 0.02) 1px, transparent 1px)`,
            backgroundSize: `20px 20px`,
          }}
        />

        {/* Design image centered */}
        {image && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <img
              src={image}
              alt="Product design"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        )}

        {/* Edit button overlay */}
        <div className="absolute top-3 right-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={onEdit}
            className="bg-white/80 hover:bg-white shadow-sm"
          >
            <Pencil size={14} className="mr-1" />
            Edit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductPreview;
