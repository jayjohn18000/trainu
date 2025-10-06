import { useRouter, usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Calendar, MessageSquare } from "lucide-react";
import { ScreenReaderOnly } from "./system/ScreenReaderOnly";

type MainTab = "dashboard" | "schedule" | "communication";

interface SubTab {
  label: string;
  path: string;
  roles?: string[];
}

interface TabNavigationProps {
  isMobile?: boolean;
  onNavigate?: () => void;
}

const mainTabs: { value: MainTab; label: string; icon: typeof LayoutDashboard }[] = [
  { value: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { value: "schedule", label: "Schedule", icon: Calendar },
  { value: "communication", label: "Communication", icon: MessageSquare },
];

const subTabs: Record<MainTab, SubTab[]> = {
  dashboard: [
    { label: "Overview", path: "/dashboard/client", roles: ["client"] },
    { label: "Discover", path: "/dashboard/discover", roles: ["client"] },
    { label: "Overview", path: "/dashboard/trainer", roles: ["trainer"] },
    { label: "Overview", path: "/dashboard/gym-admin", roles: ["gym_admin"] },
  ],
  schedule: [
    { label: "Calendar", path: "/dashboard/calendar" },
    { label: "Events", path: "/dashboard/community/events", roles: ["client"] },
    { label: "Clients", path: "/dashboard/clients", roles: ["trainer", "gym_admin"] },
    { label: "Workouts", path: "/dashboard/workout", roles: ["client"] },
    { label: "Programs", path: "/dashboard/programs", roles: ["trainer", "gym_admin"] },
    { label: "Progress", path: "/dashboard/progress", roles: ["client"] },
  ],
  communication: [
    { label: "Messages", path: "/dashboard/messages" },
    { label: "People", path: "/dashboard/community/people" },
    { label: "Groups", path: "/dashboard/community/groups" },
  ],
};

export function TabNavigation({ isMobile = false, onNavigate }: TabNavigationProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Determine active main tab based on current path
  const getActiveMainTab = (): MainTab => {
    const path = pathname;
    // Check schedule routes first (more specific)
    if (
      path.startsWith("/dashboard/calendar") ||
      path.startsWith("/dashboard/workout") ||
      path.startsWith("/dashboard/progress") ||
      path.startsWith("/dashboard/clients") ||
      path.startsWith("/dashboard/programs") ||
      path.startsWith("/dashboard/community/events")
    )
      return "schedule";
    // Check communication routes
    if (
      path.startsWith("/dashboard/messages") ||
      path.startsWith("/dashboard/community/people") ||
      path.startsWith("/dashboard/community/groups")
    )
      return "communication";
    // Default to dashboard (includes /dashboard, /dashboard/client, /dashboard/trainer, /dashboard/discover)
    return "dashboard";
  };

  const activeMainTab = getActiveMainTab();

  // Get visible subtabs for current main tab and user role
  const getVisibleSubTabs = (tab: MainTab): SubTab[] => {
    return subTabs[tab].filter(
      (subTab) => !subTab.roles || subTab.roles.includes(user?.role || "client")
    );
  };

  const visibleSubTabs = getVisibleSubTabs(activeMainTab);
  const isActiveSubTab = (path: string) => pathname === path;

  const handleMainTabChange = (value: string) => {
    const mainTab = value as MainTab;
    const firstSubTab = getVisibleSubTabs(mainTab)[0];
    if (firstSubTab) {
      router.push(firstSubTab.path);
      onNavigate?.();
    }
  };

  const handleSubTabClick = (path: string) => {
    router.push(path);
    onNavigate?.();
  };

  // Mobile bottom navigation
  if (isMobile) {
    return (
      <nav 
        className="flex justify-around items-center h-16 px-2"
        role="navigation"
        aria-label="Main navigation"
      >
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeMainTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => handleMainTabChange(tab.value)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all min-h-[44px] min-w-[44px]",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
              aria-label={tab.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    );
  }

  // Desktop navigation
  return (
    <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="px-4 sm:px-6">
        {/* Main Tabs */}
        <Tabs value={activeMainTab} onValueChange={handleMainTabChange}>
          <TabsList className="h-12 bg-transparent border-0 rounded-none p-0 gap-4 sm:gap-6">
            {mainTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 pt-3 font-semibold min-h-[44px]"
                aria-label={tab.label}
              >
                {tab.label}
                <ScreenReaderOnly>
                  {activeMainTab === tab.value ? " (current)" : ""}
                </ScreenReaderOnly>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Sub Tabs */}
        <div className="flex gap-4 sm:gap-6 mt-2 pb-2 overflow-x-auto">
          {visibleSubTabs.map((subTab) => (
            <button
              key={subTab.path}
              onClick={() => handleSubTabClick(subTab.path)}
              className={cn(
                "text-sm font-medium transition-colors pb-2 border-b-2 border-transparent whitespace-nowrap min-h-[44px]",
                isActiveSubTab(subTab.path)
                  ? "text-primary border-primary"
                  : "text-muted-foreground hover:text-foreground focus-visible:text-foreground"
              )}
              aria-label={subTab.label}
              aria-current={isActiveSubTab(subTab.path) ? "page" : undefined}
            >
              {subTab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
