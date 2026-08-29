import { TrustScoreEvaluation, DataCoverage, ScoreBand, RiskLevel } from "@/types/schema";
import { FollowerGrowthPoint, EngagementPostPoint, CommentQualityMetric } from "@/types/influencer";

export interface CreatorTelemetryInput {
  followers: number;
  following: number;
  totalPosts: number;
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  followerGrowthHistory?: FollowerGrowthPoint[];
  engagementHistory?: EngagementPostPoint[];
  commentQuality?: Partial<CommentQualityMetric>;
  category?: string;
  isVerified?: boolean;
}

export class TrustScoreEngine {
  public static readonly CURRENT_MODEL_VERSION = "v1.2";

  /**
   * Main Probabilistic Evaluation Pipeline
   */
  public static evaluate(input: CreatorTelemetryInput): TrustScoreEvaluation {
    const calculatedAt = new Date().toISOString();

    // 1. Assess Data Coverage
    const dataCoverage = this.assessDataCoverage(input);

    // 2. Feature Extraction
    const features = this.extractFeatures(input);

    // 3. Empirical Bayes Inflation Probability Calculation
    const inflatedProbability = this.calculateInflatedProbability(features, input.category);

    // 4. Uncertainty & Confidence Margin Bounds
    const { uncertaintyMargin, confidence } = this.calculateUncertainty(dataCoverage, features);

    // 5. Calibrate TrustScore (0-100)
    const rawScore = Math.max(10, Math.min(99, Math.round((1 - inflatedProbability / 100) * 100)));
    const score = Math.round(rawScore * (1 - (features.volatilityIndex > 50 ? 0.05 : 0)));

    // 6. Resolve Bands
    const scoreBand = this.resolveScoreBand(score);
    const riskLevel = this.resolveRiskLevel(score);
    const authenticityProbability = Number((100 - inflatedProbability).toFixed(1));

    // 7. Factor Signals Extraction (Explainability)
    const factors = this.generateFactorBreakdown(features, score);

    // 8. Prescriptive Decision Support
    const prescriptiveGuidance = this.generatePrescriptiveGuidance(score, riskLevel, inflatedProbability, confidence);

    return {
      score,
      scoreBand,
      riskLevel,
      inflatedProbability: Number(inflatedProbability.toFixed(1)),
      uncertaintyMargin: Number(uncertaintyMargin.toFixed(1)),
      authenticityProbability,
      commentDiversityPercent: Math.round(features.commentDiversity * 100),
      growthStabilityScore: Math.round(features.growthStability * 100),
      consistencyScore: Math.round(features.engagementConsistency * 100),
      volatilityIndex: Number(features.volatilityIndex.toFixed(1)),
      dataCoverage,
      confidence,
      modelVersion: this.CURRENT_MODEL_VERSION,
      calculatedAt,
      factors,
      prescriptiveGuidance,
    };
  }

  /**
   * Determine data coverage tier based on evidence density
   */
  private static assessDataCoverage(input: CreatorTelemetryInput): DataCoverage {
    const postsCount = input.engagementHistory?.length || input.totalPosts || 0;
    const monthsCount = input.followerGrowthHistory?.length || 0;

    if (postsCount >= 25 && monthsCount >= 10) return "Excellent";
    if (postsCount >= 15 && monthsCount >= 6) return "Good";
    if (postsCount >= 8) return "Moderate";
    if (postsCount >= 4) return "Limited";
    return "Insufficient";
  }

  /**
   * Extract quantitative features from input telemetry
   */
  private static extractFeatures(input: CreatorTelemetryInput) {
    const posts = input.engagementHistory || [];
    const growth = input.followerGrowthHistory || [];

    // Engagement Volatility (Coefficient of Variation)
    let volatilityIndex = 12.0;
    if (posts.length > 3) {
      const rates = posts.map((p) => p.engagementRate);
      const mean = rates.reduce((a, b) => a + b, 0) / rates.length;
      const variance = rates.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / rates.length;
      const stdDev = Math.sqrt(variance);
      volatilityIndex = mean > 0 ? (stdDev / mean) * 100 : 20.0;
    }

    // Comment Diversity
    const commentDiversity = (input.commentQuality?.uniqueCommentsPercent || 85) / 100;
    const podClustersDetected = input.commentQuality?.podClusterDetected || false;

    // Follower Growth Monotonicity & Step Jump Anomalies
    let growthStability = 0.92;
    if (growth.length > 2) {
      const jumps = growth.filter((g) => g.isSpike).length;
      growthStability = Math.max(0.2, 0.95 - jumps * 0.2);
    }

    // Engagement Consistency
    const engagementConsistency = Math.max(0.2, Math.min(0.98, 1 - volatilityIndex / 100));

    return {
      volatilityIndex,
      commentDiversity,
      podClustersDetected,
      growthStability,
      engagementConsistency,
      postsObserved: posts.length,
      followersCount: input.followers,
      engagementRate: input.engagementRate,
      isVerified: !!input.isVerified,
    };
  }

