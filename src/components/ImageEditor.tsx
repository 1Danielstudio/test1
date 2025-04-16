import React, { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Crop, ZoomIn, Move, RotateCw, Check, X } from "lucide-react";

interface ImageEditorProps {
  image: string;
  onSave: (editedImage: string) => void;
  onCancel: () => void;
}

const ImageEditor = ({ image, onSave, onCancel }: ImageEditorProps) => {
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [cropMode, setCropMode] = useState(false);
  const [activeTab, setActiveTab] = useState("transform");

  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };

  const handleRotationChange = (value: number[]) => {
    setRotation(value[0]);
  };

  const handlePositionChange = (axis: "x" | "y", value: number[]) => {
    setPosition((prev) => ({
      ...prev,
      [axis]: value[0],
    }));
  };

  const handleSave = () => {
    // In a real implementation, we would:
    // 1. Create a canvas
    // 2. Draw the image with applied transformations
    // 3. Export as base64 or blob
    // 4. Pass to onSave

    // For now, we'll just pass back the original image
    onSave(image);
  };

  return (
    <Card className="w-full bg-background">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6">
          <h2 className="text-xl font-semibold">Edit Image</h2>

          {/* Image preview with transformations */}
          <div className="relative w-full h-[400px] bg-muted rounded-md overflow-hidden">
            <div
              ref={containerRef}
              className="absolute inset-0 flex items-center justify-center overflow-hidden"
            >
              {image && (
                <img
                  ref={imageRef}
                  src={image}
                  alt="Editing"
                  className="max-w-full max-h-full object-contain"
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom / 100})`,
                  }}
                />
              )}
            </div>

            {/* Crop overlay removed */}
          </div>

          {/* Controls */}
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger
                value="transform"
                className="flex items-center gap-2"
              >
                <Move size={16} />
                Transform
              </TabsTrigger>
              <TabsTrigger value="crop" className="flex items-center gap-2">
                <Crop size={16} />
                Crop
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transform" className="space-y-4 pt-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <ZoomIn size={16} />
                  <Label>Zoom</Label>
                </div>
                <Slider
                  defaultValue={[100]}
                  min={50}
                  max={200}
                  step={1}
                  value={[zoom]}
                  onValueChange={handleZoomChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <RotateCw size={16} />
                  <Label>Rotation</Label>
                </div>
                <Slider
                  defaultValue={[0]}
                  min={-180}
                  max={180}
                  step={1}
                  value={[rotation]}
                  onValueChange={handleRotationChange}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Move size={16} />
                  <Label>Horizontal Position</Label>
                </div>
                <Slider
                  defaultValue={[0]}
                  min={-100}
                  max={100}
                  step={1}
                  value={[position.x]}
                  onValueChange={(value) => handlePositionChange("x", value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Move size={16} className="rotate-90" />
                  <Label>Vertical Position</Label>
                </div>
                <Slider
                  defaultValue={[0]}
                  min={-100}
                  max={100}
                  step={1}
                  value={[position.y]}
                  onValueChange={(value) => handlePositionChange("y", value)}
                />
              </div>
            </TabsContent>

            <TabsContent value="crop" className="pt-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Crop functionality is currently disabled.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Action buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Check size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ImageEditor;
