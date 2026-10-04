import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { parseAgent } from "@/lib/agents/helpers";

const AgentSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(2000),
  model: z.string().min(1).max(80),
  systemPrompt: z.string().min(1).max(20000),
  memoryEnabled: z.boolean().optional().default(false),
  tools: z
    .array(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
      })
    )
    .optional()
    .default([]),
  knowledgeSources: z.array(z.string()).optional().default([]),
});

export async function GET() {
  const agents = await prisma.agent.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      assessments: {
        where: { status: "COMPLETED" },
        orderBy: { completedAt: "desc" },
        take: 1,
      },
    },
  });

  return NextResponse.json(
    agents.map((a) => ({
      ...parseAgent(a),
      lastAssessment: a.assessments[0]
        ? {
            id: a.assessments[0].id,
            securityScore: a.assessments[0].securityScore,
            riskLevel: a.assessments[0].riskLevel,
            completedAt: a.assessments[0].completedAt,
            status: a.assessments[0].status,
          }
        : null,
    }))
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = AgentSchema.parse(body);

    const agent = await prisma.agent.create({
      data: {
        name: data.name,
        description: data.description,
        model: data.model,
        systemPrompt: data.systemPrompt,
        memoryEnabled: data.memoryEnabled,
        toolsJson: JSON.stringify(data.tools),
        knowledgeSourcesJson: JSON.stringify(data.knowledgeSources),
      },
    });

    return NextResponse.json(parseAgent(agent), { status: 201 });
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
