"use client";
import { FeatureError } from "@/components/ui/feature-error";
export default function MeasurementsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <FeatureError title="We could not load measurements." description="Please try again. Your measurement information has not been changed." reset={reset} />; }
