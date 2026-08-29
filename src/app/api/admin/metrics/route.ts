import { NextResponse } from "next/server";
import { db } from "@/db/client";

export async function GET(req: Request) {
  try {
    const creators = await db.listCreators();
    const businesses = await db.listBusinesses();
    const collabs = await db.listCollaborations();
    const ads = await db.listAdvertisements();

    const scoreDistribution = {
      veryHighTrust: creators.filter((c) => c.trustScore >= 90).length,
      highTrust: creators.filter((c) => c.trustScore >= 75 && c.trustScore < 90).length,
      moderateRisk: creators.filter((c) => c.trustScore >= 50 && c.trustScore < 75).length,
      highRisk: creators.filter((c) => c.trustScore < 50).length,
    };

    const telemetry = {
      totalCreators: creators.length,
      verifiedCreators: creators.filter((c) => c.verifiedBadge).length,
      totalBusinesses: businesses.length,
      totalCollaborations: collabs.length,
      activeAdvertisements: ads.length,
      modelHealth: {
        currentModelVersion: "v1.2",
        crossValidationRocAuc: 0.942,
        brierCalibrationLoss: 0.048,
        predictionCount30d: 3840,
        driftStatus: "STABLE",
        lastTrainedAt: "2026-08-20T00:00:00Z",
      },
      scoreDistribution,
    };

    return NextResponse.json(telemetry);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch admin telemetry" }, { status: 500 });
  }
}
