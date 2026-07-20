// Area / Structural / Cost engine (Modules 5, 6, 9).
//
// Deterministic, pure functions: given a project's own fields, a handful of
// user-editable assumptions, and material rates, compute every derived
// quantity and cost. Nothing here talks to the network — that's the point:
// the same numbers can be recomputed live as soon as an input changes, and
// every line carries the formula that produced it ("explain itself").
//
// The per-sq-ft structural thumb rules (cement/steel/sand/aggregate) and the
// default material rates are rough, widely-used estimation constants for a
// standard RCC-framed residential structure in India — not a substitute for
// a structural engineer's BOQ. They're deliberately all editable.

import type { MaterialKey } from "@/types/database";

export interface EstimateAssumptions {
  floorHeightFt: number;
  doorCount: number;
  windowCount: number;
  labourCostPct: number;
  machineCostPct: number;
  transportCostPct: number;
  contingencyPct: number;
  gstPct: number;
  contractorMarginPct: number;
}

export const DEFAULT_ASSUMPTIONS: EstimateAssumptions = {
  floorHeightFt: 10,
  doorCount: 0,
  windowCount: 0,
  labourCostPct: 35,
  machineCostPct: 5,
  transportCostPct: 4,
  contingencyPct: 5,
  gstPct: 18,
  contractorMarginPct: 10,
};

export interface ProjectAreaInputs {
  builtUpAreaSqft: number;
  floorsAboveGround: number;
  hasBasement: boolean;
  basementCount: number;
}

// Standard single-shutter door / window openings, used to net out wall,
// paint and plaster area.
const DOOR_AREA_SQFT = 21; // 3 ft x 7 ft
const WINDOW_AREA_SQFT = 15; // 5 ft x 3 ft
const OPENINGS_DOUBLE_FACE = 2; // wall area is counted on both faces

export interface Line {
  key: string;
  label: string;
  value: number;
  unit: string;
  formula: string;
}

export interface AreaBreakdown {
  floorsCount: number;
  perFloorAreaSqft: number;
  perimeterFt: number;
  builtUpAreaSqft: number;
  carpetAreaSqft: number;
  wallAreaSqft: number;
  paintAreaSqft: number;
  plasterAreaSqft: number;
  tileAreaSqft: number;
  ceilingAreaSqft: number;
  roofAreaSqft: number;
  doorAreaSqft: number;
  windowAreaSqft: number;
  lines: Line[];
}

const CARPET_EFFICIENCY = 0.75;

