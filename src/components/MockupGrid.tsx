import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart,
  ShoppingBag,
  Check,
  Loader2,
  Info,
  Eye,
} from "lucide-react";
import {
  checkImageFit,
  fixImageForProduct,
  getProductDetails,
  ProductVariant,
  createMockup,
} from "../services/printful";
import { useCart } from "./cart/CartContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Checkout from "./Checkout";

// Import mockup components
import TShirtMockup from "./mockups/TShirtMockup";
import MugMockup from "./mockups/MugMockup";
import PosterMockup from "./mockups/PosterMockup";
import HoodieMockup from "./mockups/HoodieMockup";

interface MockupGridProps {
  image?: string;
  styleApplied?: boolean;
}

const MockupGrid = ({
  image = "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80",
  styleApplied = true,
}: MockupGridProps) => {
  const [selectedProduct, setSelectedProduct] = useState<
    "tshirt" | "mug" | "poster" | "hoodie"
  >("tshirt");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [smartFitStatus, setSmartFitStatus] = useState<
    "good" | "warning" | "error"
  >("good");
  const [isFixing, setIsFixing] = useState(false);
  const [fixedImage, setFixedImage] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [view, setView] = useState<"front" | "back">("front");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showWatermark, setShowWatermark] = useState(true);

  // Get cart context
  const { addItem, items, setIsCartOpen } = useCart();

  // Get product details
  const productDetails = getProductDetails(selectedProduct);

  // This would be calculated based on image dimensions and product print areas
  const fitStatusMessages = {
    good: "Image fits perfectly on this product",
    warning: "Image may be slightly stretched on this product",
    error: "Image resolution too low for quality printing",
  };

  // Set default variant when product changes
  useEffect(() => {
    if (productDetails && productDetails.variants.length > 0) {
      setSelectedVariant(productDetails.variants[0]);
    }
  }, [selectedProduct, productDetails]);

  // Calculate smart fit status when product or image changes
  useEffect(() => {
    if (image) {
      // In a real implementation, we would get the actual image dimensions
      // For now, we'll simulate with random values for demonstration
      const mockImageWidth = 1200;
      const mockImageHeight = 800;

      const status = checkImageFit(
        mockImageWidth,
        mockImageHeight,
        selectedProduct,
      );
      setSmartFitStatus(status);

      // Reset fixed image when product changes
      setFixedImage(null);
    }
  }, [selectedProduct, image]);

  const handleFixImage = async () => {
    if (!image) return;

    setIsFixing(true);
    try {
      // Use Printful API to optimize the image
      const optimizedImage = await fixImageForProduct(image, selectedProduct);
      setFixedImage(optimizedImage);
      setSmartFitStatus("good");
    } catch (error) {
      console.error("Error fixing image:", error);
    } finally {
      setIsFixing(false);
    }
  };

  const handleAddToCart = () => {
    if (!productDetails || !selectedVariant) return;

    const newItem = {
      productId: productDetails.id,
      variantId: selectedVariant.id,
      type: selectedProduct,
      name: `${productDetails.name} - ${selectedVariant.name}`,
      image: fixedImage || image,
      price: selectedVariant.price,
      size: selectedVariant.size,
      color: selectedVariant.color,
      customization: {
        position,
        rotation,
        zoom,
      },
    };

    addItem(newItem);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    // Open the checkout dialog
    setIsCheckoutOpen(true);
    // Close the cart if it's open
    setIsCartOpen(false);
  };

  const displayImage = fixedImage || image;

  // Get variants for the selected product
  const variants = productDetails?.variants || [];

  // State for mockup URLs from Printful API
  const [mockupUrls, setMockupUrls] = useState<{ [key: string]: string }>({});

  // Auto-adjust position and zoom based on product type
  useEffect(() => {
    // Set default position and zoom based on product type
    if (selectedProduct === "tshirt") {
      setPosition({ x: 0, y: 0 });
      setZoom(100);
      setRotation(0);
    } else if (selectedProduct === "mug") {
      setPosition({ x: 0, y: 0 });
      setZoom(80);
      setRotation(0);
    } else if (selectedProduct === "poster") {
      setPosition({ x: 0, y: 0 });
      setZoom(120);
      setRotation(0);
    } else if (selectedProduct === "hoodie") {
      setPosition({ x: 0, y: 0 });
      setZoom(90);
      setRotation(0);
    }
  }, [selectedProduct]);

  // Generate mockup using Printful API when product or variant changes
  useEffect(() => {
    const generateMockup = async () => {
      if (!displayImage || !selectedVariant) return;

      try {
        // Generate a unique key for this product/variant combination
        const mockupKey = `${selectedProduct}-${selectedVariant.id}`;

        // Check if we already have this mockup cached
        if (!mockupUrls[mockupKey]) {
          const mockupData = await createMockup(
            productDetails?.id || "",
            selectedVariant.id,
            displayImage,
          );

          // Update mockup URLs with the new URL
          setMockupUrls((prev) => ({
            ...prev,
            [mockupKey]: mockupData.result.mockup_url,
          }));
        }
      } catch (error) {
        console.error("Error generating mockup:", error);
      }
    };

    generateMockup();
  }, [selectedProduct, selectedVariant, displayImage]);

  // Render the appropriate mockup component based on selected product
  const renderMockup = () => {
    // Generate a unique key for this product/variant combination
    const mockupKey = selectedVariant
      ? `${selectedProduct}-${selectedVariant.id}`
      : "";

    // Get the mockup URL from Printful API if available
    const mockupUrl = mockupUrls[mockupKey] || productDetails?.imageUrl;

    const mockupProps = {
      image: displayImage,
      styleApplied,
      showWatermark,
      view,
      position,
      rotation,
      zoom,
      variant: selectedVariant,
      onViewChange: (newView: "front" | "back") => setView(newView),
    };

    switch (selectedProduct) {
      case "tshirt":
        return <TShirtMockup {...mockupProps} />;
      case "mug":
        return <MugMockup {...mockupProps} />;
      case "poster":
        return <PosterMockup {...mockupProps} />;
      case "hoodie":
        return (
          <HoodieMockup
            imageUrl={displayImage}
            showWatermark={showWatermark}
            appliedStyle={styleApplied ? "Neon" : ""}
          />
        );
      default:
        return <TShirtMockup {...mockupProps} />;
    }
  };

  // State for the selected mockup when in detail view
  const [selectedMockupDetail, setSelectedMockupDetail] = useState<
    string | null
  >(null);

  // Function to render all mockups in a grid
  const renderMockupGrid = () => {
    const products = ["tshirt", "mug", "poster", "hoodie"];

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => {
          const mockupKey = selectedVariant
            ? `${product}-${selectedVariant.id}`
            : "";

          return (
            <Card
              key={product}
              className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => {
                setSelectedProduct(product as any);
                setSelectedMockupDetail(product);
              }}
            >
              <div className="aspect-square relative bg-muted">
                {product === "tshirt" && (
                  <TShirtMockup
                    image={displayImage}
                    styleApplied={styleApplied}
                    showWatermark={showWatermark}
                    view="front"
                    position={position}
                    rotation={rotation}
                    zoom={zoom}
                    variant={selectedVariant}
                    onViewChange={() => {}}
                  />
                )}
                {product === "mug" && (
                  <MugMockup
                    image={displayImage}
                    styleApplied={styleApplied}
                    showWatermark={showWatermark}
                    view="front"
                    position={position}
                    rotation={rotation}
                    zoom={zoom}
                    variant={selectedVariant}
                    onViewChange={() => {}}
                  />
                )}
                {product === "poster" && (
                  <PosterMockup
                    image={displayImage}
                    styleApplied={styleApplied}
                    showWatermark={showWatermark}
                    view="front"
                    position={position}
                    rotation={rotation}
                    zoom={zoom}
                    variant={selectedVariant}
                    onViewChange={() => {}}
                  />
                )}
                {product === "hoodie" && (
                  <HoodieMockup
                    imageUrl={displayImage}
                    showWatermark={showWatermark}
                    appliedStyle={styleApplied ? "Neon" : ""}
                  />
                )}
                <div className="absolute inset-0 bg-black/0 hover:bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Button size="sm" variant="secondary">
                    <Eye size={14} className="mr-1" /> View
                  </Button>
                </div>
              </div>
              <CardContent className="p-3">
                <h3 className="font-medium text-sm capitalize">{product}</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedVariant
                    ? `${selectedVariant.price.toFixed(2)}`
                    : "Select options"}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  };

  return (
    <>
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <Checkout
            onCancel={() => setIsCheckoutOpen(false)}
            onSuccess={() => {
              setIsCheckoutOpen(false);
              // Additional success handling could be added here
            }}
          />
        </DialogContent>
      </Dialog>

      <Card className="w-full bg-background">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Product Mockups</h2>

          {selectedMockupDetail ? (
            <>
              <Button
                variant="outline"
                className="mb-4"
                onClick={() => setSelectedMockupDetail(null)}
              >
                ← Back to All Mockups
              </Button>

              <Tabs
                defaultValue="tshirt"
                value={selectedProduct}
                onValueChange={(value) => setSelectedProduct(value as any)}
              >
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="tshirt">T-Shirt</TabsTrigger>
                  <TabsTrigger value="mug">Mug</TabsTrigger>
                  <TabsTrigger value="poster">Poster</TabsTrigger>
                  <TabsTrigger value="hoodie">Hoodie</TabsTrigger>
                </TabsList>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>{renderMockup()}</div>

                  <div className="space-y-6">
                    <div className="bg-muted p-4 rounded-md">
                      <h3 className="font-medium mb-2">Smart Fit Check</h3>

                      <div
                        className={`flex items-center gap-2 text-sm ${
                          smartFitStatus === "good"
                            ? "text-green-500"
                            : smartFitStatus === "warning"
                              ? "text-amber-500"
                              : "text-red-500"
                        }`}
                      >
                        <Check size={16} />
                        <span>{fitStatusMessages[smartFitStatus]}</span>
                      </div>

                      {smartFitStatus !== "good" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={handleFixImage}
                          disabled={isFixing}
                        >
                          {isFixing ? (
                            <>
                              <Loader2
                                size={14}
                                className="mr-2 animate-spin"
                              />
                              Optimizing...
                            </>
                          ) : (
                            "Let AI Fix It"
                          )}
                        </Button>
                      )}

                      {fixedImage && (
                        <p className="text-xs text-green-500 mt-2">
                          Image has been optimized for this product!
                        </p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">Product Options</h3>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                >
                                  <Info size={14} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">
                                  Select size, color, and other options
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <Select
                          value={selectedVariant?.id.toString() || ""}
                          onValueChange={(value) => {
                            const variant = variants.find(
                              (v) => v.id.toString() === value,
                            );
                            if (variant) setSelectedVariant(variant);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select variant" />
                          </SelectTrigger>
                          <SelectContent>
                            {variants.map((variant) => (
                              <SelectItem
                                key={variant.id}
                                value={variant.id.toString()}
                              >
                                {variant.name} - ${variant.price.toFixed(2)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-medium">Product Details</h3>
                        <ul className="text-sm space-y-1 text-muted-foreground">
                          <li>• Premium quality materials</li>
                          <li>• Full-color, high-resolution printing</li>
                          <li>• Fast production and shipping</li>
                          <li>• 30-day satisfaction guarantee</li>
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Price:</span>
                        <span className="text-lg font-bold">
                          $
                          {selectedVariant?.price.toFixed(2) ||
                            productDetails?.basePrice.toFixed(2) ||
                            "0.00"}
                        </span>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={handleAddToCart}
                          disabled={!selectedVariant}
                        >
                          <ShoppingCart size={16} className="mr-2" />
                          Add to Cart
                        </Button>
                        <Button
                          className="flex-1"
                          onClick={handleBuyNow}
                          disabled={!selectedVariant}
                        >
                          <ShoppingBag size={16} className="mr-2" />
                          Buy Now
                        </Button>
                      </div>

                      {items.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2">
                          {items.length} item(s) in cart
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Tabs>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-muted-foreground">
                  Click on a product to view details and customize
                </p>

                <Select
                  value={selectedVariant?.id.toString() || ""}
                  onValueChange={(value) => {
                    const variant = variants.find(
                      (v) => v.id.toString() === value,
                    );
                    if (variant) setSelectedVariant(variant);
                  }}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {variants.map((variant) => (
                      <SelectItem
                        key={variant.id}
                        value={variant.id.toString()}
                      >
                        {variant.name} - ${variant.price.toFixed(2)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {renderMockupGrid()}

              <div className="pt-4 border-t flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Price:</span>
                  <span className="text-lg font-bold">
                    $
                    {selectedVariant?.price.toFixed(2) ||
                      productDetails?.basePrice.toFixed(2) ||
                      "0.00"}
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleAddToCart}
                    disabled={!selectedVariant}
                  >
                    <ShoppingCart size={16} className="mr-2" />
                    Add to Cart
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleBuyNow}
                    disabled={!selectedVariant}
                  >
                    <ShoppingBag size={16} className="mr-2" />
                    Buy Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default MockupGrid;
