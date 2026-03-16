"use client";

import { useState, useEffect } from "react";
import { 
  FileText, Upload, CheckCircle2, 
  XCircle, File, Loader2, ExternalLink,
  ShieldCheck, AlertCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentCenterProps {
  leadId: string;
}

export function DocumentCenter({ leadId }: DocumentCenterProps) {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await fetch(`/api/leads/${leadId}/documents`);
        const data = await res.json();
        setDocs(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDocs();
  }, [leadId]);

  const handleUpload = async (e: any) => {
    // Simulated upload for demonstration
    // In a real app, this would use a cloud storage provider (e.g. Supabase Storage, S3)
    setUploading(true);
    try {
      const res = await fetch(`/api/leads/${leadId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Academic_Transcript_2023.pdf",
          type: "TRANSCRIPT",
          url: "https://example.com/mock-transcript.pdf"
        })
      });
      
      if (res.ok) {
        const newDoc = await res.json();
        setDocs([newDoc, ...docs]);
        toast.success("Document uploaded successfully");
      }
    } catch (err) {
      toast.error("Failed to upload document");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="rounded-2xl border-slate-200 bg-white shadow-sm overflow-hidden">
      <CardHeader className="p-6 border-b border-slate-50 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" /> Enrollment Documents
        </CardTitle>
        <button 
          onClick={handleUpload}
          disabled={uploading}
          className="text-[10px] font-bold text-white py-1.5 px-3 bg-slate-900 hover:bg-slate-800 rounded-lg uppercase tracking-wider flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Upload className="h-3 w-3" />}
          Upload File
        </button>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-200 mx-auto" />
          </div>
        ) : docs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
             <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto">
               <File className="h-6 w-6 text-slate-200" />
             </div>
             <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No documents collected yet</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {docs.map((doc) => (
              <div key={doc.id} className="p-4 px-6 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs ring-4 ring-blue-50/10">
                    {doc.name.split('.').pop()?.toUpperCase() || 'FIL'}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      {doc.name}
                      {doc.verified ? (
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                      {doc.type} • {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href={doc.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="p-2 hover:bg-white rounded-lg border border-slate-100 text-slate-400 hover:text-blue-600 transition-all"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  {!doc.verified && (
                    <button className="text-[10px] font-bold text-emerald-600 py-1.5 px-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors uppercase tracking-wider">
                      Verify
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
