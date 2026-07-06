import type { OrganizationPricingSettings } from "@/types/database";

export type PricingCategory =
  | "roofline_linear_feet"
  | "ridge_line_linear_feet"
  | "walkway_linear_feet"
  | "driveway_linear_feet"
  | "garland_linear_feet"
  | "wreaths_count"
  | "trees_count"
  | "shrubs_count"
  | "peaks_count"
  | "custom_labor"
  | "removal"
  | "storage";

export interface PricingRule {
  category: PricingCategory;
  label: string;
  measurementTypes: readonly string[];
  unit: string;
  defaultPrice: number;
  description: string;
}

export const pricingRules: readonly PricingRule[] = [
  { category: "roofline_linear_feet", label: "Roofline", measurementTypes: ["Roofline"], unit: "ft", defaultPrice: 12, description: "Professional C9 roofline lighting" },
  { category: "ridge_line_linear_feet", label: "Ridge line", measurementTypes: ["Ridge Line"], unit: "ft", defaultPrice: 12, description: "Professional C9 ridge line lighting" },
  { category: "walkway_linear_feet", label: "Walkway", measurementTypes: ["Walkway"], unit: "ft", defaultPrice: 10, description: "Staked walkway lighting" },
  { category: "driveway_linear_feet", label: "Driveway", measurementTypes: ["Driveway"], unit: "ft", defaultPrice: 10, description: "Staked driveway lighting" },
  { category: "garland_linear_feet", label: "Garland", measurementTypes: ["Garland", "Garland Area"], unit: "ft", defaultPrice: 18, description: "Premium pre-lit garland" },
  { category: "wreaths_count", label: "Wreath", measurementTypes: ["Wreath"], unit: "each", defaultPrice: 85, description: "Pre-lit exterior wreath" },
  { category: "trees_count", label: "Tree", measurementTypes: ["Tree"], unit: "tree", defaultPrice: 150, description: "Tree lighting" },
  { category: "shrubs_count", label: "Shrub", measurementTypes: ["Shrub", "Bush"], unit: "bush", defaultPrice: 75, description: "Shrub lighting" },
  { category: "peaks_count", label: "Peak/gable", measurementTypes: ["Peak/Gable"], unit: "each", defaultPrice: 75, description: "C9 peak and gable lighting" },
  { category: "custom_labor", label: "Custom labor", measurementTypes: ["Custom"], unit: "hour", defaultPrice: 0, description: "Custom installation labor" },
  { category: "removal", label: "Removal", measurementTypes: [], unit: "service", defaultPrice: 0, description: "Post-season removal included" },
  { category: "storage", label: "Storage", measurementTypes: [], unit: "service", defaultPrice: 150, description: "Seasonal storage service" },
] as const;

export interface PackagePricingPreset {
  name: string;
  styleDescription: string;
  recommendedCategories: readonly PricingCategory[];
}

export const packagePricingPresets: readonly PackagePricingPreset[] = [
  { name: "Basic Package", styleDescription: "Simple warm white C9 roofline design", recommendedCategories: ["roofline_linear_feet"] },
  { name: "Classic Package", styleDescription: "Premium C9 roofline with measured peaks and ridges", recommendedCategories: ["roofline_linear_feet", "ridge_line_linear_feet", "peaks_count"] },
  { name: "Premium Package", styleDescription: "Premium full-property design with roofline, architectural accents, walkway, and garland options", recommendedCategories: ["roofline_linear_feet", "ridge_line_linear_feet", "peaks_count", "walkway_linear_feet", "driveway_linear_feet", "garland_linear_feet"] },
] as const;

export const getPricingRuleForMeasurement = (measurementType: string) =>
  pricingRules.find((rule) => rule.measurementTypes.includes(measurementType));

export const getPricingRule = (category: PricingCategory) =>
  pricingRules.find((rule) => rule.category === category);

export const getPackagePricingPreset = (packageName?: string | null) =>
  packagePricingPresets.find((preset) => preset.name.toLocaleLowerCase() === packageName?.toLocaleLowerCase());

export const pricingSettingFields: Record<PricingCategory, keyof OrganizationPricingSettings> = {
  roofline_linear_feet: "roofline_price",
  ridge_line_linear_feet: "ridge_line_price",
  walkway_linear_feet: "walkway_price",
  driveway_linear_feet: "driveway_price",
  garland_linear_feet: "garland_price",
  wreaths_count: "wreath_price",
  trees_count: "tree_price",
  shrubs_count: "shrub_price",
  peaks_count: "peak_gable_price",
  custom_labor: "custom_labor_hourly_rate",
  removal: "removal_price",
  storage: "storage_price",
};

export const getOrganizationPrice = (settings: OrganizationPricingSettings | null | undefined, category: PricingCategory) => {
  const configured = settings?.[pricingSettingFields[category]];
  if (typeof configured === "string" || typeof configured === "number") {
    const value = Number(configured);
    if (Number.isFinite(value) && value >= 0) return value;
  }
  return getPricingRule(category)?.defaultPrice ?? 0;
};

export const starterPricingValues = {
  removal_included: true,
  storage_included: false,
  minimum_job_price: null,
} as const;
