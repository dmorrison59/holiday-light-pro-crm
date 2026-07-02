export interface CatalogItemTemplate {
  name: string;
  category: string;
  description: string;
  pricingMethod: string;
  unitType: string;
  unitPrice: string;
  cost: string;
  customerFacing: boolean;
  trackInventory: boolean;
}

export const catalogItemTemplates: CatalogItemTemplate[] = [
  { name: "C9 Warm White Roofline Lights", category: "Roofline Lights", description: "Warm white C9 bulbs for rooflines, peaks, and gutters.", pricingMethod: "per_foot", unitType: "ft", unitPrice: "8", cost: "2.5", customerFacing: true, trackInventory: true },
  { name: "C9 Multicolor Roofline Lights", category: "Roofline Lights", description: "Multicolor C9 bulbs for rooflines, peaks, and gutters.", pricingMethod: "per_foot", unitType: "ft", unitPrice: "9", cost: "3", customerFacing: true, trackInventory: true },
  { name: "Garland", category: "Garland", description: "Decorative garland for railings, columns, doors, and architectural accents.", pricingMethod: "per_foot", unitType: "ft", unitPrice: "12", cost: "4", customerFacing: true, trackInventory: true },
  { name: "36-inch Wreath", category: "Wreaths", description: "Pre-lit 36-inch wreath for doors, windows, and exterior focal points.", pricingMethod: "each", unitType: "each", unitPrice: "125", cost: "45", customerFacing: true, trackInventory: true },
  { name: "Red Bow", category: "Wreaths", description: "Weather-resistant red decorative bow for wreaths, garland, and columns.", pricingMethod: "each", unitType: "each", unitPrice: "35", cost: "12", customerFacing: true, trackInventory: true },
  { name: "Walkway Stake Lights", category: "Walkway Lights", description: "Staked lights for walkways, driveways, and landscape borders.", pricingMethod: "per_foot", unitType: "ft", unitPrice: "5", cost: "1.5", customerFacing: true, trackInventory: true },
  { name: "Tree Wrap", category: "Tree Lights", description: "Lighting installed around a tree trunk or branches.", pricingMethod: "per_tree", unitType: "tree", unitPrice: "200", cost: "60", customerFacing: true, trackInventory: false },
  { name: "Bush Lights", category: "Bush Lights", description: "Lighting installed across one bush or shrub section.", pricingMethod: "per_bush", unitType: "bush", unitPrice: "75", cost: "20", customerFacing: true, trackInventory: false },
  { name: "Timer", category: "Timers", description: "Outdoor timer used to control a holiday lighting display.", pricingMethod: "each", unitType: "each", unitPrice: "25", cost: "10", customerFacing: true, trackInventory: true },
  { name: "Extension Cord", category: "Extension Cords", description: "Outdoor-rated extension cord used during installation.", pricingMethod: "each", unitType: "each", unitPrice: "15", cost: "6", customerFacing: false, trackInventory: true },
  { name: "Clips", category: "Clips/Stakes", description: "Installation clips and fasteners for lights and decorations.", pricingMethod: "each", unitType: "each", unitPrice: "0", cost: "0.1", customerFacing: false, trackInventory: true },
  { name: "Storage Service", category: "Storage", description: "Seasonal storage service for customer lighting and decorations.", pricingMethod: "flat_fee", unitType: "service", unitPrice: "150", cost: "0", customerFacing: true, trackInventory: false },
  { name: "Takedown Service", category: "Takedown", description: "Post-season removal of installed lighting and decorations.", pricingMethod: "flat_fee", unitType: "service", unitPrice: "250", cost: "0", customerFacing: true, trackInventory: false },
];
