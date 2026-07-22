import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "@/app/theme-provider";
import { AuthProvider } from "@/features/auth/auth-context";
import { ProtectedRoute } from "@/app/protected-route";
import { AppShell } from "@/components/layout/AppShell";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { SignupPage } from "@/features/auth/pages/SignupPage";
import { HomePage } from "@/features/dashboard/pages/HomePage";
import { ProjectsListPage } from "@/features/projects/pages/ProjectsListPage";
import { ProjectDetailPage } from "@/features/projects/pages/ProjectDetailPage";
import { FloorPlanAiPreview } from "@/features/preview/pages/FloorPlanAiPreview";
import { MepFinishingPreview } from "@/features/preview/pages/MepFinishingPreview";
import { MaterialManagementPreview } from "@/features/preview/pages/MaterialManagementPreview";
import { SiteDiaryPreview } from "@/features/preview/pages/SiteDiaryPreview";
import { AiCivilEngineerPreview } from "@/features/preview/pages/AiCivilEngineerPreview";
import { InteriorDesignerPreview } from "@/features/preview/pages/InteriorDesignerPreview";
import { VastuStudioPreview } from "@/features/preview/pages/VastuStudioPreview";
import { AiPredictionsPreview } from "@/features/preview/pages/AiPredictionsPreview";
import { MarketplacePreview } from "@/features/preview/pages/MarketplacePreview";
import { SettingsPreview } from "@/features/preview/pages/SettingsPreview";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppShell />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/projects" element={<ProjectsListPage />} />
                  <Route path="/projects/:projectId" element={<ProjectDetailPage />} />

                  {/* Preview-only routes: static sample data, no Supabase wiring. See src/features/preview. */}
                  <Route path="/preview/floor-plan-ai" element={<FloorPlanAiPreview />} />
                  <Route path="/preview/mep-finishing" element={<MepFinishingPreview />} />
                  <Route path="/preview/materials" element={<MaterialManagementPreview />} />
                  <Route path="/preview/site-diary" element={<SiteDiaryPreview />} />
                  <Route path="/preview/ai-civil-engineer" element={<AiCivilEngineerPreview />} />
                  <Route path="/preview/interior-designer" element={<InteriorDesignerPreview />} />
                  <Route path="/preview/vastu-studio" element={<VastuStudioPreview />} />
                  <Route path="/preview/ai-predictions" element={<AiPredictionsPreview />} />
                  <Route path="/preview/marketplace" element={<MarketplacePreview />} />
                  <Route path="/preview/settings" element={<SettingsPreview />} />
                </Route>
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
