export const paymentTypes = [
  { value: "deposit", label: "Deposit" },
  { value: "final_balance", label: "Final Balance" },
  { value: "partial_payment", label: "Partial Payment" },
  { value: "refund", label: "Refund" },
  { value: "other", label: "Other" },
] as const;
export const paymentRecordStatuses = [
  { value: "unpaid", label: "Unpaid" },
  { value: "paid", label: "Paid" },
  { value: "partially_paid", label: "Partially Paid" },
  { value: "refunded", label: "Refunded" },
  { value: "canceled", label: "Canceled" },
] as const;
export const paymentMethods = ["Cash", "Check", "Credit Card", "ACH", "Venmo", "Zelle", "Other"] as const;
export const optionLabel = (options: readonly { value: string; label: string }[], value: string) => options.find((item) => item.value === value)?.label ?? value.replaceAll("_", " ");
export const paymentTotal = (payments: Array<{ amount: string; payment_type: string; status: string }>) => payments.reduce((sum, payment) => {
  if (["canceled", "unpaid"].includes(payment.status)) return sum;
  const amount = Number(payment.amount || 0);
  return sum + (payment.payment_type === "refund" || payment.status === "refunded" ? -amount : amount);
}, 0);
