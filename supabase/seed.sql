-- Holiday Light Pro CRM starter catalog and packages
--
-- This script targets the oldest organization in the database. To seed a
-- specific organization, replace the target_organization CTE in both inserts
-- with: select 'YOUR-ORGANIZATION-UUID'::uuid as id

begin;

with target_organization as (
  select id
  from public.organizations
  order by created_at
  limit 1
),
catalog_seed (name, category, description, pricing_method, unit_type, unit_price) as (
  values
    ('C9 Warm White Roofline Lights', 'Roofline Lighting', 'Commercial-grade warm white C9 roofline lights.', 'per_unit', 'foot', 8.00),
    ('C9 Multicolor Roofline Lights', 'Roofline Lighting', 'Commercial-grade multicolor C9 roofline lights.', 'per_unit', 'foot', 9.00),
    ('Garland', 'Greenery', 'Installed decorative garland.', 'per_unit', 'foot', 12.00),
    ('36-inch Wreath', 'Greenery', 'Installed 36-inch decorative wreath.', 'per_unit', 'each', 125.00),
    ('Walkway Stake Lights', 'Ground Lighting', 'Stake lighting for walkways and borders.', 'per_unit', 'foot', 5.00),
    ('Tree Wrap', 'Tree Lighting', 'Wrapped tree lighting installation.', 'per_unit', 'tree', 200.00),
    ('Bush Lights', 'Landscape Lighting', 'Net or strand lighting for a single bush.', 'per_unit', 'bush', 75.00),
    ('Timer', 'Accessories', 'Outdoor-rated lighting timer.', 'per_unit', 'each', 25.00),
    ('Storage Service', 'Services', 'Seasonal off-site storage service.', 'flat_fee', 'flat_fee', 150.00),
    ('Takedown Service', 'Services', 'End-of-season lighting removal service.', 'flat_fee', 'flat_fee', 250.00)
)
insert into public.catalog_items (
  organization_id,
  name,
  category,
  description,
  pricing_method,
  unit_type,
  unit_price
)
select
  target_organization.id,
  catalog_seed.name,
  catalog_seed.category,
  catalog_seed.description,
  catalog_seed.pricing_method,
  catalog_seed.unit_type,
  catalog_seed.unit_price
from target_organization
cross join catalog_seed
where not exists (
  select 1
  from public.catalog_items existing
  where existing.organization_id = target_organization.id
    and lower(existing.name) = lower(catalog_seed.name)
);

with target_organization as (
  select id
  from public.organizations
  order by created_at
  limit 1
),
package_seed (name, description, base_price, recommended_budget_min, recommended_budget_max, display_order) as (
  values
    ('Basic Package', 'A polished starter display for smaller homes and budgets.', 995.00, 750.00, 1250.00, 1),
    ('Classic Package', 'A fuller roofline and landscape lighting package.', 1495.00, 1250.00, 2000.00, 2),
    ('Premium Package', 'A statement installation with expanded lighting and greenery.', 2495.00, 2000.00, 3500.00, 3)
)
insert into public.packages (
  organization_id,
  name,
  description,
  base_price,
  recommended_budget_min,
  recommended_budget_max,
  display_order
)
select
  target_organization.id,
  package_seed.name,
  package_seed.description,
  package_seed.base_price,
  package_seed.recommended_budget_min,
  package_seed.recommended_budget_max,
  package_seed.display_order
from target_organization
cross join package_seed
where not exists (
  select 1
  from public.packages existing
  where existing.organization_id = target_organization.id
    and lower(existing.name) = lower(package_seed.name)
);

commit;
