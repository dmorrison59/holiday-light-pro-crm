export const jobStatuses = [
  { value: "approved", label: "Approved" },
  { value: "deposit_pending", label: "Deposit Pending" },
  { value: "deposit_paid", label: "Deposit Paid" },
  { value: "scheduled", label: "Scheduled" },
  { value: "materials_ready", label: "Materials Ready" },
  { value: "installed", label: "Installed" },
  { value: "final_invoice_sent", label: "Final Invoice Sent" },
  { value: "paid", label: "Paid" },
  { value: "takedown_scheduled", label: "Takedown Scheduled" },
  { value: "takedown_complete", label: "Takedown Complete" },
  { value: "stored", label: "Stored" },
  { value: "complete", label: "Complete" },
  { value: "canceled", label: "Canceled" },
] as const;
export const paymentStatuses = [
  { value: "unpaid", label: "Unpaid" },
  { value: "deposit_pending", label: "Deposit Pending" },
  { value: "deposit_paid", label: "Deposit Paid" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "paid", label: "Paid" },
  { value: "refunded", label: "Refunded" },
  { value: "canceled", label: "Canceled" },
] as const;
export const jobStatusLabel = (value: string) => jobStatuses.find((item) => item.value === value)?.label ?? value.replaceAll("_", " ");
export const paymentStatusLabel = (value: string) => paymentStatuses.find((item) => item.value === value)?.label ?? value.replaceAll("_", " ");
