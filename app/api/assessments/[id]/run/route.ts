import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { runAssessment } from "@/lib/security/orchestrator";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const assessment = await prisma.assessment.findUnique({ where: { id } });
  if (!assessment) {
    return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
  }

  if (assessment.status === "RUNNING") {
    return NextResponse.json({ started: true, status: "RUNNING" });
  }

  if (assessment.status === "COMPLETED") {
    return NextResponse.json({ error: "Assessment already completed" }, { status: 409 });
  }

  await prisma.assessment.update({
    where: { id },
    data: { status: "RUNNING", startedAt: new Date() },
  });

  // Background execution for live progress polling (local/dev POC)
  void runAssessment(id).catch((err) => {
    console.error("Assessment failed:", err);
  });

  return NextResponse.json({ started: true, status: "RUNNING" });
}
