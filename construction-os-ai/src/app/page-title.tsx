import * as React from "react";

interface PageTitleContextValue {
  title: string;
  setTitle: (title: string) => void;
}

const PageTitleContext = React.createContext<PageTitleContextValue | null>(null);

export function PageTitleProvider({ children }: { children: React.ReactNode }) {
  const [title, setTitle] = React.useState("ConstructionOS AI");
  const value = React.useMemo(() => ({ title, setTitle }), [title]);
  return <PageTitleContext.Provider value={value}>{children}</PageTitleContext.Provider>;
}

export function usePageTitleContext() {
  const ctx = React.useContext(PageTitleContext);
  if (!ctx) throw new Error("usePageTitleContext must be used within a PageTitleProvider");
  return ctx;
}

export function usePageTitle(title: string) {
  const { setTitle } = usePageTitleContext();
  React.useEffect(() => {
    setTitle(title);
    document.title = `${title} · ConstructionOS AI`;
  }, [title, setTitle]);
}
