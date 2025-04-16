import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sparkles,
  Palette,
  ShoppingBag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PrintfulDesignStudio from "@/components/PrintfulDesignStudio";
import * as printfulApi from "@/services/printfulApi";

interface PrintfulDesignMakerSectionProps {
  className?: string;
  initialImage?: string;
}

const PrintfulDesignMakerSection: React.FC<PrintfulDesignMakerSectionProps> = ({
  className,
  initialImage,
}) => {
  const navigate = useNavigate();
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [apiKeyStatus, setApiKeyStatus] = useState<
    "unchecked" | "valid" | "invalid"
  >("unchecked");
  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);

  // Check if Printful API key is available when component mounts
  useEffect(() => {
    const checkApiKey = async () => {
      try {
        const apiKey = await printfulApi.getPrintfulApiKey();
        setApiKeyStatus(apiKey ? "valid" : "invalid");
      } catch (err) {
        console.error("Error checking Printful API key:", err);
        setApiKeyStatus("invalid");
      }
    };

    checkApiKey();
  }, []);

  const handleOpenDesignStudio = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if API key is valid before opening studio
      const apiKey = await printfulApi.getPrintfulApiKey();

      if (!apiKey) {
        setApiKeyStatus("invalid");
        setApiKeyDialogOpen(true);
        setError("Printful API key is required to use the design studio.");
        setIsLoading(false);
        return;
      }

      // Verify API key is valid by making a simple API call
      try {
        await printfulApi.getProductCategories();
        setApiKeyStatus("valid");
      } catch (err) {
        console.error("Error validating Printful API key:", err);
        setApiKeyStatus("invalid");
        setApiKeyDialogOpen(true);
        setError(
          "Your Printful API key appears to be invalid. Please update it to continue.",
        );
        setIsLoading(false);
        return;
      }

      // Open the design studio dialog
      setIsStudioOpen(true);
      setIsLoading(false);
    } catch (err) {
      console.error("Error opening design studio:", err);
      setError("Failed to open design studio. Please try again.");
      setIsLoading(false);
    }
  };

  const handleCloseStudio = () => {
    setIsStudioOpen(false);
  };

  const handleSaveDesign = (designData: any) => {
    console.log("Design saved:", designData);
    // Here you could save the design to the user's account or proceed to checkout
    setIsStudioOpen(false);
    // Optionally navigate to a confirmation or checkout page
    // navigate("/design-confirmation", { state: { designData } });
  };

  return (
    <>
      <section className={`py-12 md:py-20 ${className}`}>
        <div className="container">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Professional Design Studio
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Create professional-quality designs for your merchandise with our
              integrated Printful Design Studio. Position, scale, and preview
              your designs on real products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            {[
              {
                title: "Precise Positioning",
                description:
                  "Drag, rotate, and scale your designs with pixel-perfect precision.",
                icon: <Palette className="h-10 w-10 text-primary" />,
              },
              {
                title: "Real-time Preview",
                description:
                  "See exactly how your design will look on the final product before ordering.",
                icon: <Sparkles className="h-10 w-10 text-primary" />,
              },
              {
                title: "Direct to Production",
                description:
                  "Send your designs straight to Printful for production and shipping.",
                icon: <ShoppingBag className="h-10 w-10 text-primary" />,
              },
            ].map((feature, index) => (
              <Card key={index} className="p-6 h-full">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              size="lg"
              className="px-8 py-6 text-lg"
              onClick={handleOpenDesignStudio}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Open Design Studio
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </section>

      {/* Design Studio Dialog */}
      <Dialog open={isStudioOpen} onOpenChange={setIsStudioOpen}>
        <DialogContent className="max-w-7xl w-[95vw]">
          <DialogHeader>
            <DialogTitle>Printful Design Studio</DialogTitle>
            <DialogDescription>
              Create and customize your design for print-on-demand products.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <PrintfulDesignStudio
              initialImage={initialImage}
              onSave={handleSaveDesign}
              onCancel={handleCloseStudio}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* API Key Dialog */}
      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Printful API Key Required</DialogTitle>
            <DialogDescription>
              To use the Design Studio, you need to connect your Printful
              account by providing an API key.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              You can find your API key in your Printful dashboard under
              Settings &gt; API.
            </p>
            {apiKeyStatus === "invalid" && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  The provided API key is invalid or has expired. Please check
                  your Printful account and try again.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApiKeyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Navigate to PrintfulConnect or settings page
                navigate("/printful-connect");
                setApiKeyDialogOpen(false);
              }}
            >
              Connect Printful Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PrintfulDesignMakerSection;
