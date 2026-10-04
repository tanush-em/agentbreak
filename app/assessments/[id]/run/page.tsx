import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/shared/page-header";
import { LiveRunner } from "@/components/assessments/live-runner";

export const dynamic = "force-dynamic";

export default async function LiveAssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    include: {
      agent: { select: { name: true } },
      executions: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!assessment) notFound();

  return (
    <div className="p-6">
      <PageHeader
        title="Live Assessment"
        description="Adversarial tests executing against the target agent"
      />
      <LiveRunner
        assessmentId={assessment.id}
        initial={{
          id: assessment.id,
          status: assessment.status,
          securityScore: assessment.securityScore,
          riskLevel: assessment.riskLevel,
          agent: assessment.agent,
          executions: assessment.executions,
        }}
      />
    </div>
  );
}
