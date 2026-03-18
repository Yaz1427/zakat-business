"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export type PlanName = "free" | "pro" | "cabinet";

export interface UserPlanState {
  plan: PlanName;
  isPro: boolean;
  isCabinet: boolean;
  isPaid: boolean;
  archiveAccess: boolean;
  loading: boolean;
  calculationsThisYear: number;
  freeLimit: number;
  freeLimitReached: boolean;
}

export function useUserPlan(): UserPlanState {
  const { isLoaded, isSignedIn } = useUser();
  const [plan, setPlan] = useState<PlanName>("free");
  const [archiveAccess, setArchiveAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calculationsThisYear, setCalculationsThisYear] = useState(0);
  const [freeLimit, setFreeLimit] = useState(1);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    fetch("/api/user/plan")
      .then((r) => r.json())
      .then((d) => {
        setPlan(d.plan ?? "free");
        setArchiveAccess(!!d.archiveAccess);
        setCalculationsThisYear(d.calculationsThisYear ?? 0);
        setFreeLimit(d.freeLimit ?? 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoaded, isSignedIn]);

  const isPro = plan === "pro" || plan === "cabinet";
  const isCabinet = plan === "cabinet";
  const freeLimitReached = !isPro && calculationsThisYear >= freeLimit;

  return { plan, isPro, isCabinet, isPaid: isPro, archiveAccess, loading, calculationsThisYear, freeLimit, freeLimitReached };
}
