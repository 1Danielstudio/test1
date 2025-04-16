import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Check } from "lucide-react";
import * as printfulApi from "@/services/printfulApi";

const PrintfulKeyDebugger = () => {
  const [apiKey, setApiKey] = useState("");
  const [storedKey, setStoredKey] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<boolean | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getStoredKey = async () => {
      try {
        const key = await printfulApi.getPrintfulApiKey();
        setStoredKey(key);
        if (key) {
          setApiKey(key);
        }
      } catch (err) {
        console.error("Error getting stored key:", err);
      }
    };

    getStoredKey();
  }, []);

  const handleValidateKey = async () => {
    setIsLoading(true);
    setError(null);
    setValidationResult(null);

    try {
      const isValid = await printfulApi.validateApiKey(apiKey);
      setValidationResult(isValid);
      if (!isValid) {
        setError("The API key is invalid. Please check and try again.");
      }
    } catch (err) {
      console.error("Error validating key:", err);
      setError("An error occurred while validating the API key.");
      setValidationResult(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetKey = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const success = await printfulApi.setPrintfulApiKey(apiKey);
      if (success) {
        setStoredKey(apiKey);
        setValidationResult(true);
      } else {
        setError("Failed to set the API key. Please try again.");
        setValidationResult(false);
      }
    } catch (err) {
      console.error("Error setting key:", err);
      setError("An error occurred while setting the API key.");
      setValidationResult(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectSet = () => {
    // Trim the API key to remove any accidental whitespace
    const trimmedKey = apiKey.trim();
    localStorage.setItem("printful_api_key", trimmedKey);
    setStoredKey(trimmedKey);
    setApiKey(trimmedKey); // Update the input field with trimmed value
    console.log(
      "API key set directly in localStorage:",
      trimmedKey.substring(0, 5) + "...",
    );
    alert("API key set directly in localStorage");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Printful API Key Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm mb-2">Currently stored API key:</p>
          <code className="bg-gray-100 p-2 rounded block overflow-x-auto">
            {storedKey ? `${storedKey.substring(0, 10)}...` : "No key stored"}
          </code>
        </div>

        <div className="space-y-2">
          <Input
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter Printful API key"
          />

          <div className="flex gap-2">
            <Button onClick={handleValidateKey} disabled={isLoading || !apiKey}>
              Validate Key
            </Button>
            <Button onClick={handleSetKey} disabled={isLoading || !apiKey}>
              Set Key
            </Button>
            <Button
              variant="outline"
              onClick={handleDirectSet}
              disabled={!apiKey}
            >
              Direct Set
            </Button>
          </div>
        </div>

        {validationResult === true && (
          <Alert className="bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              API key is valid!
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500">
          <p>Debug information:</p>
          <ul className="list-disc pl-4">
            <li>
              localStorage key:{" "}
              {localStorage.getItem("printful_api_key")
                ? `Set (${localStorage.getItem("printful_api_key")?.substring(0, 5)}...)`
                : "Not set"}
            </li>
            <li>API key length: {apiKey.length}</li>
            <li>
              API validation result:{" "}
              {validationResult === null
                ? "Not tested"
                : validationResult
                  ? "Valid"
                  : "Invalid"}
            </li>
          </ul>
          <p className="mt-2">
            Note: Check browser console for detailed validation logs
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PrintfulKeyDebugger;
