"use client";

import { FeatureError } from "@/components/ui/feature-error";

export default function CustomersError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <FeatureError title="We could not load your customers." description="Please try again. Your customer information has not been changed." reset={reset} />;
}
