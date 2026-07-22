import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { PageTitleProvider, usePageTitleContext } from "@/app/page-title";

function AppShellBody() {
  const { title } = usePageTitleContext();

  return (
    <div className="flex min-h-svh bg-canvas dark:bg-canvas-dark">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} />
        <main className="flex-1 px-6 py-8 md:px-10">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export function AppShell() {
  return (
    <PageTitleProvider>
      <AppShellBody />
    </PageTitleProvider>
  );
}
