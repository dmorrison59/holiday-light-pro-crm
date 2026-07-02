export const quoteStatuses = ["draft", "sent", "viewed", "approved", "declined", "expired"] as const;
export type QuoteStatus = typeof quoteStatuses[number];
