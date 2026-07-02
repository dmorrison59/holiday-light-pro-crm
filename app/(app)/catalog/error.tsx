"use client";
import { FeatureError } from "@/components/ui/feature-error";
export default function CatalogError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <FeatureError title="We could not load your catalog." description="Please try again. Your catalog information has not been changed." reset={reset} />; }
