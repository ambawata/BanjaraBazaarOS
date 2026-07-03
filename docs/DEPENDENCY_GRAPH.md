# Dependency Graph — Vastu Griha

Audit date: 2026-07-03

```mermaid
graph TD
  App["App.jsx"]
  UI["uiStore"]
  Projects["projectStore"]
  Canvas["canvasStore"]
  History["historyStore"]

  Dashboard["ProjectDashboard.jsx"]
  Wizard["OnboardingWizard.jsx"]
  Planner["PlannerWorkspace.jsx"]

  Analysis["AnalysisPanel.jsx"]
  Report["ReportGenerator.jsx"]
  Chat["AiChat.jsx"]
  Editor["Canvas.jsx"]
  Shop["BanjaraBazaarShop.jsx"]
  Assets["AssetGallery.jsx"]
  Upload["FloorPlanUpload.jsx"]
  Plot["PlotConfig.jsx"]
  Boundary["PlotBoundaryDrawer.jsx"]
  Compass["Compass.jsx"]

  App --> UI
  App --> Canvas
  App --> Dashboard
  App --> Wizard
  App --> Planner

  Dashboard --> Projects
  Dashboard --> UI
  Dashboard --> Canvas

  Wizard --> UI
  Wizard --> Projects
  Wizard --> Canvas
  Wizard --> Compass

  Planner --> UI
  Planner --> Projects
  Planner --> Canvas
  Planner --> History
  Planner --> Analysis
  Planner --> Report
  Planner --> Chat
  Planner --> Shop
  Planner --> Assets
  Planner --> Plot
  Planner --> Boundary
  Planner --> Compass

  Editor --> Canvas
  Editor --> Projects
  Editor --> Analysis
  Report --> Analysis
  Chat --> Analysis
  Shop --> Analysis
  Assets --> Canvas
  Upload --> Canvas
  Plot --> UI
  Boundary --> UI
  Compass --> UI
```

## Readable summary

- `App.jsx` is the only top-level router.
- `ProjectDashboard.jsx` is the startup project list and launcher.
- `OnboardingWizard.jsx` seeds a layout and hands off to the planner.
- `PlannerWorkspace.jsx` is the main editor shell.
- `AnalysisPanel.jsx` is the canonical analysis engine shared by the editor, reports, and chat.
- `canvasStore` is the persistence boundary for layouts.
- `projectStore` is the persistence boundary for project lists.

