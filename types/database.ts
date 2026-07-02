export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Nullable<T> = T | null;

export interface Organization {
  id: string;
  name: string;
  phone: Nullable<string>;
  email: Nullable<string>;
  website: Nullable<string>;
  address: Nullable<string>;
  logo_url: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  organization_id: string;
  first_name: Nullable<string>;
  last_name: Nullable<string>;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  organization_id: string;
  first_name: string;
  last_name: string;
  phone: Nullable<string>;
  email: Nullable<string>;
  billing_address: Nullable<string>;
  status: string;
  lead_source: Nullable<string>;
  notes: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  organization_id: string;
  customer_id: string;
  property_name: Nullable<string>;
  address_line_1: string;
  address_line_2: Nullable<string>;
  city: string;
  state: string;
  zip: string;
  property_type: Nullable<string>;
  access_notes: Nullable<string>;
  outlet_notes: Nullable<string>;
  safety_notes: Nullable<string>;
  hoa_notes: Nullable<string>;
  notes: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  organization_id: string;
  customer_id: Nullable<string>;
  property_id: Nullable<string>;
  status: string;
  source: Nullable<string>;
  budget_min: Nullable<string>;
  budget_max: Nullable<string>;
  desired_install_window: Nullable<string>;
  interested_services: string[];
  notes: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface SiteVisit {
  id: string;
  organization_id: string;
  customer_id: string;
  property_id: string;
  visit_date: Nullable<string>;
  estimator_id: Nullable<string>;
  budget_discussed: Nullable<string>;
  preferred_style: Nullable<string>;
  preferred_colors: string[];
  customer_present: boolean;
  notes: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface Measurement {
  id: string;
  organization_id: string;
  site_visit_id: string;
  property_id: string;
  zone_name: string;
  measurement_type: string;
  quantity: string;
  unit: string;
  height_level: Nullable<string>;
  difficulty: Nullable<string>;
  difficulty_multiplier: string;
  catalog_item_id: Nullable<string>;
  included_in_quote: boolean;
  notes: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface CatalogItem {
  id: string;
  organization_id: string;
  name: string;
  category: string;
  description: Nullable<string>;
  pricing_method: string;
  unit_type: string;
  unit_price: string;
  cost: Nullable<string>;
  active: boolean;
  customer_facing: boolean;
  track_inventory: boolean;
  quantity_available: string;
  quantity_reserved: string;
  reorder_threshold: string;
  storage_location: Nullable<string>;
  notes: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  organization_id: string;
  name: string;
  description: Nullable<string>;
  base_price: string;
  recommended_budget_min: Nullable<string>;
  recommended_budget_max: Nullable<string>;
  active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PackageItem {
  id: string;
  organization_id: string;
  package_id: string;
  catalog_item_id: string;
  quantity: string;
  unit: string;
  included: boolean;
  optional_addon: boolean;
  price_override: Nullable<string>;
  notes: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  organization_id: string;
  customer_id: string;
  property_id: string;
  site_visit_id: Nullable<string>;
  package_id: Nullable<string>;
  quote_number: Nullable<string>;
  status: string;
  quote_date: string;
  expiration_date: Nullable<string>;
  subtotal: string;
  discount: string;
  total: string;
  deposit_required: string;
  deposit_type: string;
  deposit_value: string;
  balance_due: string;
  customer_notes: Nullable<string>;
  terms: Nullable<string>;
  internal_notes: Nullable<string>;
  proposal_token: Nullable<string>;
  proposal_viewed_at: Nullable<string>;
  proposal_sent_at: Nullable<string>;
  approved_at: Nullable<string>;
  declined_at: Nullable<string>;
  customer_approval_name: Nullable<string>;
  customer_approval_email: Nullable<string>;
  customer_decline_reason: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface QuoteLineItem {
  id: string;
  organization_id: string;
  quote_id: string;
  catalog_item_id: Nullable<string>;
  description: string;
  quantity: string;
  unit: string;
  unit_price: string;
  multiplier: string;
  line_total: string;
  customer_visible: boolean;
  notes: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface Job {
  id: string;
  organization_id: string;
  customer_id: string;
  property_id: string;
  quote_id: Nullable<string>;
  job_number: Nullable<string>;
  status: string;
  install_date: Nullable<string>;
  install_time_window: Nullable<string>;
  takedown_date: Nullable<string>;
  takedown_time_window: Nullable<string>;
  payment_status: string;
  crew_notes: Nullable<string>;
  materials_notes: Nullable<string>;
  storage_notes: Nullable<string>;
  internal_notes: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface ScheduleEvent {
  id: string;
  organization_id: string;
  customer_id: Nullable<string>;
  property_id: Nullable<string>;
  job_id: Nullable<string>;
  event_type: string;
  event_date: string;
  start_time: Nullable<string>;
  end_time: Nullable<string>;
  time_window: Nullable<string>;
  status: string;
  assigned_user_id: Nullable<string>;
  notes: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface JobMaterial {
  id: string;
  organization_id: string;
  job_id: string;
  catalog_item_id: Nullable<string>;
  description: string;
  quantity: string;
  unit: Nullable<string>;
  reserved_quantity: string;
  used_quantity: string;
  returned_quantity: string;
  status: string;
  customer_visible: boolean;
  source: Nullable<string>;
  storage_location: Nullable<string>;
  notes: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  organization_id: string;
  customer_id: string;
  job_id: Nullable<string>;
  quote_id: Nullable<string>;
  amount: string;
  payment_type: string;
  status: string;
  payment_date: Nullable<string>;
  payment_method: Nullable<string>;
  reference_number: Nullable<string>;
  notes: Nullable<string>;
  created_at: string;
  updated_at: string;
}

export interface FileRecord {
  id: string;
  organization_id: string;
  related_type: string;
  related_id: string;
  file_url: string;
  file_name: string;
  file_type: Nullable<string>;
  storage_path: Nullable<string>;
  file_size: Nullable<number>;
  mime_type: Nullable<string>;
  uploaded_by: Nullable<string>;
  photo_type: Nullable<string>;
  customer_visible: boolean;
  description: Nullable<string>;
  created_at: string;
  updated_at: string;
}

type TableDefinition<Row> = {
  Row: Row & Record<string, unknown>;
  Insert: Partial<Row> & Record<string, unknown>;
  Update: Partial<Row> & Record<string, unknown>;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      organizations: TableDefinition<Organization>;
      profiles: TableDefinition<Profile>;
      customers: TableDefinition<Customer>;
      properties: TableDefinition<Property>;
      leads: TableDefinition<Lead>;
      site_visits: TableDefinition<SiteVisit>;
      measurements: TableDefinition<Measurement>;
      catalog_items: TableDefinition<CatalogItem>;
      packages: TableDefinition<Package>;
      package_items: TableDefinition<PackageItem>;
      quotes: TableDefinition<Quote>;
      quote_line_items: TableDefinition<QuoteLineItem>;
      jobs: TableDefinition<Job>;
      schedule_events: TableDefinition<ScheduleEvent>;
      job_materials: TableDefinition<JobMaterial>;
      payments: TableDefinition<Payment>;
      files: TableDefinition<FileRecord>;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
