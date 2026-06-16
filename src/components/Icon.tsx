import {
  Home,
  Compass,
  Sparkles,
  ShieldAlert,
  User,
  Car,
  Waves,
  Landmark,
  TreePalm,
  Church,
  BedDouble,
  UtensilsCrossed,
  UserRound,
  Languages,
  ShoppingBag,
  Users,
  MapPinned,
  Sun,
  CloudSun,
  Star,
  MapPin,
  Search,
  Bell,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Home,
  Compass,
  Sparkles,
  ShieldAlert,
  User,
  Car,
  Waves,
  Landmark,
  TreePalm,
  Church,
  BedDouble,
  UtensilsCrossed,
  UserRound,
  Languages,
  ShoppingBag,
  Users,
  MapPinned,
  Sun,
  CloudSun,
  Star,
  MapPin,
  Search,
  Bell,
  ChevronRight,
};

export function Icon({
  name,
  className,
  strokeWidth,
}: {
  name: string;
  className?: string;
  strokeWidth?: number;
}) {
  const Cmp = icons[name] ?? Compass;
  return <Cmp className={className} strokeWidth={strokeWidth} />;
}
