import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Rotate3D,
  ZoomIn,
  Move,
  Save,
  Upload,
  Sparkles,
  Loader2,
  Info,
  Check,
  AlertCircle,
  ShoppingBag,
  Trash2,
  Undo,
  Redo,
  Download,
  Share2,
  Pencil,
  Eye,
  EyeOff,
  Layers,
  Image as ImageIcon,
} from "lucide-react";
import * as printfulApi from "@/services/printfulApi";

interface PrintfulDesignStudioProps {
  initialImage?: string;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

const PrintfulDesignStudio: React.FC<PrintfulDesignStudioProps> = ({
  initialImage,
  onSave = () => {},
  onCancel = () => {},
}) => {
  // State for product selection
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [productDetails, setProductDetails] = useState<any | null>(null);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [variantDetails, setVariantDetails] = useState<any | null>(null);
  const [printAreas, setPrintAreas] = useState<any[]>([]);
  const [selectedPrintArea, setSelectedPrintArea] = useState<string | null>(
    null,
  );

  // State for design
  const [designImage, setDesignImage] = useState<string | null>(
    initialImage || null,
  );
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [scale, setScale] = useState(100);
  const [isGeneratingMockup, setIsGeneratingMockup] = useState(false);
  const [mockupProgress, setMockupProgress] = useState(0);
  const [mockupImages, setMockupImages] = useState<string[]>([]);
  const [activeView, setActiveView] = useState("front");
  const [showGuides, setShowGuides] = useState(true);
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyStatus, setApiKeyStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const canvasRef = useRef<HTMLDivElement>(null);
  const designRef = useRef<HTMLImageElement>(null);

  // Load API key on mount
  useEffect(() => {
    const loadApiKey = async () => {
      // Skip API key check since it's already provided
      loadCategories();
    };

    loadApiKey();
  }, []);

  // Load categories
  const loadCategories = async () => {
    try {
      const categoriesData = await printfulApi.getProductCategories();
      setCategories(categoriesData);
      if (categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].id);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
      setErrorMessage(
        "Failed to load product categories. Please check your API key.",
      );
    }
  };

  // Load products when category changes
  useEffect(() => {
    if (selectedCategory) {
      const loadProducts = async () => {
        try {
          const productsData =
            await printfulApi.getProductsInCategory(selectedCategory);
          setProducts(productsData);
          if (productsData.length > 0) {
            setSelectedProduct(productsData[0].id);
          }
        } catch (error) {
          console.error("Error loading products:", error);
          setErrorMessage("Failed to load products in this category.");
        }
      };

      loadProducts();
    }
  }, [selectedCategory]);

  // Load product details when product changes
  useEffect(() => {
    if (selectedProduct) {
      const loadProductDetails = async () => {
        try {
          const details = await printfulApi.getProductDetails(selectedProduct);
          setProductDetails(details);

          // Load variants
          const variantsData =
            await printfulApi.getProductVariants(selectedProduct);
          setVariants(variantsData);
          if (variantsData.length > 0) {
            setSelectedVariant(variantsData[0].id);
          }
        } catch (error) {
          console.error("Error loading product details:", error);
          setErrorMessage("Failed to load product details.");
        }
      };

      loadProductDetails();
    }
  }, [selectedProduct]);

  // Load variant details when variant changes
  useEffect(() => {
    if (selectedVariant) {
      const loadVariantDetails = async () => {
        try {
          const details = await printfulApi.getVariantDetails(selectedVariant);
          setVariantDetails(details);

          // Load mockup generation parameters
          const params =
            await printfulApi.getMockupGenerationParameters(selectedVariant);
          setPrintAreas(params.print_areas || []);
          if (params.print_areas && params.print_areas.length > 0) {
            setSelectedPrintArea(params.print_areas[0].placement);
          }
        } catch (error) {
          console.error("Error loading variant details:", error);
          setErrorMessage("Failed to load variant details.");
        }
      };

      loadVariantDetails();
    }
  }, [selectedVariant]);

  // Handle API key submission - simplified since key is already provided
  const handleApiKeySubmit = async () => {
    setApiKeyStatus("success");
    setApiKeyDialogOpen(false);
    loadCategories();
  };

