"use client";
import { FeatureError } from "@/components/ui/feature-error";
export default function SiteVisitsError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <FeatureError title="We could not load site visits." description="Please try again. Your visit information has not been changed." reset={reset} />; }
