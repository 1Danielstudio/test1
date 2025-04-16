// Printful API integration service

// API key for Printful
let PRINTFUL_API_KEY =
  "jBiZ9TgR7THqyNtWlwS7FTH7HdKSv4tiyEg5Rf3U";
const PRINTFUL_API_URL = "https://api.printful.com";

// Interface for product dimensions
export interface ProductDimensions {
  width: number;
  height: number;
}

// Interface for product print areas
export interface PrintArea {
  id: string;
  name: string;
  dimensions: ProductDimensions;
}

// Interface for product types
export interface ProductType {
  id: string;
  name: string;
  printAreas: PrintArea[];
  minDpi: number;
}

// Interface for product variant
export interface ProductVariant {
  id: number;
  name: string;
  price: number;
  size?: string;
  color?: string;
}

// Interface for product
export interface Product {
  id: string;
  name: string;
  type: string;
  variants: ProductVariant[];
  basePrice: number;
  imageUrl: string;
}

// Interface for authentication status
export interface AuthStatus {
  authenticated: boolean;
  message: string;
}

// Mock product dimensions for different product types
export const productDimensions: Record<string, ProductDimensions> = {
  tshirt: { width: 1800, height: 2400 },
  mug: { width: 2400, height: 1000 },
  poster: { width: 2400, height: 3600 },
  hoodie: { width: 1800, height: 2400 },
};

// Mock product catalog
export const productCatalog: Record<string, Product> = {
  tshirt: {
    id: "tshirt-001",
    name: "Premium T-Shirt",
    type: "tshirt",
    basePrice: 24.99,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80",
    variants: [
      { id: 101, name: "S / Black", price: 24.99, size: "S", color: "Black" },
      { id: 102, name: "M / Black", price: 24.99, size: "M", color: "Black" },
      { id: 103, name: "L / Black", price: 24.99, size: "L", color: "Black" },
      { id: 104, name: "XL / Black", price: 24.99, size: "XL", color: "Black" },
      { id: 105, name: "S / White", price: 24.99, size: "S", color: "White" },
      { id: 106, name: "M / White", price: 24.99, size: "M", color: "White" },
      { id: 107, name: "L / White", price: 24.99, size: "L", color: "White" },
      { id: 108, name: "XL / White", price: 24.99, size: "XL", color: "White" },
    ],
  },
  mug: {
    id: "mug-001",
    name: "Ceramic Mug",
    type: "mug",
    basePrice: 14.99,
    imageUrl:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500&q=80",
    variants: [
      {
        id: 201,
        name: "11oz / White",
        price: 14.99,
        size: "11oz",
        color: "White",
      },
      {
        id: 202,
        name: "15oz / White",
        price: 16.99,
        size: "15oz",
        color: "White",
      },
      {
        id: 203,
        name: "11oz / Black",
        price: 15.99,
        size: "11oz",
        color: "Black",
      },
      {
        id: 204,
        name: "15oz / Black",
        price: 17.99,
        size: "15oz",
        color: "Black",
      },
    ],
  },
  poster: {
    id: "poster-001",
    name: "Premium Poster",
    type: "poster",
    basePrice: 19.99,
    imageUrl:
      "https://images.unsplash.com/photo-1601599963565-b7f49deb352a?w=500&q=80",
    variants: [
      { id: 301, name: "12×18 inches", price: 19.99, size: "12×18" },
      { id: 302, name: "18×24 inches", price: 24.99, size: "18×24" },
      { id: 303, name: "24×36 inches", price: 29.99, size: "24×36" },
    ],
  },
  hoodie: {
    id: "hoodie-001",
    name: "Premium Hoodie",
    type: "hoodie",
    basePrice: 39.99,
    imageUrl:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80",
    variants: [
      { id: 401, name: "S / Black", price: 39.99, size: "S", color: "Black" },
      { id: 402, name: "M / Black", price: 39.99, size: "M", color: "Black" },
      { id: 403, name: "L / Black", price: 39.99, size: "L", color: "Black" },
      { id: 404, name: "XL / Black", price: 39.99, size: "XL", color: "Black" },
      { id: 405, name: "S / Gray", price: 39.99, size: "S", color: "Gray" },
      { id: 406, name: "M / Gray", price: 39.99, size: "M", color: "Gray" },
      { id: 407, name: "L / Gray", price: 39.99, size: "L", color: "Gray" },
      { id: 408, name: "XL / Gray", price: 39.99, size: "XL", color: "Gray" },
    ],
  },
};

