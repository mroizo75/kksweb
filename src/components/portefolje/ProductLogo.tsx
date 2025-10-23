"use client";

import { useState } from "react";
import { 
  ShieldCheck, 
  Calendar, 
  CheckSquare, 
  Globe, 
  Users, 
  Zap, 
  Sparkles,
  Car
} from "lucide-react";

interface ProductLogoProps {
  logo?: string;
  name: string;
  iconName: string;
}

const iconMap = {
  ShieldCheck,
  Calendar,
  CheckSquare,
  Globe,
  Users,
  Zap,
  Sparkles,
  Car,
};

export function ProductLogo({ logo, name, iconName }: ProductLogoProps) {
  const [imageError, setImageError] = useState(false);
  const Icon = iconMap[iconName as keyof typeof iconMap] || ShieldCheck;

  if (!logo || imageError) {
    return (
      <div className="w-32 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center border-2 border-primary/20">
        <Icon className="h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="w-32 h-16 rounded-xl overflow-hidden bg-white dark:bg-gray-800 border-2 border-primary/20 flex items-center justify-center p-3">
      <img 
        src={logo} 
        alt={`${name} logo`}
        className="w-full h-full object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  );
}

