import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { getPrintfulApiKey, setPrintfulApiKey } from "@/services/printful";

interface PrintfulApiKeySetupProps {
  onSuccess?: () => void;
}

const PrintfulApiKeySetup = ({ onSuccess }: PrintfulApiKeySetupProps) => {
  const [apiKey, setApiKey] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [hasStoredKey, setHasStoredKey] = useState(false);

  useEffect(() => {
    const storedKey = getPrintfulApiKey();
    if (storedKey) {
      setHasStoredKey(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) {
      setStatus("error");
      setErrorMessage("API key is required");
      return;
    }

    setStatus("loading");

    try {
      const success = await setPrintfulApiKey(apiKey);
      if (success) {
        setStatus("success");
        setHasStoredKey(true);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setStatus("error");
        setErrorMessage("Invalid API key. Please check and try again.");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage("Failed to validate API key. Please try again.");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Printful API Setup</CardTitle>
        <CardDescription>
          {hasStoredKey
            ? "Your Printful API key is already set up. You can update it below if needed."
            : "To use the Printful integration, please enter your API key below."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Printful API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your Printful API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              You can find your API key in your Printful dashboard under
              Settings &gt; API.
            </p>
          </div>

          {status === "error" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          {status === "success" && (
            <Alert className="bg-green-50 text-green-800 border-green-200">
              <Check className="h-4 w-4" />
              <AlertDescription>API key saved successfully!</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={status === "loading"}
          >
            {status === "loading" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Validating...
              </>
            ) : hasStoredKey ? (
              "Update API Key"
            ) : (
              "Save API Key"
            )}
          </Button>
        </form>
      </CardContent>
      {hasStoredKey && (
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={onSuccess}>
            Continue to Design Studio
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PrintfulApiKeySetup;
