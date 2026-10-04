import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { parseAgent } from "@/lib/agents/helpers";

const AgentUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().min(1).max(2000).optional(),
  model: z.string().min(1).max(80).optional(),
  systemPrompt: z.string().min(1).max(20000).optional(),
  memoryEnabled: z.boolean().optional(),
  tools: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
      })
    )
    .optional(),
  knowledgeSources: z.array(z.string()).optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agent = await prisma.agent.findUnique({
    where: { id },
    include: {
      assessments: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { findings: true } },
        },
      },
    },
  });

  if (!agent) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const lastCompleted = agent.assessments.find((a) => a.status === "COMPLETED");

  return NextResponse.json({
    ...parseAgent(agent),
    securityScore: lastCompleted?.securityScore ?? null,
    riskLevel: lastCompleted?.riskLevel ?? null,
    lastAssessment: lastCompleted
      ? {
          id: lastCompleted.id,
          securityScore: lastCompleted.securityScore,
          riskLevel: lastCompleted.riskLevel,
          completedAt: lastCompleted.completedAt,
        }
      : null,
    assessments: agent.assessments.map((a) => ({
      id: a.id,
      status: a.status,
      securityScore: a.securityScore,
      riskLevel: a.riskLevel,
      findingsCount: a._count.findings,
      startedAt: a.startedAt,
      completedAt: a.completedAt,
      createdAt: a.createdAt,
    })),
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data = AgentUpdateSchema.parse(body);

    const agent = await prisma.agent.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.model !== undefined && { model: data.model }),
        ...(data.systemPrompt !== undefined && { systemPrompt: data.systemPrompt }),
        ...(data.memoryEnabled !== undefined && {
          memoryEnabled: data.memoryEnabled,
        }),
        ...(data.tools !== undefined && {
          toolsJson: JSON.stringify(data.tools),
        }),
        ...(data.knowledgeSources !== undefined && {
          knowledgeSourcesJson: JSON.stringify(data.knowledgeSources),
        }),
      },
    });

    return NextResponse.json(parseAgent(agent));
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid agent configuration", details: err.issues },
        { status: 400 }
      );
    }
    console.error(err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
