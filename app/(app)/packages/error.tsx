"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
export default function PackagesError({ reset }: { reset: () => void }) { return <Card><CardContent className="p-8 text-center"><h2 className="text-lg font-bold text-slate-950">Packages could not be loaded</h2><p className="mt-2 text-sm text-slate-600">Please try again. Your package data has not been changed.</p><Button className="mt-5" onClick={reset}>Try Again</Button></CardContent></Card>; }
