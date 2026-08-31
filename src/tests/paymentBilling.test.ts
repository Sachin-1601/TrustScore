import { PricingService, SAAS_PLANS, ADDON_CREDIT_PACKS } from "../services/pricingService";

function runBillingTests() {
  console.log("==================================================");
  console.log("🧪 Running TrustScore Billing & Pricing Unit Tests");
  console.log("==================================================");

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Pricing Consistency & Mathematical Savings Validation
  console.log("\n[1] Testing Pricing Math & Discount Calculation");
  const starter = PricingService.getPlanById("starter");
  const growth = PricingService.getPlanById("growth");
  const agency = PricingService.getPlanById("agency");

  assert(starter.priceMonthly === 39, "Starter monthly price is $39");
  assert(starter.priceAnnual === 29, "Starter annual effective monthly price is $29");
  const starterAnnualTotal = PricingService.getAnnualBilledTotal(starter);
  assert(starterAnnualTotal === 348, `Starter annual total is $348/yr (got $${starterAnnualTotal})`);
  const starterSavings = PricingService.getSavingsPercentage(starter);
  assert(starterSavings === 26, `Starter savings is exactly 26% (got ${starterSavings}%)`);

  assert(growth.priceMonthly === 99, "Growth monthly price is $99");
  assert(growth.priceAnnual === 79, "Growth annual effective monthly price is $79");
  const growthAnnualTotal = PricingService.getAnnualBilledTotal(growth);
  assert(growthAnnualTotal === 948, `Growth annual total is $948/yr (got $${growthAnnualTotal})`);
  const growthSavings = PricingService.getSavingsPercentage(growth);
  assert(growthSavings === 20, `Growth savings is exactly 20% (got ${growthSavings}%)`);

  assert(agency.priceMonthly === 249, "Agency monthly price is $249");
  assert(agency.priceAnnual === 199, "Agency annual effective monthly price is $199");
  const agencyAnnualTotal = PricingService.getAnnualBilledTotal(agency);
  assert(agencyAnnualTotal === 2388, `Agency annual total is $2,388/yr (got $${agencyAnnualTotal})`);
  const agencySavings = PricingService.getSavingsPercentage(agency);
  assert(agencySavings === 20, `Agency savings is exactly 20% (got ${agencySavings}%)`);

  // 2. Audit Quotas Alignment
  console.log("\n[2] Testing Plan Creator Audit Quotas");
  assert(starter.creatorChecksMonthly === 25, "Starter includes 25 audits / mo");
  assert(growth.creatorChecksMonthly === 100, "Growth includes 100 audits / mo");
  assert(agency.creatorChecksMonthly === 300, "Agency includes 300 audits / mo");

  // 3. Add-on Credit Packs
  console.log("\n[3] Testing Add-on Credit Packs");
  const packs = PricingService.getAddonPacks();
  assert(packs.length === 3, "3 Add-on packs available");
  assert(packs[0].checksCount === 25 && packs[0].price === 29, "Starter Boost: 25 checks for $29");
  assert(packs[1].checksCount === 75 && packs[1].price === 69, "Campaign Surge: 75 checks for $69");
  assert(packs[2].checksCount === 200 && packs[2].price === 149, "Enterprise Batch: 200 checks for $149");

  // 4. Recommendation Engine
  console.log("\n[4] Testing Plan Recommendation");
  assert(PricingService.getRecommendedPlan(10).id === "starter", "10 audits recommends Starter");
  assert(PricingService.getRecommendedPlan(25).id === "starter", "25 audits recommends Starter");
  assert(PricingService.getRecommendedPlan(50).id === "growth", "50 audits recommends Growth");
  assert(PricingService.getRecommendedPlan(100).id === "growth", "100 audits recommends Growth");
  assert(PricingService.getRecommendedPlan(200).id === "agency", "200 audits recommends Agency");

  console.log("\n==================================================");
  console.log(`Results: ${passed} Passed, ${failed} Failed`);
  console.log("==================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runBillingTests();
