import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Key } from "lucide-react";
import {
  authenticatePrintful,
  getPrintfulApiKey,
  setPrintfulApiKey,
  AuthStatus,
} from "@/services/printful";

interface PrintfulSettingsProps {
  onAuthStatusChange?: (status: AuthStatus) => void;
}

const PrintfulSettings: React.FC<PrintfulSettingsProps> = ({
  onAuthStatusChange = () => {},
}) => {
  const [apiKey, setApiKey] = useState<string>("");
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Load saved API key on component mount
  useEffect(() => {
    const savedKey = getPrintfulApiKey();
    if (savedKey) {
      setApiKey(savedKey);
      // Check if the saved key is valid
      checkAuthStatus(savedKey);
    }
  }, []);

  const checkAuthStatus = async (key: string) => {
    setIsAuthenticating(true);
    try {
      const status = await authenticatePrintful(key);
      setAuthStatus(status);
      onAuthStatusChange(status);
    } catch (error) {
      setAuthStatus({
        authenticated: false,
        message:
          "Failed to authenticate: " +
          (error instanceof Error ? error.message : "Unknown error"),
      });
      onAuthStatusChange({
        authenticated: false,
        message: "Failed to authenticate",
      });
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleAuthenticate = async () => {
    if (!apiKey.trim()) {
      setAuthStatus({
        authenticated: false,
        message: "API key is required",
      });
      return;
    }

    await checkAuthStatus(apiKey);
    if (authStatus?.authenticated) {
      setIsEditing(false);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    // Reset to saved key
    const savedKey = getPrintfulApiKey();
    setApiKey(savedKey || "");
    setIsEditing(false);
  };

  return (
    <Card className="w-full bg-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key size={20} />
          Printful API Settings
        </CardTitle>
        <CardDescription>
          Connect your Printful account to enable print-on-demand services
        </CardDescription>
      </CardHeader>
      <CardContent>
        {authStatus && (
          <Alert
            className={`mb-4 ${authStatus.authenticated ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}`}
          >
            {authStatus.authenticated ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertTitle>
              {authStatus.authenticated
                ? "Successfully connected"
                : "Connection failed"}
            </AlertTitle>
            <AlertDescription>{authStatus.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">Printful API Key</Label>
            {isEditing ? (
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Printful API key"
                disabled={isAuthenticating}
              />
            ) : (
              <div className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                <span className="text-sm font-mono">
                  {apiKey ? "••••••••" + apiKey.slice(-4) : "No API key set"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleEditClick}
                  disabled={isAuthenticating}
                >
                  Edit
                </Button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              You can find your API key in your Printful dashboard under
              Settings &gt; API
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isEditing && (
          <Button
            variant="outline"
            onClick={handleCancelEdit}
            disabled={isAuthenticating}
          >
            Cancel
          </Button>
        )}
        {isEditing && (
          <Button onClick={handleAuthenticate} disabled={isAuthenticating}>
            {isAuthenticating ? "Connecting..." : "Connect"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PrintfulSettings;