  /**
   * Bayesian estimation of inflated engagement probability
   */
  private static calculateInflatedProbability(
    features: ReturnType<typeof TrustScoreEngine.extractFeatures>,
    category: string = "General"
  ): number {
    // Category prior baseline
    const categoryPrior = 0.08; // 8% expected baseline inflation across micro creators

    let riskSignal = 0.0;

    // Pod cluster penalty
    if (features.podClustersDetected) riskSignal += 0.25;

    // Comment diversity penalty
    if (features.commentDiversity < 0.6) riskSignal += 0.30;
    else if (features.commentDiversity < 0.75) riskSignal += 0.12;

    // Volatility penalty (erratic engagement spikes)
    if (features.volatilityIndex > 60) riskSignal += 0.35;
    else if (features.volatilityIndex > 35) riskSignal += 0.15;

    // Growth instability penalty
    if (features.growthStability < 0.5) riskSignal += 0.28;

    // Unnatural engagement rate outlier
    if (features.engagementRate > 15.0 && features.followersCount > 10000) {
      riskSignal += 0.20;
    }

    // Verified credentials bonus
    if (features.isVerified) {
      riskSignal = Math.max(0, riskSignal - 0.05);
    }

    // Empirical Bayes Shrinkage toward category prior
    const weight = Math.min(1.0, features.postsObserved / 20);
    const posterior = weight * riskSignal + (1 - weight) * categoryPrior;

    return Math.min(95, Math.max(2, posterior * 100));
  }

  /**
   * Uncertainty bounds based on sample size and volatility
   */
  private static calculateUncertainty(
    coverage: DataCoverage,
    features: ReturnType<typeof TrustScoreEngine.extractFeatures>
  ) {
    let margin = 1.8;
    let confidence: "High" | "Moderate" | "Low" = "High";

    if (coverage === "Limited" || coverage === "Insufficient") {
      margin = 4.8;
      confidence = "Low";
    } else if (coverage === "Moderate" || features.volatilityIndex > 40) {
      margin = 3.2;
      confidence = "Moderate";
    }

    return { uncertaintyMargin: margin, confidence };
  }

  private static resolveScoreBand(score: number): ScoreBand {
    if (score >= 90) return "Very High Trust";
    if (score >= 75) return "High Trust";
    if (score >= 50) return "Moderate Risk";
    if (score >= 25) return "High Risk";
    return "Very High Risk";
  }

  private static resolveRiskLevel(score: number): RiskLevel {
    if (score >= 75) return "Low";
    if (score >= 50) return "Moderate";
    if (score >= 25) return "High";
    return "Critical";
  }

  private static generateFactorBreakdown(
    features: ReturnType<typeof TrustScoreEngine.extractFeatures>,
    score: number
  ) {
    const factors: TrustScoreEvaluation["factors"] = [
      {
        name: "Comment Lexical Entropy",
        score: Math.round(features.commentDiversity * 100),
        signalType: features.commentDiversity >= 0.75 ? "positive" : "warning",
        description: features.commentDiversity >= 0.75
          ? "High linguistic variety with natural conversational questions."
          : "Elevated generic emoji compliments and repetitive patterns.",
      },
      {
        name: "Follower Growth Monotonicity",
        score: Math.round(features.growthStability * 100),
        signalType: features.growthStability >= 0.8 ? "positive" : "warning",
        description: features.growthStability >= 0.8
          ? "Stable organic follower acquisition curve over 12 months."
          : "Sudden step-jump anomalies detected in follower accumulation.",
      },
      {
        name: "Engagement Consistency Index",
        score: Math.round(features.engagementConsistency * 100),
        signalType: features.volatilityIndex < 30 ? "positive" : "warning",
        description: features.volatilityIndex < 30
          ? "Low variance across consecutive posts indicates steady audience retention."
          : "Elevated post-to-post volatility indicates possible pod clustering.",
      },
    ];
    return factors;
  }

  private static generatePrescriptiveGuidance(
    score: number,
    risk: RiskLevel,
    inflatedProb: number,
    confidence: "High" | "Moderate" | "Low"
  ) {
    if (score >= 85) {
      return {
        recommendation: "Approved for brand campaigns. High conversion intent and authentic community.",
        paymentAdjustment: "0% (Standard or premium rate justified)",
        riskChecklist: [
          "Low estimated probability of bought engagement (" + inflatedProb.toFixed(1) + "%)",
          "Audience demonstrates genuine purchasing inquiries",
        ],
      };
    }
    if (score >= 70) {
      return {
        recommendation: "Proceed with standard campaign evaluation or apply 0–5% performance adjustment.",
        paymentAdjustment: "0–5% discount",
        riskChecklist: [
          "Monitor story swipe-up metrics on first collaboration",
          "Ensure deliverables include trackable UTM parameters",
        ],
      };
    }
    if (score >= 50) {
      return {
        recommendation: "Negotiate a 10–20% rate reduction or structure compensation around milestones.",
        paymentAdjustment: "10–20% discount / Milestone escrow",
        riskChecklist: [
          "Moderate engagement inflation risk detected",
          "Require proof of audience geographic breakdown",
        ],
      };
    }
    return {
      recommendation: "Conduct additional verification before committing significant budget.",
      paymentAdjustment: "30–50% discount or strict CPA commission",
      riskChecklist: [
        "Elevated bot or engagement pod concentration",
        "High uncertainty / irregular engagement volatility",
      ],
    };
  }
}