// Function to set the Printful API key
export const setPrintfulApiKey = async (apiKey: string): Promise<boolean> => {
  try {
    // Validate the API key with Printful
    const response = await fetch("https://api.printful.com/store", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (response.ok) {
      // Store the API key if valid
      PRINTFUL_API_KEY = apiKey;
      localStorage.setItem("printful_api_key", apiKey);
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error validating Printful API key:", error);
    return false;
  }
};

// Function to get the current Printful API key
export const getPrintfulApiKey = (): string => {
  // Try to get from localStorage first
  const storedKey = localStorage.getItem("printful_api_key");
  if (storedKey) {
    PRINTFUL_API_KEY = storedKey;
    return storedKey;
  }
  return PRINTFUL_API_KEY;
};

// Function to check if an image fits well on a product
export const checkImageFit = (
  imageWidth: number,
  imageHeight: number,
  productType: string,
): "good" | "warning" | "error" => {
  // Get product dimensions
  const dimensions = productDimensions[productType];
  if (!dimensions) return "error";

  // Calculate aspect ratio
  const imageRatio = imageWidth / imageHeight;
  const productRatio = dimensions.width / dimensions.height;

  // Calculate ratio difference
  const ratioDifference = Math.abs(imageRatio - productRatio);

  // Check image resolution
  const minDpi = 150; // Minimum DPI for good quality printing
  const imageDpi = Math.min(
    imageWidth / (dimensions.width / 300),
    imageHeight / (dimensions.height / 300),
  );

  if (imageDpi < minDpi) {
    return "error";
  } else if (ratioDifference > 0.2) {
    return "warning";
  } else {
    return "good";
  }
};

// Function to fix image for a specific product
export const fixImageForProduct = async (
  imageUrl: string,
  productType: string,
): Promise<string> => {
  // In a real implementation, this would call an AI service to adjust the image
  // For now, we'll simulate the process with a timeout

  return new Promise((resolve) => {
    setTimeout(() => {
      // Return the same image for now, in a real implementation this would be a modified image
      resolve(imageUrl);
    }, 1500);
  });
};

// Function to get product variants from Printful
export const getProductVariants = async (
  productId: string,
): Promise<ProductVariant[]> => {
  try {
    // In a real implementation, this would call the Printful API
    // For now, we'll return mock data from our catalog
    const productType = productId.split("-")[0]; // Extract product type from ID
    const product = productCatalog[productType];

    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    return product.variants;
  } catch (error) {
    console.error("Error fetching product variants:", error);
    throw error;
  }
};

// Function to create a mockup in Printful
export const createMockup = async (
  productId: string,
  variantId: number,
  imageUrl: string,
) => {
  try {
    // In a real implementation, this would call the Printful API
    // For now, we'll return mock data
    const productType = productId.split("-")[0]; // Extract product type from ID
    const product = productCatalog[productType];

    if (!product) {
      throw new Error(`Product not found: ${productId}`);
    }

    return {
      result: {
        mockup_url: product.imageUrl,
        preview_url: imageUrl,
      },
    };
  } catch (error) {
    console.error("Error creating mockup:", error);
    throw error;
  }
};

// Function to authenticate with Printful API
export const authenticatePrintful = async (
  apiKey: string = PRINTFUL_API_KEY,
): Promise<AuthStatus> => {
  try {
    // In a real implementation, this would validate the API key with Printful API
    // For now, we'll simulate the process with a basic validation

    // Check if API key is provided and has the correct format
    if (!apiKey || apiKey.trim() === "") {
      return {
        authenticated: false,
        message: "API key is required",
      };
    }

    // Simple format validation (this is just an example, real validation would be different)
    if (apiKey.length < 20) {
      return {
        authenticated: false,
        message: "Invalid API key format",
      };
    }

    // If we reach here, consider the key valid for demo purposes
    // Store the API key for future use
    setPrintfulApiKey(apiKey);

    return {
      authenticated: true,
      message: "Successfully authenticated with Printful",
    };
  } catch (error) {
    console.error("Error authenticating with Printful:", error);
    return {
      authenticated: false,
      message:
        "Authentication failed: " +
        (error instanceof Error ? error.message : "Unknown error"),
    };
  }
};

// Function to get product details
export const getProductDetails = (productType: string): Product | null => {
  return productCatalog[productType] || null;
};