export function computeAreaBreakdown(
  project: ProjectAreaInputs,
  assumptions: EstimateAssumptions,
): AreaBreakdown {
  const builtUpAreaSqft = Math.max(project.builtUpAreaSqft, 0);
  const floorsCount = Math.max(
    project.floorsAboveGround + (project.hasBasement ? project.basementCount : 0),
    1,
  );
  const perFloorAreaSqft = builtUpAreaSqft / floorsCount;
  // Rough footprint assumption: a near-square plan, since exact wall
  // geometry isn't available until the AI floor plan analyzer (Module 4)
  // lands. perimeter = 4 x sqrt(area) is the standard thumb-rule stand-in.
  const perimeterFt = 4 * Math.sqrt(Math.max(perFloorAreaSqft, 0));

  const openingsAreaSqft = assumptions.doorCount * DOOR_AREA_SQFT + assumptions.windowCount * WINDOW_AREA_SQFT;
  const grossWallAreaSqft = perimeterFt * assumptions.floorHeightFt * floorsCount;
  const wallAreaSqft = Math.max(grossWallAreaSqft - openingsAreaSqft, 0);

  const carpetAreaSqft = builtUpAreaSqft * CARPET_EFFICIENCY;
  const ceilingAreaSqft = builtUpAreaSqft;
  const roofAreaSqft = perFloorAreaSqft;
  const paintAreaSqft = wallAreaSqft * OPENINGS_DOUBLE_FACE + ceilingAreaSqft;
  const plasterAreaSqft = wallAreaSqft * OPENINGS_DOUBLE_FACE;
  const tileAreaSqft = carpetAreaSqft;
  const doorAreaSqft = assumptions.doorCount * DOOR_AREA_SQFT;
  const windowAreaSqft = assumptions.windowCount * WINDOW_AREA_SQFT;

  const lines: Line[] = [
    { key: "builtUp", label: "Built-up area", value: builtUpAreaSqft, unit: "sq ft", formula: "From project details" },
    {
      key: "carpet",
      label: "Carpet area",
      value: carpetAreaSqft,
      unit: "sq ft",
      formula: `Built-up × ${Math.round(CARPET_EFFICIENCY * 100)}% (usable-space thumb rule)`,
    },
    {
      key: "wall",
      label: "Wall area",
      value: wallAreaSqft,
      unit: "sq ft",
      formula: `Perimeter (${perimeterFt.toFixed(0)} ft) × height (${assumptions.floorHeightFt} ft) × ${floorsCount} floor(s) - openings`,
    },
    { key: "paint", label: "Paint area", value: paintAreaSqft, unit: "sq ft", formula: "Wall area × 2 faces + ceiling area" },
    { key: "plaster", label: "Plaster area", value: plasterAreaSqft, unit: "sq ft", formula: "Wall area × 2 faces" },
    { key: "tile", label: "Tile area", value: tileAreaSqft, unit: "sq ft", formula: "= Carpet area (full flooring assumption)" },
    { key: "ceiling", label: "Ceiling area", value: ceilingAreaSqft, unit: "sq ft", formula: "= Built-up area" },
    { key: "roof", label: "Roof area", value: roofAreaSqft, unit: "sq ft", formula: "Top floor footprint" },
    { key: "door", label: "Door area", value: doorAreaSqft, unit: "sq ft", formula: `${assumptions.doorCount} door(s) × ${DOOR_AREA_SQFT} sq ft` },
    { key: "window", label: "Window area", value: windowAreaSqft, unit: "sq ft", formula: `${assumptions.windowCount} window(s) × ${WINDOW_AREA_SQFT} sq ft` },
  ];

  return {
    floorsCount,
    perFloorAreaSqft,
    perimeterFt,
    builtUpAreaSqft,
    carpetAreaSqft,
    wallAreaSqft,
    paintAreaSqft,
    plasterAreaSqft,
    tileAreaSqft,
    ceilingAreaSqft,
    roofAreaSqft,
    doorAreaSqft,
    windowAreaSqft,
    lines,
  };
}

// Structural thumb rules, per sq ft of built-up area unless noted.
const CEMENT_BAGS_PER_SQFT = 0.4;
const STEEL_KG_PER_SQFT = 4;
const SAND_CFT_PER_SQFT = 1.5;
const AGGREGATE_CFT_PER_SQFT = 1.5;
const BRICKS_PER_SQFT_WALL = 8;
const BINDING_WIRE_PCT_OF_STEEL = 0.01;
const WATER_LITERS_PER_CEMENT_BAG = 25;

export interface StructuralBreakdown {
  cementBags: number;
  steelKg: number;
  sandCft: number;
  aggregateCft: number;
  bricksNos: number;
  bindingWireKg: number;
  waterLiters: number;
  lines: Line[];
}

export function computeStructuralBreakdown(area: AreaBreakdown): StructuralBreakdown {
  const cementBags = area.builtUpAreaSqft * CEMENT_BAGS_PER_SQFT;
  const steelKg = area.builtUpAreaSqft * STEEL_KG_PER_SQFT;
  const sandCft = area.builtUpAreaSqft * SAND_CFT_PER_SQFT;
  const aggregateCft = area.builtUpAreaSqft * AGGREGATE_CFT_PER_SQFT;
  const bricksNos = area.wallAreaSqft * BRICKS_PER_SQFT_WALL;
  const bindingWireKg = steelKg * BINDING_WIRE_PCT_OF_STEEL;
  const waterLiters = cementBags * WATER_LITERS_PER_CEMENT_BAG;

  const lines: Line[] = [
    { key: "cement", label: "Cement", value: cementBags, unit: "bags", formula: `Built-up area × ${CEMENT_BAGS_PER_SQFT} bags/sq ft` },
    { key: "steel", label: "Steel (TMT)", value: steelKg, unit: "kg", formula: `Built-up area × ${STEEL_KG_PER_SQFT} kg/sq ft` },
    { key: "sand", label: "Sand", value: sandCft, unit: "cft", formula: `Built-up area × ${SAND_CFT_PER_SQFT} cft/sq ft` },
    { key: "aggregate", label: "Aggregate", value: aggregateCft, unit: "cft", formula: `Built-up area × ${AGGREGATE_CFT_PER_SQFT} cft/sq ft` },
    { key: "bricks", label: "Bricks", value: bricksNos, unit: "nos", formula: `Wall area × ${BRICKS_PER_SQFT_WALL} nos/sq ft` },
    { key: "bindingWire", label: "Binding wire", value: bindingWireKg, unit: "kg", formula: `${BINDING_WIRE_PCT_OF_STEEL * 100}% of steel weight` },
    { key: "water", label: "Water", value: waterLiters, unit: "litres", formula: `Cement × ${WATER_LITERS_PER_CEMENT_BAG} L/bag` },
  ];

  return { cementBags, steelKg, sandCft, aggregateCft, bricksNos, bindingWireKg, waterLiters, lines };
}

