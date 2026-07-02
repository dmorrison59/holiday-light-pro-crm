"use client";

import { FeatureError } from "@/components/ui/feature-error";

export default function PropertiesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <FeatureError title="We could not load this property." description="Please try again. The property information has not been changed." reset={reset} />;
}
