"use client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
export default function ErrorPage({ reset }: { reset: () => void }) { return <EmptyState title="Jobs could not be loaded" description="Please try again. Your job data has not been changed." action={<Button onClick={reset}>Try Again</Button>} />; }