export const MATERIAL_LABEL: Record<MaterialKey, string> = {
  cement: "Cement",
  steel: "Steel (TMT)",
  sand: "Sand",
  aggregate: "Aggregate",
  bricks: "Bricks",
  plaster: "Plaster",
  paint: "Paint",
  tiles: "Tiles",
  door: "Doors",
  window: "Windows",
};

export const MATERIAL_UNIT: Record<MaterialKey, string> = {
  cement: "bag",
  steel: "kg",
  sand: "cft",
  aggregate: "cft",
  bricks: "nos",
  plaster: "sq ft",
  paint: "sq ft",
  tiles: "sq ft",
  door: "nos",
  window: "nos",
};

// Ballpark India-market defaults (₹) — every rate is editable per organization.
export const DEFAULT_MATERIAL_RATES: Record<MaterialKey, number> = {
  cement: 400,
  steel: 65,
  sand: 45,
  aggregate: 40,
  bricks: 8,
  plaster: 55,
  paint: 18,
  tiles: 80,
  door: 5000,
  window: 3500,
};

export interface MaterialCostLine {
  key: MaterialKey;
  label: string;
  quantity: number;
  unit: string;
  rate: number;
  cost: number;
}

export interface CostBreakdown {
  materials: MaterialCostLine[];
  materialCost: number;
  labourCost: number;
  machineCost: number;
  transportCost: number;
  subtotal: number;
  contingencyAmount: number;
  gstAmount: number;
  marginAmount: number;
  grandTotal: number;
  costPerSqft: number;
}

export function computeCostBreakdown(
  area: AreaBreakdown,
  structural: StructuralBreakdown,
  assumptions: EstimateAssumptions,
  rates: Record<MaterialKey, number>,
): CostBreakdown {
  const quantities: Record<MaterialKey, number> = {
    cement: structural.cementBags,
    steel: structural.steelKg,
    sand: structural.sandCft,
    aggregate: structural.aggregateCft,
    bricks: structural.bricksNos,
    plaster: area.plasterAreaSqft,
    paint: area.paintAreaSqft,
    tiles: area.tileAreaSqft,
    door: assumptions.doorCount,
    window: assumptions.windowCount,
  };

  const materials: MaterialCostLine[] = (Object.keys(quantities) as MaterialKey[]).map((key) => {
    const quantity = quantities[key];
    const rate = rates[key];
    return {
      key,
      label: MATERIAL_LABEL[key],
      quantity,
      unit: MATERIAL_UNIT[key],
      rate,
      cost: quantity * rate,
    };
  });

  const materialCost = materials.reduce((sum, m) => sum + m.cost, 0);
  const labourCost = materialCost * (assumptions.labourCostPct / 100);
  const machineCost = materialCost * (assumptions.machineCostPct / 100);
  const transportCost = materialCost * (assumptions.transportCostPct / 100);
  const subtotal = materialCost + labourCost + machineCost + transportCost;
  const contingencyAmount = subtotal * (assumptions.contingencyPct / 100);
  const afterContingency = subtotal + contingencyAmount;
  const gstAmount = afterContingency * (assumptions.gstPct / 100);
  const marginAmount = afterContingency * (assumptions.contractorMarginPct / 100);
  const grandTotal = afterContingency + gstAmount + marginAmount;
  const costPerSqft = area.builtUpAreaSqft > 0 ? grandTotal / area.builtUpAreaSqft : 0;

  return {
    materials,
    materialCost,
    labourCost,
    machineCost,
    transportCost,
    subtotal,
    contingencyAmount,
    gstAmount,
    marginAmount,
    grandTotal,
    costPerSqft,
  };
}
