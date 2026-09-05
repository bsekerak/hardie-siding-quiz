import type { ArchStyle, ProfileId, SidingProfile } from "@/types/quiz";

export const SIDING_PROFILES: Readonly<Record<ProfileId, SidingProfile>> = {
  "hardieplank-select-cedarmill": {
    id: "hardieplank-select-cedarmill",
    name: "HardiePlank® Lap Siding — Select Cedarmill®",
    productLine: "HardiePlank® Lap Siding",
    texture: "Cedarmill",
    exposure: '8.25" board with 7" exposure',
    summary:
      "The reference horizontal lap. A milled cedar grain that reads as real wood from the sidewalk but never needs a scrape-and-repaint cycle.",
    bestFor: ["colonial", "craftsman", "ranch", "split-level", "coastal"],
    costLow: 13,
    costHigh: 19,
  },
  "hardieplank-smooth": {
    id: "hardieplank-smooth",
    name: "HardiePlank® Lap Siding — Smooth",
    productLine: "HardiePlank® Lap Siding",
    texture: "Smooth",
    exposure: '8.25" board with 7" exposure',
    summary:
      "Same board, no grain. The crisp shadow line reads modern and keeps a dark ColorPlus finish from looking busy.",
    bestFor: ["contemporary", "modern-farmhouse", "colonial"],
    costLow: 13,
    costHigh: 19,
  },
  "hardieshingle-straight": {
    id: "hardieshingle-straight",
    name: "HardieShingle® Siding — Straight Edge Panel",
    productLine: "HardieShingle® Siding",
    texture: "Cedarmill",
    exposure: "Straight-edge panel, 15-1/4\" x 48\"",
    summary:
      "Cedar shake character in panel form. Orderly coursing that suits coastal and cottage elevations without the cupping and moss of real shake.",
    bestFor: ["coastal", "victorian", "craftsman"],
    costLow: 16,
    costHigh: 24,
  },
  "hardieshingle-staggered": {
    id: "hardieshingle-staggered",
    name: "HardieShingle® Siding — Staggered Edge Panel",
    productLine: "HardieShingle® Siding",
    texture: "Cedarmill",
    exposure: "Staggered-edge panel, 15-1/4\" x 48\"",
    summary:
      "Irregular butt line for hand-split shake character. Strongest as a gable, dormer or turret accent rather than a whole-house field.",
    bestFor: ["victorian", "craftsman", "coastal"],
    costLow: 17,
    costHigh: 25,
  },
  "hardiepanel-vertical": {
    id: "hardiepanel-vertical",
    name: "HardiePanel® Vertical Siding — Sierra 8",
    productLine: "HardiePanel® Vertical Siding",
    texture: "Sierra 8",
    exposure: "4' x 8'/9'/10' panel",
    summary:
      "Grooved vertical panel that carries a tall wall without a horizontal break. Reads agricultural in the right context and contemporary in the wrong one.",
    bestFor: ["ranch", "contemporary", "split-level"],
    costLow: 14,
    costHigh: 21,
  },
  "hardiepanel-batten": {
    id: "hardiepanel-batten",
    name: "HardiePanel® Vertical Siding + HardieTrim® Batten Boards",
    productLine: "HardiePanel® + HardieTrim® Batten",
    texture: "Smooth",
    exposure: '4\' panel with 2.5" battens at 12" or 16" o.c.',
    summary:
      "True board-and-batten. Batten spacing is the design decision — 16\" reads farmhouse, 12\" reads tighter and more contemporary.",
    bestFor: ["modern-farmhouse", "contemporary", "ranch"],
    costLow: 15,
    costHigh: 22,
  },
  "hardie-architectural-panel": {
    id: "hardie-architectural-panel",
    name: "Hardie® Architectural Panel — Fine Sand",
    productLine: "Hardie® Architectural Collection",
    texture: "Fine Sand",
    exposure: "Sealed panel with expressed vertical reveal",
    summary:
      "Monolithic panelized field with a deliberate reveal joint. Requires a disciplined installer and a rainscreen detail, and it looks like nothing else on the street.",
    bestFor: ["contemporary", "modern-farmhouse"],
    costLow: 18,
    costHigh: 28,
  },
};

interface StyleMapping {
  primary: ProfileId;
  /** Alternate primary when the homeowner leans modern/smooth. */
  modernPrimary: ProfileId;
  accent: ProfileId | null;
  accentPlacement: string | null;
  note: string;
}

export const STYLE_MATRIX: Readonly<Record<ArchStyle, StyleMapping>> = {
  colonial: {
    primary: "hardieplank-select-cedarmill",
    modernPrimary: "hardieplank-smooth",
    accent: null,
    accentPlacement: null,
    note: "Colonial and Cape Cod elevations are symmetrical by design — one uninterrupted lap field with crisp corner boards is the correct move.",
  },
  craftsman: {
    primary: "hardieplank-select-cedarmill",
    modernPrimary: "hardieplank-select-cedarmill",
    accent: "hardieshingle-staggered",
    accentPlacement: "Gables and the porch skirt",
    note: "Craftsman detailing wants a texture change above the belt line — shingle in the gable over lap on the body is the canonical treatment.",
  },
  ranch: {
    primary: "hardieplank-select-cedarmill",
    modernPrimary: "hardieplank-smooth",
    accent: "hardiepanel-batten",
    accentPlacement: "Front entry bay or the garage-facing wall",
    note: "A long low ranch reads better when one vertical element interrupts the horizontal run.",
  },
  "modern-farmhouse": {
    primary: "hardiepanel-batten",
    modernPrimary: "hardiepanel-batten",
    accent: "hardieplank-smooth",
    accentPlacement: "Lower body or a wing, under a board-and-batten upper",
    note: "Board-and-batten over smooth lap, both in the same body color, is the detail that separates a real modern farmhouse from a costume.",
  },
  contemporary: {
    primary: "hardie-architectural-panel",
    modernPrimary: "hardie-architectural-panel",
    accent: "hardieplank-smooth",
    accentPlacement: "Entry volume or a recessed elevation",
    note: "Panelized fields want a rainscreen and a very disciplined layout. Confirm your installer has done Architectural Collection before, not just lap.",
  },
  victorian: {
    primary: "hardieplank-select-cedarmill",
    modernPrimary: "hardieplank-select-cedarmill",
    accent: "hardieshingle-staggered",
    accentPlacement: "Upper story, turret and gable faces",
    note: "Victorian elevations expect at least two textures stacked vertically, with heavier trim than a modern build.",
  },
  "split-level": {
    primary: "hardieplank-select-cedarmill",
    modernPrimary: "hardieplank-smooth",
    accent: "hardiepanel-vertical",
    accentPlacement: "The upper-level mass, to visually separate the two volumes",
    note: "Split-levels improve dramatically when the two masses get different treatments instead of one continuous wrap.",
  },
  coastal: {
    primary: "hardieshingle-straight",
    modernPrimary: "hardieplank-smooth",
    accent: "hardieplank-select-cedarmill",
    accentPlacement: "Lower body under a shingled upper",
    note: "Straight-edge shingle gives cottage character without the cupping, splitting and moss that real cedar shake develops in salt air.",
  },
};
