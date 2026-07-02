export const customerStatuses = [
  { value: "lead", label: "Lead" },
  { value: "contacted", label: "Contacted" },
  { value: "site_visit_scheduled", label: "Site Visit Scheduled" },
  { value: "measured", label: "Measured" },
  { value: "quote_sent", label: "Quote Sent" },
  { value: "approved", label: "Approved" },
  { value: "active_customer", label: "Active Customer" },
  { value: "past_customer", label: "Past Customer" },
  { value: "lost", label: "Lost" },
] as const;

export const propertyTypes = [
  "Residential",
  "Commercial",
  "Church",
  "Municipal",
  "HOA/Common Area",
  "Other",
] as const;

export const siteVisitStyles = [
  "Roofline only",
  "Classic warm white",
  "Multicolor",
  "Red/green",
  "Elegant/traditional",
  "Full property display",
  "Commercial display",
  "Custom",
] as const;

export const preferredColorOptions = [
  "Warm white",
  "Cool white",
  "Multicolor",
  "Red/green",
  "Blue/white",
  "Custom",
] as const;

export const measurementTypes = ["Roofline", "Peak/Gable", "Garland Area", "Walkway", "Driveway", "Tree", "Bush", "Wreath", "Window", "Door", "Fence", "Commercial Sign", "Yard Display", "Timer/Power", "Custom"] as const;

export const measurementUnits = ["ft", "each", "tree", "bush", "window", "door", "section", "custom"] as const;

export const heightLevels = ["Ground level", "1-story", "2-story", "3-story", "Commercial height", "Lift required"] as const;

export const difficultyOptions = [
  { label: "Normal", multiplier: "1.0" },
  { label: "Moderate", multiplier: "1.15" },
  { label: "Difficult", multiplier: "1.25" },
  { label: "High risk", multiplier: "1.5" },
  { label: "Custom", multiplier: "1.0" },
] as const;

export const catalogCategories = ["Roofline Lights", "Garland", "Wreaths", "Walkway Lights", "Tree Lights", "Bush Lights", "Window Decorations", "Yard Displays", "Timers", "Extension Cords", "Clips/Stakes", "Storage", "Labor/Service", "Takedown", "Maintenance", "Internal Supplies", "Custom"] as const;

export const pricingMethods = [
  { value: "per_foot", label: "Per foot" }, { value: "each", label: "Each" }, { value: "per_tree", label: "Per tree" }, { value: "per_bush", label: "Per bush" }, { value: "per_window", label: "Per window" }, { value: "flat_fee", label: "Flat fee" }, { value: "hourly", label: "Hourly" }, { value: "package", label: "Package" }, { value: "custom", label: "Custom" },
] as const;

export const catalogUnitTypes = ["ft", "each", "tree", "bush", "window", "door", "hour", "service", "box", "roll", "spool", "bin", "custom"] as const;
