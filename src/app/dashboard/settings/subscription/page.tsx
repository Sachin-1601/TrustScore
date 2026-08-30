"use client";

import React, { Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { CreatorSettingsView } from "@/components/dashboard/CreatorSettingsView";
import { BusinessSettingsView } from "@/components/dashboard/BusinessSettingsView";

function SubscriptionContent() {
  const { role } = useAuth();

  if (role === "CREATOR") {
    return <CreatorSettingsView initialSection="subscription" />;
  }

  return <BusinessSettingsView />;
}

export default function SubscriptionSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading subscription settings...</div>}>
      <SubscriptionContent />
    </Suspense>
  );
}
