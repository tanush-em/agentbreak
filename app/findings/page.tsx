"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/page-header";
import { SeverityBadge } from "@/components/shared/severity-badge";
import {
  FindingDrawer,
  FindingDetail,
} from "@/components/findings/finding-drawer";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

type FindingRow = FindingDetail & {
  createdAt: string;
  assessmentId: string;
  agent: { id: string; name: string };
};

export default function FindingsPage() {
  const [findings, setFindings] = useState<FindingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<FindingDetail | null>(null);

  useEffect(() => {
    fetch("/api/findings")
      .then((r) => r.json())
      .then((data) => {
        setFindings(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-6">
      <PageHeader
        title="Findings"
        description="Vulnerabilities discovered across all assessments"
      />

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : findings.length === 0 ? (
        <div className="rounded-md border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No findings yet. Run a security assessment to generate results.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-card text-left text-xs text-muted-foreground">
                <th className="px-3 py-2.5 font-medium">Severity</th>
                <th className="px-3 py-2.5 font-medium">Finding</th>
                <th className="px-3 py-2.5 font-medium">Agent</th>
                <th className="px-3 py-2.5 font-medium">Attack</th>
                <th className="px-3 py-2.5 font-medium">Mode</th>
                <th className="px-3 py-2.5 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f) => (
                <tr
                  key={f.id}
                  className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-muted/30"
                  onClick={() =>
                    setSelected({
                      ...f,
                      agentName: f.agent.name,
                    })
                  }
                >
                  <td className="px-3 py-2.5">
                    <SeverityBadge value={f.severity} />
                  </td>
                  <td className="px-3 py-2.5 font-medium">{f.title}</td>
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/agents/${f.agent.id}`}
                      className="hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {f.agent.name}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {f.attackName || "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    {f.mode ? <SeverityBadge value={f.mode} /> : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-muted-foreground">
                    {formatDate(f.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FindingDrawer
        finding={selected}
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
      />
    </div>
  );
}
