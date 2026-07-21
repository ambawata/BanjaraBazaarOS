import { NavLink } from "react-router-dom";
import {
  Building2,
  LayoutDashboard,
  FolderKanban,
  Calculator,
  Boxes,
  Compass,
  Store,
  Sparkles,
  ScanLine,
  Wrench,
  ClipboardList,
  Palette,
  TrendingUp,
  Settings as SettingsIcon,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  to?: string;
  icon: LucideIcon;
  comingSoon?: boolean;
  badge?: string;
}

const primaryNav: NavItem[] = [
  { label: "Home", to: "/", icon: LayoutDashboard },
  { label: "Projects", to: "/projects", icon: FolderKanban },
];

// Roadmap items with a `to` link to a /preview/* route render as a real,
// clickable link with a "Preview" badge — a static, sample-data-only screen
// so build direction can be reviewed before real implementation. Items
// without `to` (like BOQ Export) stay locked with a "Soon" badge, unchanged.
const roadmapNav: NavItem[] = [
  { label: "AI Civil Engineer", icon: Sparkles, to: "/preview/ai-civil-engineer", badge: "Preview" },
  { label: "AI Floor Plan Analysis", icon: ScanLine, to: "/preview/floor-plan-ai", badge: "Preview" },
  { label: "MEP & Finishing", icon: Wrench, to: "/preview/mep-finishing", badge: "Preview" },
  { label: "BOQ Export", icon: Calculator, comingSoon: true },
  { label: "Material Management", icon: Boxes, to: "/preview/materials", badge: "Preview" },
  { label: "Site Diary", icon: ClipboardList, to: "/preview/site-diary", badge: "Preview" },
  { label: "Interior Designer", icon: Palette, to: "/preview/interior-designer", badge: "Preview" },
  { label: "Vastu Studio", icon: Compass, to: "/preview/vastu-studio", badge: "Preview" },
  { label: "AI Predictions", icon: TrendingUp, to: "/preview/ai-predictions", badge: "Preview" },
  { label: "Marketplace", icon: Store, to: "/preview/marketplace", badge: "Preview" },
  { label: "Settings", icon: SettingsIcon, to: "/preview/settings", badge: "Preview" },
];

function NavRow({ item }: { item: NavItem }) {
  if (!item.to) {
    return (
      <div className="flex cursor-not-allowed items-center gap-3 rounded-control px-3 py-2.5 text-sm text-black/30 dark:text-white/25">
        <item.icon className="size-[18px]" />
        <span className="flex-1">{item.label}</span>
        <span className="rounded-full bg-black/[0.04] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-black/35 dark:bg-white/5 dark:text-white/30">
          Soon
        </span>
      </div>
    );
  }

  if (item.badge) {
    return (
      <NavLink
        to={item.to}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors",
            isActive
              ? "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200"
              : "text-black/50 hover:bg-black/[0.04] hover:text-black/80 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white/75",
          )
        }
      >
        <item.icon className="size-[18px]" />
        <span className="flex-1">{item.label}</span>
        <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary-600 dark:bg-primary-500/15 dark:text-primary-300">
          {item.badge}
        </span>
      </NavLink>
    );
  }

  return (
    <NavLink
      to={item.to}
      end={item.to === "/"}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-control px-3 py-2.5 text-sm font-medium transition-colors",
          isActive
            ? "bg-primary-50 text-primary-700 dark:bg-primary-500/15 dark:text-primary-200"
            : "text-black/60 hover:bg-black/[0.04] hover:text-black/90 dark:text-white/55 dark:hover:bg-white/5 dark:hover:text-white/90",
        )
      }
    >
      <item.icon className="size-[18px]" />
      {item.label}
    </NavLink>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-black/[0.06] bg-white/70 px-4 py-6 backdrop-blur-xl md:flex dark:border-white/[0.06] dark:bg-white/[0.02]">
      <div className="mb-8 flex items-center gap-2.5 px-2">
        <div className="flex size-9 items-center justify-center rounded-xl bg-primary-500 text-white shadow-soft">
          <Building2 className="size-5" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold leading-tight tracking-tight">
            ConstructionOS
          </p>
          <p className="text-[11px] font-medium leading-tight text-primary-500">AI</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {primaryNav.map((item) => (
          <NavRow key={item.label} item={item} />
        ))}
      </nav>

      <p className="mb-2 mt-8 px-3 text-[11px] font-semibold uppercase tracking-wider text-black/30 dark:text-white/25">
        On the roadmap
      </p>
      <nav className="flex flex-col gap-1">
        {roadmapNav.map((item) => (
          <NavRow key={item.label} item={item} />
        ))}
      </nav>
    </aside>
  );
}
