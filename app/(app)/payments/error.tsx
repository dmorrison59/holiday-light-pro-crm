"use client";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
export default function ErrorPage({ reset }: { reset: () => void }) { return <EmptyState title="Payment could not be loaded" description="Please try again. No payment information was changed." action={<Button onClick={reset}>Try Again</Button>} />; }
