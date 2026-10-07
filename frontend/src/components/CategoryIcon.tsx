import React from "react";
import {
  Waves,
  Home,
  Castle,
  Flame,
  Ship,
  Mountain,
  Sparkles,
  Trees,
  Compass,
  Sun,
  Sunset,
  Snowflake,
  Wifi,
  Laptop,
  Car,
  Bath,
  Wind,
  Utensils,
  Eye,
  Zap,
  Shirt,
  Palmtree,
  HelpCircle,
} from "lucide-react";

interface CategoryIconProps {
  name: string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = "w-6 h-6" }) => {
  switch (name.toLowerCase()) {
    case "waves":
    case "beachfront":
      return <Waves className={className} />;
    case "home":
    case "cabins":
      return <Home className={className} />;
    case "castle":
    case "mansions":
      return <Castle className={className} />;
    case "flame":
    case "trending":
      return <Flame className={className} />;
    case "ship":
    case "lakefront":
      return <Ship className={className} />;
    case "mountain":
    case "amazing views":
      return <Mountain className={className} />;
    case "sparkles":
    case "luxe":
      return <Sparkles className={className} />;
    case "trees":
    case "treehouses":
      return <Trees className={className} />;
    case "compass":
    case "tiny homes":
      return <Compass className={className} />;
    case "sun":
    case "countryside":
      return <Sun className={className} />;
    case "sunset":
    case "desert":
      return <Sunset className={className} />;
    case "snowflake":
    case "skiing":
      return <Snowflake className={className} />;
    case "wifi":
      return <Wifi className={className} />;
    case "laptop":
      return <Laptop className={className} />;
    case "car":
      return <Car className={className} />;
    case "bath":
      return <Bath className={className} />;
    case "wind":
      return <Wind className={className} />;
    case "utensils":
      return <Utensils className={className} />;
    case "eye":
      return <Eye className={className} />;
    case "zap":
      return <Zap className={className} />;
    case "shirt":
      return <Shirt className={className} />;
    case "palmtree":
      return <Palmtree className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};
