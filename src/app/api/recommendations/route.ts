import { NextResponse } from "next/server";
import { db } from "@/db/client";
import { RecommendationEngine } from "@/services/recommendationEngine";

export async function POST(req: Request) {
  try {
    const reqs = await req.json();
    const allCreators = await db.listCreators();

    const recommendations = RecommendationEngine.recommendCreators(allCreators, reqs, 6);
    return NextResponse.json({ recommendations });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Recommendation calculation failed" }, { status: 500 });
  }
}
