import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { createAndQueueAssessment } from "@/lib/security/orchestrator";
import { attackModules } from "@/lib/security/attacks";

const CreateSchema = z.object({
  agentId: z.string().min(1),
  attackTypes: z
    .array(z.string())
    .min(1)
    .optional()
    .default(attackModules.map((m) => m.id)),
});

export async function GET() {
  const assessments = await prisma.assessment.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      agent: { select: { id: true, name: true } },
      _count: { select: { findings: true } },
    },
  });

  return NextResponse.json(
    assessments.map((a) => ({
      id: a.id,
      status: a.status,
      securityScore: a.securityScore,
      riskLevel: a.riskLevel,
      startedAt: a.startedAt,
      completedAt: a.completedAt,
      createdAt: a.createdAt,
      findingsCount: a._count.findings,
      agent: a.agent,
    }))
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = CreateSchema.parse(body);

    const agent = await prisma.agent.findUnique({ where: { id: data.agentId } });
    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const validIds = new Set(attackModules.map((m) => m.id));
    const attackTypes = data.attackTypes.filter((t) => validIds.has(t as never));
    if (attackTypes.length === 0) {
      return NextResponse.json(
        { error: "No valid attack types selected" },
        { status: 400 }
      );
    }

    const id = await createAndQueueAssessment({
      agentId: data.agentId,
      attackTypes: attackTypes as never[],
    });

    return NextResponse.json({ id }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid assessment configuration", details: err.issues },
        { status: 400 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
