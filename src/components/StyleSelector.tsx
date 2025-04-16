import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Style {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
}

interface StyleSelectorProps {
  onStyleSelect?: (style: Style) => void;
  selectedStyleId?: string;
}

const StyleSelector = ({
  onStyleSelect = () => {},
  selectedStyleId = "",
}: StyleSelectorProps) => {
  // Simplified to just use all styles in a single horizontal list
  const allStyles: Style[] = [
    {
      id: "cinematic",
      name: "Cinematic",
      description: "Professional movie-like quality with dramatic lighting",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=500&q=80",
    },
    {
      id: "anime_portrait",
      name: "Anime Portrait",
      description: "Stylized anime character portrait with vibrant colors",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80",
    },
    {
      id: "3d_cartoon",
      name: "3D Cartoon",
      description: "Modern 3D cartoon character with smooth textures",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1608889825205-eebdb9fc5806?w=500&q=80",
    },
    {
      id: "pixel_art",
      name: "Pixel Art",
      description: "Retro-style pixel art reminiscent of classic video games",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1550063873-ab792950096b?w=500&q=80",
    },
    {
      id: "fantasy_portrait",
      name: "Fantasy Portrait",
      description: "Magical fantasy character with ethereal elements",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1535063406830-27e2e39eee77?w=500&q=80",
    },
    {
      id: "oil_painting",
      name: "Oil Painting",
      description: "Classical oil painting style with rich textures",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=500&q=80",
    },
    {
      id: "comic_book",
      name: "Comic Book",
      description: "Bold outlines and vibrant colors in comic book style",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1612036782180-6f0822045d23?w=500&q=80",
    },
    {
      id: "neon_punk",
      name: "Neon Punk",
      description: "Cyberpunk aesthetic with vibrant neon colors",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1558470598-a5dda9640f68?w=500&q=80",
    },
    {
      id: "pop_art",
      name: "Pop Art",
      description: "Bold colors and patterns inspired by pop art movement",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1579541591970-e5cf87198e78?w=500&q=80",
    },
    {
      id: "ghibli",
      name: "Studio Ghibli",
      description: "Whimsical, detailed anime style with rich colors",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1563089145-599997674d42?w=500&q=80",
    },
    {
      id: "minimalist",
      name: "Minimalist",
      description: "Stripped down to its essential elements",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1552083974-186346191183?w=500&q=80",
    },
    {
      id: "watercolor",
      name: "Watercolor",
      description: "Delicate, transparent washes with visible brushstrokes",
      thumbnailUrl:
        "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=500&q=80",
    },
  ];

  const handleStyleClick = (style: Style) => {
    onStyleSelect(style);
  };

  return (
    <div className="w-full bg-white py-8 px-4 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-medium mb-6 text-gray-900">Choose a Style</h2>

      <ScrollArea className="w-full pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pb-4">
          {allStyles.map((style) => (
            <TooltipProvider key={style.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={`flex flex-col cursor-pointer transition-all duration-200 ${
                      selectedStyleId === style.id
                        ? "scale-105 ring-2 ring-purple-500"
                        : "hover:scale-105"
                    }`}
                    onClick={() => handleStyleClick(style)}
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-50">
                      <img
                        src={style.thumbnailUrl}
                        alt={style.name}
                        className="object-cover w-full h-full"
                      />
                      {selectedStyleId === style.id && (
                        <div className="absolute inset-0 bg-purple-500/10 flex items-center justify-center">
                          <div className="bg-white rounded-full p-1 shadow-md">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-purple-500"
                            >
                              <path d="M20 6 9 17l-5-5" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 text-sm font-medium text-center text-gray-800">
                      {style.name}
                    </p>
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  className="max-w-xs bg-white shadow-lg border border-gray-100 p-3"
                >
                  <div>
                    <p className="font-semibold text-gray-900">{style.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {style.description}
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default StyleSelector;
