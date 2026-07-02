"use server";

import { revalidatePath } from "next/cache";
import { requireOrganization } from "@/lib/auth/current";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type DemoState = { error?: string; success?: string; customerId?: string };

export async function createDemoDataAction(_state: DemoState): Promise<DemoState> {
  const { organization } = await requireOrganization();
  const supabase = await createSupabaseServerClient();
  const { count, error: countError } = await supabase.from("customers").select("id", { count: "exact", head: true }).eq("organization_id", organization.id);
  if (countError) return { error: "We couldn’t check whether this workspace is empty. Please try again." };
  const { data: existingCustomer } = await supabase.from("customers").select("id").eq("organization_id", organization.id).eq("email", "sarah@example.com").maybeSingle();
  if (existingCustomer) return { success: "Sarah Johnson demo data already exists.", customerId: existingCustomer.id };
  if ((count ?? 0) > 0) return { error: "Demo data can only be created in an empty workspace, so your existing customer records stay untouched." };

  try {
    const catalogSeed = [
      ["C9 Warm White Roofline Lights", "Roofline Lighting", "foot", 8, 500], ["Garland", "Greenery", "foot", 12, 150],
      ["Walkway Stake Lights", "Ground Lighting", "foot", 5, 250], ["36-inch Wreath", "Greenery", "each", 125, 12],
      ["Extension Cord", "Accessories", "each", 18, 30], ["Clips", "Accessories", "each", 0.25, 1000],
      ["Timer", "Accessories", "each", 25, 20], ["Storage Bin", "Storage", "each", 35, 15],
    ] as const;
    const catalog = new Map<string, string>();
    for (const [name, category, unit, price, available] of catalogSeed) {
      const { data, error } = await supabase.from("catalog_items").insert({ organization_id: organization.id, name, category, description: `Demo ${name.toLowerCase()} item.`, pricing_method: "per_unit", unit_type: unit, unit_price: String(price), cost: String(Number(price) * 0.4), active: true, customer_facing: true, track_inventory: true, quantity_available: String(available), quantity_reserved: "0", reorder_threshold: String(Math.max(2, Number(available) * 0.1)), storage_location: "Demo warehouse" }).select("id").single();
      if (error || !data) throw new Error("catalog"); catalog.set(name, data.id);
    }
    const { data: pkg, error: packageError } = await supabase.from("packages").insert({ organization_id: organization.id, name: "Classic Package", description: "A timeless warm-white roofline display with polished entry accents.", base_price: "1495", recommended_budget_min: "1500", recommended_budget_max: "2500", active: true, display_order: 1 }).select("id").single();
    if (packageError || !pkg) throw new Error("package");
    const { error: packageItemsError } = await supabase.from("package_items").insert([{ organization_id: organization.id, package_id: pkg.id, catalog_item_id: catalog.get("C9 Warm White Roofline Lights")!, quantity: "150", unit: "foot", included: true, optional_addon: false, notes: "Front roofline and garage peak" }]);
    if (packageItemsError) throw new Error("package items");
    const { data: customer, error: customerError } = await supabase.from("customers").insert({ organization_id: organization.id, first_name: "Sarah", last_name: "Johnson", phone: "724-555-1234", email: "sarah@example.com", billing_address: "100 Main Street, Ligonier, PA 15658", status: "active_customer", lead_source: "Demo data", notes: "Demo customer for the Holiday Light Pro walkthrough." }).select("id").single();
    if (customerError || !customer) throw new Error("customer");
    const { data: property, error: propertyError } = await supabase.from("properties").insert({ organization_id: organization.id, customer_id: customer.id, property_name: "Sarah Johnson Residence", address_line_1: "100 Main Street", city: "Ligonier", state: "PA", zip: "15658", property_type: "Residential", outlet_notes: "Exterior outlet near front porch for timer.", notes: "Classic two-story residence with front garage peak." }).select("id").single();
    if (propertyError || !property) throw new Error("property");
    const { data: visit, error: visitError } = await supabase.from("site_visits").insert({ organization_id: organization.id, customer_id: customer.id, property_id: property.id, visit_date: "2026-10-15T10:00:00-04:00", budget_discussed: "$1,500–$2,000", preferred_style: "Classic warm white", preferred_colors: ["Warm white"], customer_present: true, notes: "Wants roofline, wreath, garland, and walkway lights." }).select("id").single();
    if (visitError || !visit) throw new Error("site visit");
    const measurements = [["Front roofline", "roofline", 120, "foot", "C9 Warm White Roofline Lights"], ["Garage peak", "roofline", 30, "foot", "C9 Warm White Roofline Lights"], ["Porch railing", "garland", 25, "foot", "Garland"], ["Front walkway", "walkway", 60, "foot", "Walkway Stake Lights"], ["Front door wreath", "wreath", 1, "each", "36-inch Wreath"]] as const;
    const { error: measurementsError } = await supabase.from("measurements").insert(measurements.map(([zone_name, measurement_type, quantity, unit, item]) => ({ organization_id: organization.id, site_visit_id: visit.id, property_id: property.id, zone_name, measurement_type, quantity: String(quantity), unit, height_level: "First story", difficulty: "Normal", difficulty_multiplier: "1", catalog_item_id: catalog.get(item), included_in_quote: true })));
    if (measurementsError) throw new Error("measurements");
    const total = 2220, deposit = 1110;
    const { data: quote, error: quoteError } = await supabase.from("quotes").insert({ organization_id: organization.id, customer_id: customer.id, property_id: property.id, site_visit_id: visit.id, package_id: pkg.id, quote_number: "Q-2026-DEMO", status: "approved", quote_date: "2026-10-16", expiration_date: "2026-11-01", subtotal: String(total), discount: "0", total: String(total), deposit_required: String(deposit), deposit_type: "percentage", deposit_value: "50", balance_due: String(total - deposit), customer_notes: "Classic warm-white display with greenery and walkway lighting.", terms: "Includes professional installation, maintenance during the season, takedown, and labeled storage preparation.", proposal_token: crypto.randomUUID(), approved_at: new Date().toISOString(), customer_approval_name: "Sarah Johnson", customer_approval_email: "sarah@example.com" }).select("id").single();
    if (quoteError || !quote) throw new Error("quote");
    const lines = [["Classic Package", 1, "package", 1495, null], ["Garland", 25, "foot", 12, "Garland"], ["Walkway Stake Lights", 60, "foot", 5, "Walkway Stake Lights"], ["36-inch Wreath", 1, "each", 125, "36-inch Wreath"]] as const;
    const { error: linesError } = await supabase.from("quote_line_items").insert(lines.map(([description, quantity, unit, unit_price, item]) => ({ organization_id: organization.id, quote_id: quote.id, catalog_item_id: item ? catalog.get(item) : null, description, quantity: String(quantity), unit, unit_price: String(unit_price), multiplier: "1", line_total: String(Number(quantity) * Number(unit_price)), customer_visible: true })));
    if (linesError) throw new Error("quote lines");
    const { data: job, error: jobError } = await supabase.from("jobs").insert({ organization_id: organization.id, customer_id: customer.id, property_id: property.id, quote_id: quote.id, job_number: "J-2026-DEMO", status: "materials_ready", install_date: "2026-11-15", install_time_window: "Morning", takedown_date: "2027-01-08", takedown_time_window: "Morning", payment_status: "deposit_paid", crew_notes: "Confirm timer and front porch outlet before powering display.", materials_notes: "C9 lights, garland, walkway stakes, wreath, extension cord, clips, timer, and storage bin." }).select("id").single();
    if (jobError || !job) throw new Error("job");
    const demoMaterials = [["C9 Warm White Roofline Lights", 150, "foot"], ["Garland", 25, "foot"], ["Walkway Stake Lights", 60, "foot"], ["36-inch Wreath", 1, "each"], ["Extension Cord", 3, "each"], ["Clips", 180, "each"], ["Timer", 1, "each"], ["Storage Bin", 2, "each"]] as const;
    const { error: materialsError } = await supabase.from("job_materials").insert(demoMaterials.map(([description, quantity, unit]) => ({ organization_id: organization.id, job_id: job.id, catalog_item_id: catalog.get(description), description, quantity: String(quantity), unit, reserved_quantity: "0", used_quantity: "0", returned_quantity: "0", status: "Needed", customer_visible: false, source: "Demo Data", storage_location: "Demo warehouse" })));
    if (materialsError) throw new Error("materials");
    const { error: scheduleError } = await supabase.from("schedule_events").insert([{ organization_id: organization.id, customer_id: customer.id, property_id: property.id, job_id: job.id, event_type: "install", event_date: "2026-11-15", time_window: "Morning", status: "scheduled", notes: "Install complete Classic Package display." }, { organization_id: organization.id, customer_id: customer.id, property_id: property.id, job_id: job.id, event_type: "takedown", event_date: "2027-01-08", time_window: "Morning", status: "scheduled", notes: "Takedown and label materials for storage." }, { organization_id: organization.id, customer_id: customer.id, property_id: property.id, job_id: job.id, event_type: "service_call", event_date: "2026-11-16", time_window: "Afternoon", status: "scheduled", notes: "Check timer and outlet." }]);
    if (scheduleError) throw new Error("schedule");
    const { error: paymentError } = await supabase.from("payments").insert({ organization_id: organization.id, customer_id: customer.id, job_id: job.id, quote_id: quote.id, amount: String(deposit), payment_type: "deposit", status: "paid", payment_date: "2026-10-20T12:00:00-04:00", payment_method: "Check", reference_number: "DEMO-1001", notes: "50% deposit received." });
    if (paymentError) throw new Error("payment");
    revalidatePath("/", "layout");
    return { success: "Demo workspace created. Sarah Johnson’s complete sales and job flow is ready.", customerId: customer.id };
  } catch {
    return { error: "We couldn’t finish creating demo data. You can safely try again, or review the Supabase tables for the partially created demo records." };
  }
}
