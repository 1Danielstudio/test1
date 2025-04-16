import React, { useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Upload,
  Sparkles,
  Loader2,
  Wand2,
  Edit,
  Check,
  ThumbsUp,
  ImageIcon,
} from "lucide-react";
import StyleSelector from "./StyleSelector";
import ProductPreview from "./ProductPreview";
import ImageEditor from "./ImageEditor";
import MockupGrid from "./MockupGrid";

interface ImageCreatorProps {
  onImageCreated?: (imageUrl: string) => void;
  onStyleSelected?: (style: any) => void;
}

const ImageCreator = ({
  onImageCreated = () => {},
  onStyleSelected = () => {},
}: ImageCreatorProps) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<any | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [imageToEdit, setImageToEdit] = useState<string | null>(null);
  const [approvedImage, setApprovedImage] = useState<string | null>(null);
  const [showMockups, setShowMockups] = useState(false);
  const [styleApplied, setStyleApplied] = useState(false);

  const handleFileUpload = (file: File) => {
    try {
      // Create an image element to get dimensions
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        if (e.target?.result) {
          const imageUrl = e.target.result as string;

          // Set the image source and wait for it to load
          img.onload = () => {
            // Now we have access to img.width and img.height
            console.log(`Image dimensions: ${img.width}x${img.height}`);
            setUploadedImage(imageUrl);
            onImageCreated(imageUrl);
          };

          img.onerror = () => {
            console.error("Error loading image");
          };

          img.src = imageUrl;
        }
      };

      reader.onerror = (error) => {
        console.error("Error reading file:", error);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    try {
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        // Check if file is an image
        if (!file.type.startsWith("image/")) {
          console.error("File is not an image");
          return;
        }
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
          console.error("File is too large");
          return;
        }
        handleFileUpload(file);
      }
    } catch (error) {
      console.error("Error handling dropped file:", error);
    }
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        // Check if file is an image
        if (!file.type.startsWith("image/")) {
          console.error("File is not an image");
          return;
        }
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
          console.error("File is too large");
          return;
        }
        handleFileUpload(file);
      }
    } catch (error) {
      console.error("Error handling file input:", error);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      // In a real implementation, this would call an API like DALL-E, Replicate, or Ideogram
      // For now, we'll simulate the API call with a timeout

      // Simulate API response
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Different placeholder images based on selected style
      let mockGeneratedImage = `https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80`;

      if (selectedStyle) {
        // Use different placeholder images based on style category
        if (selectedStyle.id === "ghibli") {
          mockGeneratedImage =
            "https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80";
        } else if (selectedStyle.id === "cubist") {
          mockGeneratedImage =
            "https://images.unsplash.com/photo-1618331833071-ce81bd50d300?w=800&q=80";
        } else if (selectedStyle.id === "minimalist") {
          mockGeneratedImage =
            "https://images.unsplash.com/photo-1552083974-186346191183?w=800&q=80";
        }
      }

      setGeneratedImage(mockGeneratedImage);
      onImageCreated(mockGeneratedImage);
    } catch (error) {
      console.error("Error generating image:", error);
      // Handle error - show error message to user
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStyleSelect = (style: any) => {
    setSelectedStyle(style);
    onStyleSelected(style);
    setStyleApplied(false);
  };

  const currentImage = uploadedImage || generatedImage;

  const handleEditImage = () => {
    if (currentImage) {
      setImageToEdit(currentImage);
      setIsEditing(true);
    }
  };

  const handleSaveEdit = (editedImage: string) => {
    if (uploadedImage) {
      setUploadedImage(editedImage);
    } else {
      setGeneratedImage(editedImage);
    }
    setIsEditing(false);
    setImageToEdit(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setImageToEdit(null);
  };

  if (isEditing && imageToEdit) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 bg-background">
        <ImageEditor
          image={imageToEdit}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Column - Image Input */}
        <div className="md:col-span-7 space-y-6">
          <h2 className="text-2xl font-medium text-gray-800">
            Create Your Design
          </h2>

          {/* Image Display Area */}
          {currentImage ? (
            <div className="relative w-full aspect-square max-h-[500px] overflow-hidden rounded-lg border border-gray-100 shadow-sm">
              <img
                src={currentImage}
                alt="Current"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-3 right-3">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleEditImage}
                  className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
                >
                  <Edit size={14} className="mr-1" /> Edit
                </Button>
              </div>
            </div>
          ) : (
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div
                  className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${isDragging ? "border-primary bg-primary/5" : "border-gray-200"}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-4 bg-gray-50 rounded-full">
                      <Upload size={32} className="text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-800">
                        Drag and drop your image here
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        or click to browse files
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(
                            "file-upload",
                          ) as HTMLInputElement;
                          if (input) {
                            input.value = "";
                            input.click();
                          }
                        }}
                        className="border-gray-200 text-gray-700"
                      >
                        <ImageIcon size={14} className="mr-1" /> Browse Files
                      </Button>
                      <Input
                        id="file-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileInputChange}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Text Prompt Area */}
          <div className="space-y-3">
            <Label htmlFor="prompt" className="text-gray-700">
              Or generate an image with AI
            </Label>
            <div className="flex gap-2">
              <Textarea
                id="prompt"
                placeholder={
                  selectedStyle
                    ? `A family portrait in ${selectedStyle.name} style...`
                    : "A serene mountain landscape with a lake at sunset..."
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                className="resize-none border-gray-200"
              />
              <Button
                onClick={handleGenerateImage}
                disabled={!prompt.trim() || isGenerating}
                className="shrink-0"
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} className="mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
            {selectedStyle && (
              <p className="text-xs text-gray-500">
                Using style:{" "}
                <span className="font-medium">{selectedStyle.name}</span>
                {selectedStyle.description && (
                  <> - {selectedStyle.description}</>
                )}
              </p>
            )}
          </div>
        </div>

        {/* Right Column - Styles & Preview */}
        <div className="md:col-span-5 space-y-6">
          <h2 className="text-2xl font-medium text-gray-800">Choose a Style</h2>

          {/* Style selector is always visible */}
          <StyleSelector
            onStyleSelect={handleStyleSelect}
            selectedStyleId={selectedStyle?.id || ""}
          />

          {selectedStyle && currentImage && (
            <div className="mt-6">
              <Button
                onClick={() => {
                  handleGenerateImage();
                  setStyleApplied(true);
                }}
                className="w-full"
                variant="outline"
              >
                <Wand2 size={16} className="mr-2" />
                Apply {selectedStyle.name} Style
              </Button>
            </div>
          )}

          {currentImage && styleApplied && (
            <div className="space-y-4 mt-6">
              {!approvedImage ? (
                <div className="space-y-4">
                  <ProductPreview
                    image={currentImage}
                    styleApplied={true}
                    onEdit={handleEditImage}
                  />
                  <Button
                    onClick={() => {
                      setApprovedImage(currentImage);
                      setShowMockups(true);
                    }}
                    className="w-full"
                    variant="default"
                  >
                    <ThumbsUp size={16} className="mr-2" />
                    View on Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-md p-4 flex items-center gap-2 text-green-700">
                    <Check size={16} />
                    <span>
                      Design approved! View on products or make changes.
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        setApprovedImage(null);
                        setShowMockups(false);
                      }}
                      variant="outline"
                      className="flex-1"
                    >
                      Make Changes
                    </Button>
                    <Button
                      onClick={() => setShowMockups(!showMockups)}
                      variant={showMockups ? "outline" : "default"}
                      className="flex-1"
                    >
                      {showMockups ? "Hide Products" : "View Products"}
                    </Button>
                  </div>
                  {!showMockups && (
                    <ProductPreview
                      image={approvedImage}
                      styleApplied={true}
                      onEdit={handleEditImage}
                    />
                  )}
                </div>
              )}

              {showMockups && approvedImage && (
                <MockupGrid image={approvedImage} styleApplied={true} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageCreator;
