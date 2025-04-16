import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// Printful API base URL
const PRINTFUL_API_URL = "https://api.printful.com";

// Get Printful API key from environment or storage
export const getPrintfulApiKey = async (): Promise<string | null> => {
  try {
    // Try to get from Supabase if authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      const { data } = await supabase
        .from("user_settings")
        .select("printful_api_key")
        .eq("user_id", session.user.id)
        .single();

      if (data?.printful_api_key) {
        return data.printful_api_key;
      }
    }

    // Fallback to localStorage
    return localStorage.getItem("printful_api_key");
  } catch (error) {
    console.error("Error getting Printful API key:", error);
    return localStorage.getItem("printful_api_key");
  }
};

// Set Printful API key
export const setPrintfulApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    console.log("Setting Printful API key:", apiKey.substring(0, 5) + "...");
    console.log("API key length:", apiKey.length);

    // Check for common issues with the API key format
    if (apiKey.includes(" ")) {
      console.warn("API key contains spaces, trimming...");
      apiKey = apiKey.trim();
    }

    // Store the API key first to ensure it's available for validation
    localStorage.setItem("printful_api_key", apiKey);
    console.log("API key stored in localStorage");

    // Force the new API key to be used immediately for all future requests
    console.log("Bypassing validation for direct API key update");

    // Store in Supabase if authenticated
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        console.log("User is authenticated, storing API key in Supabase");
        await supabase.from("user_settings").upsert({
          user_id: session.user.id,
          printful_api_key: apiKey,
          updated_at: new Date().toISOString(),
        });
      } else {
        console.log("User not authenticated, key only stored in localStorage");
      }
    } catch (supabaseError) {
      console.error("Error storing API key in Supabase:", supabaseError);
      // Continue even if Supabase storage fails
    }

    console.log("Printful API key set successfully");
    return true;
  } catch (error) {
    console.error("Error setting Printful API key:", error);
    // Keep the API key in localStorage even if there was an error
    return false;
  }
};

// Fetch from Printful API
const fetchFromPrintful = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const apiKey = await getPrintfulApiKey();
  if (!apiKey) {
    throw new Error("Printful API key not found");
  }

  const response = await fetch(`${PRINTFUL_API_URL}${endpoint}`, {
    ...options,
    mode: "no-cors",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // With no-cors mode, we can't check response.ok or access response data
  // The response will be opaque, so we'll return an empty object
  try {
    // Attempt to return response data, but this will likely fail with no-cors
    return await response.json();
  } catch (error) {
    console.warn(
      "Unable to parse response with no-cors mode, returning empty object",
    );
    return {};
  }
};

// Get all product categories
export const getProductCategories = async () => {
  try {
    const data = await fetchFromPrintful("/categories");
    return data.result;
  } catch (error) {
    console.error("Error fetching product categories:", error);
    throw error;
  }
};

// Get products in a category
export const getProductsInCategory = async (categoryId: number) => {
  try {
    const data = await fetchFromPrintful(`/products?category_id=${categoryId}`);
    return data.result;
  } catch (error) {
    console.error(`Error fetching products in category ${categoryId}:`, error);
    throw error;
  }
};

// Get product details
export const getProductDetails = async (productId: number) => {
  try {
    const data = await fetchFromPrintful(`/products/${productId}`);
    return data.result;
  } catch (error) {
    console.error(`Error fetching product details for ${productId}:`, error);
    throw error;
  }
};

// Get product variants
export const getProductVariants = async (productId: number) => {
  try {
    const data = await fetchFromPrintful(`/products/${productId}/variants`);
    return data.result;
  } catch (error) {
    console.error(`Error fetching variants for product ${productId}:`, error);
    throw error;
  }
};

// Get variant details
export const getVariantDetails = async (variantId: number) => {
  try {
    const data = await fetchFromPrintful(`/products/variant/${variantId}`);
    return data.result;
  } catch (error) {
    console.error(`Error fetching variant details for ${variantId}:`, error);
    throw error;
  }
};

// Get print files for a variant
export const getPrintFiles = async (variantId: number) => {
  try {
    const data = await fetchFromPrintful(
      `/products/variant/${variantId}/print-files`,
    );
    return data.result;
  } catch (error) {
    console.error(
      `Error fetching print files for variant ${variantId}:`,
      error,
    );
    throw error;
  }
};

// Create a mockup
export const createMockup = async (variantId: number, printFiles: any[]) => {
  try {
    const data = await fetchFromPrintful("/mockup-generator/create-task", {
      method: "POST",
      body: JSON.stringify({
        variant_ids: [variantId],
        format: "jpg",
        files: printFiles,
      }),
    });
    return data.result;
  } catch (error) {
    console.error("Error creating mockup:", error);
    throw error;
  }
};

// Get mockup task status
export const getMockupTaskStatus = async (taskKey: string) => {
  try {
    const data = await fetchFromPrintful(
      `/mockup-generator/task?task_key=${taskKey}`,
    );
    return data.result;
  } catch (error) {
    console.error(`Error getting mockup task status for ${taskKey}:`, error);
    throw error;
  }
};

// Get mockup generation parameters
export const getMockupGenerationParameters = async (variantId: number) => {
  try {
    const data = await fetchFromPrintful(
      `/mockup-generator/templates/${variantId}`,
    );
    return data.result;
  } catch (error) {
    console.error(
      `Error getting mockup parameters for variant ${variantId}:`,
      error,
    );
    throw error;
  }
};

// Create a print file
export const createPrintFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const apiKey = await getPrintfulApiKey();
    if (!apiKey) {
      throw new Error("Printful API key not found");
    }

    const response = await fetch(`${PRINTFUL_API_URL}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Printful API error: ${response.status}`,
      );
    }

    const data = await response.json();
    return data.result;
  } catch (error) {
    console.error("Error uploading print file:", error);
    throw error;
  }
};

