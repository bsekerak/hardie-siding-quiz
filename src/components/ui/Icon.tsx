import {
  ArrowLeft,
  ArrowRight,
  Blocks,
  Check,
  CircleDollarSign,
  CircleHelp,
  ClipboardCheck,
  CloudHail,
  CloudLightning,
  Columns3,
  Download,
  FileQuestion,
  Flame,
  Grid2x2,
  Hammer,
  House,
  Landmark,
  Layers,
  Layers2,
  LayoutPanelTop,
  Mail,
  MapPin,
  PaintBucket,
  Palette,
  PiggyBank,
  Receipt,
  RotateCcw,
  Ruler,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Timer,
  TreePine,
  TrendingUp,
  TriangleAlert,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

/**
 * Explicit registry rather than a dynamic import, so every icon referenced by
 * the data layer is statically verifiable and tree-shaken correctly.
 */
const ICONS = {
  ArrowLeft,
  ArrowRight,
  Blocks,
  Check,
  CircleDollarSign,
  CircleHelp,
  ClipboardCheck,
  CloudHail,
  CloudLightning,
  Columns3,
  Download,
  FileQuestion,
  Flame,
  Grid2x2,
  Hammer,
  House,
  Landmark,
  Layers,
  Layers2,
  LayoutPanelTop,
  Mail,
  MapPin,
  PaintBucket,
  Palette,
  PiggyBank,
  Receipt,
  RotateCcw,
  Ruler,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Snowflake,
  Sparkles,
  Timer,
  TreePine,
  TrendingUp,
  TriangleAlert,
  Wrench,
  X,
} as const satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export function isIconName(value: string): value is IconName {
  return Object.prototype.hasOwnProperty.call(ICONS, value);
}

interface IconProps {
  name: string;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, className, strokeWidth = 1.75 }: IconProps) {
  if (!isIconName(name)) return null;
  const Component = ICONS[name];
  return <Component className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
