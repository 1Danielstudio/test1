import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RotateCw, ZoomIn, Move } from "lucide-react";

interface HoodieMockupProps {
  imageUrl?: string;
  appliedStyle?: string;
}

export default function HoodieMockup({
  imageUrl = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
  appliedStyle = "",
}: HoodieMockupProps) {
  const [view, setView] = useState<"front" | "back">("front");
  const [position, setPosition] = useState<[number]>([50]);
  const [rotation, setRotation] = useState<[number]>([0]);
  const [zoom, setZoom] = useState<[number]>([50]);

  // Calculate transformation values based on sliders
  const translateY = ((position[0] - 50) / 50) * 30; // -30% to +30%
  const rotationDeg = ((rotation[0] - 50) / 50) * 20; // -20deg to +20deg
  const zoomScale = 0.8 + (zoom[0] / 100) * 0.4; // 0.8 to 1.2 scale

  return (
    <div className="flex flex-col w-full h-full bg-white rounded-lg overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h3 className="text-lg font-medium">Hoodie Preview</h3>
      </div>

      <Tabs defaultValue="front" className="flex-1 flex flex-col">
        <div className="px-4 pt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="front" onClick={() => setView("front")}>
              Front
            </TabsTrigger>
            <TabsTrigger value="back" onClick={() => setView("back")}>
              Back
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 relative overflow-hidden bg-gray-50 flex items-center justify-center">
          <div className="relative">
            {/* Hoodie mockup base image */}
            <img
              src={
                view === "front"
                  ? "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80"
                  : "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80"
              }
              alt="Hoodie mockup"
              className="max-h-[400px] w-auto"
            />

            {/* User's design with applied transformations */}
            {imageUrl && (
              <div
                className="absolute top-0 left-0 w-full h-full flex items-center justify-center"
                style={{
                  perspective: "1000px",
                }}
              >
                <div
                  className="w-[35%] h-[35%] absolute"
                  style={{
                    top: "30%",
                    left: "50%",
                    transform: `translate(-50%, 0%) rotateZ(${rotationDeg}deg) scale(${zoomScale})`,
                    transformOrigin: "center center",
                  }}
                >
                  <img
                    src={imageUrl}
                    alt="User design"
                    className="w-full h-full object-contain"
                    style={{
                      filter: appliedStyle
                        ? `${getStyleFilter(appliedStyle)}`
                        : "none",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls for positioning, rotation, and zoom */}
        <div className="p-4 border-t bg-gray-50">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center">
                <Move className="w-4 h-4 mr-2" />
                <Label className="text-sm">Position</Label>
              </div>
              <Slider
                value={position}
                onValueChange={setPosition as any}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <RotateCw className="w-4 h-4 mr-2" />
                <Label className="text-sm">Rotation</Label>
              </div>
              <Slider
                value={rotation}
                onValueChange={setRotation as any}
                max={100}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <ZoomIn className="w-4 h-4 mr-2" />
                <Label className="text-sm">Zoom</Label>
              </div>
              <Slider
                value={zoom}
                onValueChange={setZoom as any}
                max={100}
                step={1}
              />
            </div>
          </div>
        </div>
      </Tabs>

      {appliedStyle && (
        <div className="p-2 bg-blue-50 text-blue-700 text-xs text-center">
          {appliedStyle} style applied
        </div>
      )}
    </div>
  );
}

// Helper function to get CSS filter based on style name
function getStyleFilter(style: string): string {
  const filters = {
    Ghibli: "saturate(1.2) brightness(1.1) contrast(0.9)",
    "Tim Burton": "saturate(0.6) contrast(1.4) brightness(0.8)",
    Watercolor: "saturate(0.8) brightness(1.05) contrast(0.9) opacity(0.9)",
    Neon: "saturate(1.6) brightness(1.2) contrast(1.2) hue-rotate(5deg)",
    Vintage: "sepia(0.4) saturate(0.8) brightness(0.9)",
    Comic: "saturate(1.4) contrast(1.3) brightness(1.1)",
    Minimalist: "saturate(0.7) contrast(1.1) brightness(1.05)",
    Cyberpunk: "saturate(1.5) contrast(1.3) brightness(1.1) hue-rotate(-5deg)",
  };

  return filters[style as keyof typeof filters] || "";
}
