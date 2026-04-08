"use client";

import { FormEvent, useState } from "react";
import { Database, Loader2, Search, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface DebugRecord {
  id?: string;
  email?: string | null;
  phone?: string | null;
  phone_number?: string | null;
  name?: string | null;
  status?: string | null;
  created_at?: string | null;
  description?: string | null;
  type?: string | null;
  notes?: string | null;
  search_query?: string | null;
  lead_id?: string | null;
}

interface DebugResponse {
  filters: {
    email: string | null;
    phone: string | null;
    limit: number;
  };
  storage: {
    legacy_leads: DebugRecord[];
    crm_leads: DebugRecord[];
    lead_activities: DebugRecord[];
  };
  errors: {
    legacy: string | null;
    crm: string | null;
    activities: string | null;
  };
  summary: {
    legacy_count: number;
    crm_count: number;
    activity_count: number;
  };
  error?: string;
}

function DataPanel({
  title,
  subtitle,
  rows,
}: {
  title: string;
  subtitle: string;
  rows: DebugRecord[];
}) {
  return (
    <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
      <CardHeader className="border-b border-slate-100">
        <CardTitle className="text-base font-black text-slate-900">{title}</CardTitle>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{subtitle}</p>
      </CardHeader>
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="p-6 text-sm font-medium text-slate-400">No records found for the current filters.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <div key={row.id ?? `${title}-${index}`} className="p-4 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-slate-900">{row.name || row.email || row.phone || row.phone_number || row.id || "Record"}</p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {row.status || row.type || "stored"}
                  </span>
                </div>
                {row.email && <p className="text-xs font-medium text-slate-500">Email: {row.email}</p>}
                {(row.phone || row.phone_number) && (
                  <p className="text-xs font-medium text-slate-500">Phone: {row.phone || row.phone_number}</p>
                )}
                {row.search_query && <p className="text-xs font-medium text-slate-500">Query: {row.search_query}</p>}
                {row.notes && <p className="text-xs font-medium text-slate-500">Notes: {row.notes}</p>}
                {row.description && <p className="text-xs font-medium text-slate-500">Activity: {row.description}</p>}
                {row.created_at && (
                  <p className="text-[11px] font-bold text-slate-400">
                    {new Date(row.created_at).toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function LeadDebugPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [debugKey, setDebugKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DebugResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (email.trim()) params.set("email", email.trim());
      if (phone.trim()) params.set("phone", phone.trim());
      if (debugKey.trim()) params.set("key", debugKey.trim());

      const response = await fetch(`/api/admin/leads/debug?${params.toString()}`);
      const data = (await response.json()) as DebugResponse;

      if (!response.ok) {
        throw new Error(data.error || "Failed to inspect lead storage.");
      }

      setResult(data);
    } catch (err) {
      console.error(err);
      setResult(null);
      setError(err instanceof Error ? err.message : "Failed to inspect lead storage.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
      <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-8 text-white shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-white/10 p-3">
            <Database className="h-6 w-6 text-blue-300" />
          </div>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-300 mb-2">Lead Storage Debug</p>
            <h1 className="text-3xl font-black tracking-tight">Verify what the student form saved.</h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">
              Search by email or phone to inspect whether a submission reached `user_leads`, `leads`, and `lead_activities`.
            </p>
          </div>
        </div>
      </div>

      <Card className="rounded-3xl border-slate-200 bg-white shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-black text-slate-900">Search Submission</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="student@email.com"
              className="border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 hover:bg-slate-50 focus:border-blue-500"
            />
            <Input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="9876543210"
              className="border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 hover:bg-slate-50 focus:border-blue-500"
            />
            <Input
              value={debugKey}
              onChange={(event) => setDebugKey(event.target.value)}
              placeholder="Debug key for production"
              className="border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 hover:bg-slate-50 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-black text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Inspect Storage
            </button>
          </form>
          <div className="mt-4 flex items-start gap-2 text-xs font-semibold text-slate-500">
            <ShieldAlert className="mt-0.5 h-4 w-4 text-amber-500" />
            Use `LEAD_DEBUG_KEY` in production. In local development this page works without a key.
          </div>
          {error && (
            <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {result && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Legacy Leads", value: result.summary.legacy_count },
              { label: "CRM Leads", value: result.summary.crm_count },
              { label: "Lead Activities", value: result.summary.activity_count },
            ].map((item) => (
              <Card key={item.label} className="rounded-3xl border-slate-200 bg-white shadow-sm">
                <CardContent className="p-6">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{item.label}</p>
                  <p className="mt-2 text-3xl font-black text-slate-900">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <DataPanel
              title="Legacy Table"
              subtitle={result.errors.legacy ? `Error: ${result.errors.legacy}` : "user_leads"}
              rows={result.storage.legacy_leads}
            />
            <DataPanel
              title="CRM Table"
              subtitle={result.errors.crm ? `Error: ${result.errors.crm}` : "leads"}
              rows={result.storage.crm_leads}
            />
            <DataPanel
              title="Activity Log"
              subtitle={result.errors.activities ? `Error: ${result.errors.activities}` : "lead_activities"}
              rows={result.storage.lead_activities}
            />
          </div>
        </>
      )}
    </div>
  );
}
