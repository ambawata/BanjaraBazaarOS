import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, Moon, Sun, User } from "lucide-react";
import { useAuth } from "@/features/auth/auth-context";
import { useOrganization } from "@/features/organizations/use-organization";
import { useTheme } from "@/app/theme-provider";
import { cn } from "@/lib/utils";

export function Topbar({ title }: { title: string }) {
  const { user, signOut } = useAuth();
  const { data: organization } = useOrganization();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-black/[0.06] bg-white/70 px-6 backdrop-blur-xl dark:border-white/[0.06] dark:bg-[#0b0b0e]/70">
      <div>
        <h1 className="font-display text-lg font-semibold tracking-tight">{title}</h1>
        {organization && (
          <p className="text-xs text-black/45 dark:text-white/40">{organization.name}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="flex size-9 items-center justify-center rounded-full text-black/55 transition-colors hover:bg-black/[0.05] dark:text-white/55 dark:hover:bg-white/10"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </button>

        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="flex size-9 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700 transition-transform hover:scale-105 dark:bg-primary-500/20 dark:text-primary-200"
            >
              {(user?.user_metadata?.full_name as string | undefined)?.[0]?.toUpperCase() ??
                user?.email?.[0]?.toUpperCase() ?? <User className="size-4" />}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className={cn(
                "z-50 w-56 rounded-card border border-black/[0.06] bg-white p-1.5 shadow-lifted dark:border-white/[0.08] dark:bg-[#141419]",
              )}
            >
              <div className="px-3 py-2">
                <p className="truncate text-sm font-medium">
                  {(user?.user_metadata?.full_name as string | undefined) ?? "Your account"}
                </p>
                <p className="truncate text-xs text-black/45 dark:text-white/40">{user?.email}</p>
              </div>
              <DropdownMenu.Separator className="my-1 h-px bg-black/[0.06] dark:bg-white/[0.08]" />
              <DropdownMenu.Item
                onSelect={() => void signOut()}
                className="flex cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-sm text-danger outline-none data-[highlighted]:bg-danger/10"
              >
                <LogOut className="size-4" />
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