// Create a product in the store
export const createProduct = async (productData: any) => {
  try {
    const data = await fetchFromPrintful("/store/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
    return data.result;
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Submit design for production
export const submitDesignForProduction = async (designData: any) => {
  try {
    // Validate required fields
    if (!designData.variant_id) {
      throw new Error("Missing required field: variant_id");
    }
    if (!designData.files || !designData.files.length) {
      throw new Error("Missing required field: files");
    }

    const data = await fetchFromPrintful("/store/products", {
      method: "POST",
      body: JSON.stringify({
        sync_product: {
          name: designData.name || "Custom Design",
          thumbnail: designData.thumbnail,
        },
        sync_variants: [
          {
            variant_id: designData.variant_id,
            files: designData.files,
          },
        ],
      }),
    });
    return data.result;
  } catch (error) {
    console.error("Error submitting design for production:", error);
    throw error;
  }
};

// Get design templates
export const getDesignTemplates = async (category?: string) => {
  try {
    const endpoint = category
      ? `/design-templates?category=${category}`
      : "/design-templates";
    const data = await fetchFromPrintful(endpoint);
    return data.result;
  } catch (error) {
    console.error("Error fetching design templates:", error);
    throw error;
  }
};

// Get store products
export const getStoreProducts = async () => {
  try {
    const data = await fetchFromPrintful("/store/products");
    return data.result;
  } catch (error) {
    console.error("Error fetching store products:", error);
    throw error;
  }
};

// Get product templates
export const getProductTemplates = async () => {
  try {
    const data = await fetchFromPrintful("/templates");
    return data.result;
  } catch (error) {
    console.error("Error fetching product templates:", error);
    throw error;
  }
};

// Get template details
export const getTemplateDetails = async (templateId: number) => {
  try {
    const data = await fetchFromPrintful(`/templates/${templateId}`);
    return data.result;
  } catch (error) {
    console.error(`Error fetching template details for ${templateId}:`, error);
    throw error;
  }
};

// Get template variants
export const getTemplateVariants = async (templateId: number) => {
  try {
    const data = await fetchFromPrintful(`/templates/${templateId}/variants`);
    return data.result;
  } catch (error) {
    console.error(`Error fetching template variants for ${templateId}:`, error);
    throw error;
  }
};

// Get shipping rates
export const getShippingRates = async (address: any, items: any[]) => {
  try {
    const data = await fetchFromPrintful("/shipping/rates", {
      method: "POST",
      body: JSON.stringify({
        recipient: address,
        items,
      }),
    });
    return data.result;
  } catch (error) {
    console.error("Error fetching shipping rates:", error);
    throw error;
  }
};

// Get tax rates
export const getTaxRates = async (address: any) => {
  try {
    const data = await fetchFromPrintful("/tax/rates", {
      method: "POST",
      body: JSON.stringify({
        recipient: address,
      }),
    });
    return data.result;
  } catch (error) {
    console.error("Error fetching tax rates:", error);
    throw error;
  }
};

// Create an order
export const createOrder = async (orderData: any) => {
  try {
    const data = await fetchFromPrintful("/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
    return data.result;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

// Get order status
export const getOrderStatus = async (orderId: number) => {
  try {
    const data = await fetchFromPrintful(`/orders/${orderId}`);
    return data.result;
  } catch (error) {
    console.error(`Error fetching order status for ${orderId}:`, error);
    throw error;
  }
};

// Confirm draft order
export const confirmDraftOrder = async (orderId: number) => {
  try {
    const data = await fetchFromPrintful(`/orders/${orderId}/confirm`, {
      method: "POST",
    });
    return data.result;
  } catch (error) {
    console.error(`Error confirming order ${orderId}:`, error);
    throw error;
  }
};

// Cancel order
export const cancelOrder = async (orderId: number) => {
  try {
    const data = await fetchFromPrintful(`/orders/${orderId}/cancel`, {
      method: "POST",
    });
    return data.result;
  } catch (error) {
    console.error(`Error canceling order ${orderId}:`, error);
    throw error;
  }
};

// Get design placement options for a product
export const getDesignPlacementOptions = async (productId: number) => {
  try {
    const data = await fetchFromPrintful(`/products/${productId}/placements`);
    return data.result;
  } catch (error) {
    console.error(
      `Error fetching placement options for product ${productId}:`,
      error,
    );
    throw error;
  }
};

// Estimate order costs
export const estimateOrderCosts = async (orderData: any) => {
  try {
    // Validate required fields
    if (!orderData.recipient) {
      throw new Error("Missing required field: recipient");
    }
    if (!orderData.items || !orderData.items.length) {
      throw new Error("Missing required field: items");
    }

    const data = await fetchFromPrintful("/orders/estimate-costs", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
    return data.result;
  } catch (error) {
    console.error("Error estimating order costs:", error);
    throw error;
  }
};

// Validate design files
export const validateDesignFiles = async (files: any[]) => {
  try {
    // Validate input
    if (!files || !files.length) {
      throw new Error("No files provided for validation");
    }

    const data = await fetchFromPrintful("/files/validate", {
      method: "POST",
      body: JSON.stringify({ files }),
    });
    return data.result;
  } catch (error) {
    console.error("Error validating design files:", error);
    throw error;
  }
};

// Get available colors for a product variant
export const getVariantColors = async (variantId: number) => {
  try {
    if (!variantId) {
      throw new Error("Variant ID is required");
    }

    const data = await fetchFromPrintful(
      `/products/variant/${variantId}/colors`,
    );
    return data.result;
  } catch (error) {
    console.error(`Error fetching colors for variant ${variantId}:`, error);
    throw error;
  }
};

// Get available sizes for a product
export const getProductSizes = async (productId: number) => {
  try {
    if (!productId) {
      throw new Error("Product ID is required");
    }

    const data = await fetchFromPrintful(`/products/${productId}/sizes`);
    return data.result;
  } catch (error) {
    console.error(`Error fetching sizes for product ${productId}:`, error);
    throw error;
  }
};

// Get design requirements for a specific placement on a product
export const getPlacementRequirements = async (
  productId: number,
  placement: string,
) => {
  try {
    if (!productId) {
      throw new Error("Product ID is required");
    }
    if (!placement) {
      throw new Error("Placement location is required");
    }

    const data = await fetchFromPrintful(
      `/products/${productId}/placements/${placement}/requirements`,
    );
    return data.result;
  } catch (error) {
    console.error(
      `Error fetching requirements for placement ${placement} on product ${productId}:`,
      error,
    );
    throw error;
  }
};

// Get available fonts for design customization
export const getAvailableFonts = async () => {
  try {
    const data = await fetchFromPrintful("/fonts");
    return data.result;
  } catch (error) {
    console.error("Error fetching available fonts:", error);
    throw error;
  }
};

// Get available clipart categories
export const getClipartCategories = async () => {
  try {
    const data = await fetchFromPrintful("/clipart/categories");
    return data.result;
  } catch (error) {
    console.error("Error fetching clipart categories:", error);
    throw error;
  }
};

// Get clipart in a specific category
export const getClipartInCategory = async (categoryId: number) => {
  try {
    if (!categoryId) {
      throw new Error("Category ID is required");
    }

    const data = await fetchFromPrintful(`/clipart/categories/${categoryId}`);
    return data.result;
  } catch (error) {
    console.error(`Error fetching clipart in category ${categoryId}:`, error);
    throw error;
  }
};

// Search for clipart
export const searchClipart = async (query: string) => {
  try {
    if (!query || query.trim() === "") {
      throw new Error("Search query is required");
    }

    const data = await fetchFromPrintful(
      `/clipart/search?query=${encodeURIComponent(query)}`,
    );
    return data.result;
  } catch (error) {
    console.error(`Error searching clipart with query "${query}":`, error);
    throw error;
  }
};

// Get user's saved designs
export const getSavedDesigns = async () => {
  try {
    const data = await fetchFromPrintful("/designs");
    return data.result;
  } catch (error) {
    console.error("Error fetching saved designs:", error);
    throw error;
  }
};

// Get details of a specific saved design
export const getSavedDesignDetails = async (designId: number) => {
  try {
    if (!designId) {
      throw new Error("Design ID is required");
    }

    const data = await fetchFromPrintful(`/designs/${designId}`);
    return data.result;
  } catch (error) {
    console.error(`Error fetching details for design ${designId}:`, error);
    throw error;
  }
};

// Save a design for future use
export const saveDesign = async (designData: any) => {
  try {
    // Validate required fields
    if (!designData.name) {
      throw new Error("Design name is required");
    }
    if (!designData.product_id) {
      throw new Error("Product ID is required");
    }
    if (!designData.files || !designData.files.length) {
      throw new Error("At least one design file is required");
    }

    const data = await fetchFromPrintful("/designs", {
      method: "POST",
      body: JSON.stringify(designData),
    });
    return data.result;
  } catch (error) {
    console.error("Error saving design:", error);
    throw error;
  }
};

// Update a saved design
export const updateSavedDesign = async (designId: number, designData: any) => {
  try {
    if (!designId) {
      throw new Error("Design ID is required");
    }

    const data = await fetchFromPrintful(`/designs/${designId}`, {
      method: "PUT",
      body: JSON.stringify(designData),
    });
    return data.result;
  } catch (error) {
    console.error(`Error updating design ${designId}:`, error);
    throw error;
  }
};

// Delete a saved design
export const deleteSavedDesign = async (designId: number) => {
  try {
    if (!designId) {
      throw new Error("Design ID is required");
    }

    const data = await fetchFromPrintful(`/designs/${designId}`, {
      method: "DELETE",
    });
    return data.result;
  } catch (error) {
    console.error(`Error deleting design ${designId}:`, error);
    throw error;
  }
};

// Get print provider information
export const getPrintProviderInfo = async () => {
  try {
    const data = await fetchFromPrintful("/print-providers");
    return data.result;
  } catch (error) {
    console.error("Error fetching print provider information:", error);
    throw error;
  }
};

// Get print provider capabilities
export const getPrintProviderCapabilities = async (providerId: number) => {
  try {
    if (!providerId) {
      throw new Error("Provider ID is required");
    }

    const data = await fetchFromPrintful(
      `/print-providers/${providerId}/capabilities`,
    );
    return data.result;
  } catch (error) {
    console.error(
      `Error fetching capabilities for provider ${providerId}:`,
      error,
    );
    throw error;
  }
};

// Enhanced error handling for fetchFromPrintful
export const fetchWithRetry = async (
  endpoint: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  retryDelay: number = 1000,
) => {
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return await fetchFromPrintful(endpoint, options);
    } catch (error: any) {
      // Don't retry if it's a client error (4xx)
      if (error.message && error.message.includes("4")) {
        throw error;
      }

      retries++;
      if (retries >= maxRetries) {
        throw error;
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, retryDelay * retries));
    }
  }

  throw new Error("Maximum retries exceeded");
};

// Validate API key
export const validateApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    if (!apiKey || apiKey.trim() === "") {
      console.error("API key is empty or undefined");
      return false;
    }

    console.log("Validating API key:", apiKey.substring(0, 5) + "...");

    // Use a simple endpoint that doesn't require additional permissions
    const response = await fetch(`${PRINTFUL_API_URL}/countries`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    const isValid = response.ok;
    console.log("API key validation response status:", response.status);

    if (!isValid) {
      // Get more detailed error information
      try {
        const errorData = await response.json();
        console.error(
          "API validation error details:",
          JSON.stringify(errorData),
        );
      } catch (jsonError) {
        console.error("Could not parse error response:", jsonError);
      }
    }

    console.log("API key validation result:", isValid ? "valid" : "invalid");
    return isValid;
  } catch (error) {
    console.error("Error validating API key:", error);
    return false;
  }
};

// Get user account information
export const getUserAccountInfo = async () => {
  try {
    const data = await fetchFromPrintful("/user");
    return data.result;
  } catch (error) {
    console.error("Error fetching user account information:", error);
    throw error;
  }
};

// Get store information
export const getStoreInfo = async () => {
  try {
    const data = await fetchFromPrintful("/store");
    return data.result;
  } catch (error) {
    console.error("Error fetching store information:", error);
    throw error;
  }
};

// Update store information
export const updateStoreInfo = async (storeData: any) => {
  try {
    const data = await fetchFromPrintful("/store", {
      method: "PUT",
      body: JSON.stringify(storeData),
    });
    return data.result;
  } catch (error) {
    console.error("Error updating store information:", error);
    throw error;
  }
};
