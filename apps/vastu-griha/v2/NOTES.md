# Vastu Griha consolidation notes

Phase 1 extraction log for mobile-only pieces that should remain out of the
core routing tree for now:

- North-alignment screen ±15° controls + "Auto Detect North"
  - Intended home: the upload / calibration flow inside `PlannerWorkspace`
  - Reason: this is part of sketch alignment, not the dashboard or planner canvas

- Full-layout 2D/3D preview screen concept
  - Intended home: the workspace preview / report flow inside `PlannerWorkspace`
  - Reason: this is a view-state concept, not a separate mobile shell

- Mobile save form project description field
  - Intended home: the project creation / edit form in `ProjectDashboard`
  - Reason: this is project metadata, not planner behavior

Nothing is implemented here yet. This file is only a consolidation note so the
pieces are not lost while the architecture is normalized.