  // Handle file upload
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];

      try {
        // Upload to Printful
        const fileData = await printfulApi.createPrintFile(file);
        setUploadedFiles([...uploadedFiles, fileData]);

        // Set as current design
        setDesignImage(fileData.preview_url);
      } catch (error) {
        console.error("Error uploading file:", error);
        setErrorMessage("Failed to upload file to Printful");
      }
    }
  };

  // Handle position change
  const handlePositionChange = (axis: "x" | "y", value: number[]) => {
    setPosition((prev) => ({
      ...prev,
      [axis]: value[0],
    }));
  };

  // Handle rotation change
  const handleRotationChange = (value: number[]) => {
    setRotation(value[0]);
  };

  // Handle scale change
  const handleScaleChange = (value: number[]) => {
    setScale(value[0]);
  };

  // Generate mockup
  const generateMockup = async () => {
    if (!selectedVariant || !designImage || !selectedPrintArea) {
      setErrorMessage(
        "Please select a variant, upload a design, and select a print area",
      );
      return;
    }

    setIsGeneratingMockup(true);
    setMockupProgress(10);

    try {
      // Find the uploaded file that matches the design image
      const designFile = uploadedFiles.find(
        (file) => file.preview_url === designImage,
      );

      if (!designFile) {
        throw new Error("Design file not found");
      }

      // Create print files array with positioning
      const printFiles = [
        {
          id: designFile.id,
          position: {
            area: selectedPrintArea,
            x: position.x,
            y: position.y,
            rotation: rotation,
            scale: scale / 100,
          },
        },
      ];

      // Create mockup task
      const task = await printfulApi.createMockup(selectedVariant, printFiles);
      setMockupProgress(30);

      // Poll for task completion
      const pollTask = async () => {
        const status = await printfulApi.getMockupTaskStatus(task.task_key);

        if (status.status === "completed") {
          setMockupProgress(100);
          setMockupImages(
            status.mockups.map((mockup: any) => mockup.mockup_url),
          );
          setIsGeneratingMockup(false);
        } else if (status.status === "failed") {
          throw new Error("Mockup generation failed: " + status.error);
        } else {
          // Still processing
          setMockupProgress((prev) => Math.min(prev + 10, 90));
          setTimeout(pollTask, 1000);
        }
      };

      pollTask();
    } catch (error) {
      console.error("Error generating mockup:", error);
      setErrorMessage("Failed to generate mockup");
      setIsGeneratingMockup(false);
    }
  };

  // Save design
  const handleSave = () => {
    if (!selectedVariant || !designImage) {
      setErrorMessage("Please select a variant and upload a design");
      return;
    }

    const designData = {
      variant_id: selectedVariant,
      product_id: selectedProduct,
      design_image: designImage,
      position,
      rotation,
      scale,
      print_area: selectedPrintArea,
      mockup_images: mockupImages,
    };

    onSave(designData);
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-background">
      {/* API Key Dialog - Hidden since key is already provided */}
      <Dialog open={false} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>API Key Already Provided</DialogTitle>
            <DialogDescription>
              Your Printful API key has already been set up.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setApiKeyDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Printful Design Studio</span>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setApiKeyDialogOpen(true)}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      API Connected
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Update your Printful API key</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Product Selection */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">1. Select Product</h3>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={selectedCategory?.toString() || ""}
                    onValueChange={(value) =>
                      setSelectedCategory(parseInt(value))
                    }
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem
                          key={category.id}
                          value={category.id.toString()}
                        >
                          {category.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product">Product</Label>
                  <Select
                    value={selectedProduct?.toString() || ""}
                    onValueChange={(value) =>
                      setSelectedProduct(parseInt(value))
                    }
                  >
                    <SelectTrigger id="product">
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem
                          key={product.id}
                          value={product.id.toString()}
                        >
                          {product.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="variant">Variant</Label>
                  <Select
                    value={selectedVariant?.toString() || ""}
                    onValueChange={(value) =>
                      setSelectedVariant(parseInt(value))
                    }
                  >
                    <SelectTrigger id="variant">
                      <SelectValue placeholder="Select variant" />
                    </SelectTrigger>
                    <SelectContent>
                      {variants.map((variant) => (
                        <SelectItem
                          key={variant.id}
                          value={variant.id.toString()}
                        >
                          {variant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {printAreas.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="print-area">Print Area</Label>
                    <Select
                      value={selectedPrintArea || ""}
                      onValueChange={setSelectedPrintArea}
                    >
                      <SelectTrigger id="print-area">
                        <SelectValue placeholder="Select print area" />
                      </SelectTrigger>
                      <SelectContent>
                        {printAreas.map((area) => (
                          <SelectItem
                            key={area.placement}
                            value={area.placement}
                          >
                            {area.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">2. Upload Design</h3>

                <div className="space-y-2">
                  <Label htmlFor="design-upload">Upload Image</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("design-upload")?.click()
                      }
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse Files
                    </Button>
                    <Input
                      id="design-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Uploaded Files</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {uploadedFiles.map((file) => (
                        <div
                          key={file.id}
                          className={`relative rounded-md overflow-hidden cursor-pointer border-2 ${designImage === file.preview_url ? "border-primary" : "border-transparent"}`}
                          onClick={() => setDesignImage(file.preview_url)}
                        >
                          <img
                            src={file.preview_url}
                            alt="Uploaded design"
                            className="w-full h-auto aspect-square object-contain"
                          />
                          {designImage === file.preview_url && (
                            <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">3. Adjust Design</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center">
                      <Move className="h-4 w-4 mr-2" />
                      Position X
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {position.x}
                    </span>
                  </div>
                  <Slider
                    value={[position.x]}
                    min={-100}
                    max={100}
                    step={1}
                    onValueChange={(value) => handlePositionChange("x", value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center">
                      <Move className="h-4 w-4 mr-2 rotate-90" />
                      Position Y
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {position.y}
                    </span>
                  </div>
                  <Slider
                    value={[position.y]}
                    min={-100}
                    max={100}
                    step={1}
                    onValueChange={(value) => handlePositionChange("y", value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center">
                      <Rotate3D className="h-4 w-4 mr-2" />
                      Rotation
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {rotation}°
                    </span>
                  </div>
                  <Slider
                    value={[rotation]}
                    min={-180}
                    max={180}
                    step={1}
                    onValueChange={handleRotationChange}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center">
                      <ZoomIn className="h-4 w-4 mr-2" />
                      Scale
                    </Label>
                    <span className="text-xs text-muted-foreground">
                      {scale}%
                    </span>
                  </div>
                  <Slider
                    value={[scale]}
                    min={10}
                    max={200}
                    step={1}
                    onValueChange={handleScaleChange}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="show-guides"
                    className="flex items-center cursor-pointer"
                  >
                    <Layers className="h-4 w-4 mr-2" />
                    Show Print Area Guides
                  </Label>
                  <Switch
                    id="show-guides"
                    checked={showGuides}
                    onCheckedChange={setShowGuides}
                  />
                </div>
              </div>
            </div>

            {/* Design Canvas */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Design Preview</h3>

                  <div className="flex items-center gap-2">
                    <Tabs value={activeView} onValueChange={setActiveView}>
                      <TabsList>
                        <TabsTrigger value="front">Front</TabsTrigger>
                        <TabsTrigger value="back">Back</TabsTrigger>
                        <TabsTrigger value="left">Left</TabsTrigger>
                        <TabsTrigger value="right">Right</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>

                <div
                  ref={canvasRef}
                  className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border"
                >
                  {/* Product mockup background */}
                  {variantDetails && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <img
                        src={variantDetails.preview_url}
                        alt="Product preview"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  )}

                  {/* Print area guides */}
                  {showGuides && selectedPrintArea && printAreas.length > 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {printAreas
                        .filter((area) => area.placement === selectedPrintArea)
                        .map((area) => (
                          <div
                            key={area.placement}
                            className="absolute border-2 border-dashed border-blue-500 bg-blue-500/10"
                            style={{
                              width: `${area.width_in_px}px`,
                              height: `${area.height_in_px}px`,
                              top: `${area.top_offset_in_px}px`,
                              left: `${area.left_offset_in_px}px`,
                            }}
                          />
                        ))}
                    </div>
                  )}

                  {/* Design overlay */}
                  {designImage && (
                    <div
                      className="absolute pointer-events-none"
                      style={{
                        transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${scale / 100})`,
                      }}
                    >
                      <img
                        ref={designRef}
                        src={designImage}
                        alt="Design"
                        className="max-w-[200px] max-h-[200px] object-contain"
                      />
                    </div>
                  )}
                </div>

                {/* Mockup generation */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Generate Mockup</h3>

                    <Button
                      onClick={generateMockup}
                      disabled={
                        isGeneratingMockup || !designImage || !selectedVariant
                      }
                    >
                      {isGeneratingMockup ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Generate Mockup
                        </>
                      )}
                    </Button>
                  </div>

                  {isGeneratingMockup && (
                    <div className="space-y-2">
                      <Progress value={mockupProgress} />
                      <p className="text-xs text-center text-muted-foreground">
                        Generating mockup... {mockupProgress}%
                      </p>
                    </div>
                  )}

                  {mockupImages.length > 0 && (
                    <div className="space-y-2">
                      <Label>Generated Mockups</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {mockupImages.map((url, index) => (
                          <div
                            key={index}
                            className="relative rounded-lg overflow-hidden border"
                          >
                            <img
                              src={url}
                              alt={`Mockup ${index + 1}`}
                              className="w-full h-auto"
                            />
                            <div className="absolute bottom-2 right-2 flex gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="h-8 w-8 p-0"
                                      onClick={() => window.open(url, "_blank")}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>View full size</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>

                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      className="h-8 w-8 p-0"
                                      onClick={() => {
                                        const a = document.createElement("a");
                                        a.href = url;
                                        a.download = `mockup-${index + 1}.jpg`;
                                        a.click();
                                      }}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Download mockup</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={!designImage || !selectedVariant}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Design
                  </Button>
                  <Button
                    variant="default"
                    disabled={
                      !designImage ||
                      !selectedVariant ||
                      mockupImages.length === 0
                    }
                  >
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Add to Store
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PrintfulDesignStudio;

// Missing component - add this
const Key = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
  </svg>
);
