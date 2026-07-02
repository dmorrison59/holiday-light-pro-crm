"use client";
import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { DatabaseZap } from "lucide-react";
import { createDemoDataAction } from "@/app/actions/demo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
function CreateButton() { const { pending } = useFormStatus(); return <Button type="submit" disabled={pending}><DatabaseZap className="mr-2 size-4" />{pending ? "Creating demo workspace…" : "Create Demo Data"}</Button>; }
export function DemoDataCard() { const [state, action] = useActionState(createDemoDataAction, {}); return <Card><CardHeader><h2 className="font-bold text-slate-950">Demo Workspace</h2><p className="mt-1 text-sm text-slate-500">Create the Sarah Johnson walkthrough in an empty organization.</p></CardHeader><CardContent className="space-y-4"><p className="text-sm leading-6 text-slate-600">This adds realistic catalog items, a property, site visit, measurements, approved quote, scheduled job, events, and deposit. It never deletes data and refuses to run in a workspace that already has customers.</p>{state.error ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-800">{state.error}</p> : null}{state.success ? <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm font-medium text-emerald-800">{state.success}</p> : null}<div className="flex flex-wrap gap-3"><form action={action}><CreateButton /></form>{state.customerId ? <Link href={`/customers/${state.customerId}`} className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 text-sm font-semibold">Open Sarah Johnson</Link> : null}</div></CardContent></Card>; }
