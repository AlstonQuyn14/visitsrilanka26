import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getPaddleEnvironment } from "@/lib/paddle";

export interface SubscriptionRow {
  id: string;
  status: string;
  product_id: string;
  price_id: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean | null;
  paddle_subscription_id: string;
}

function computeActive(sub: SubscriptionRow | null): boolean {
  if (!sub) return false;
  const future =
    !sub.current_period_end || new Date(sub.current_period_end) > new Date();
  if (["active", "trialing", "past_due"].includes(sub.status) && future)
    return true;
  if (sub.status === "canceled" && future) return true;
  return false;
}

/**
 * Reads the signed-in user's most recent subscription for the current payment
 * environment. `isActive` gates premium features (the AI Travel Assistant).
 */
export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh(uid: string) {
    const { data } = await supabase
      .from("subscriptions")
      .select(
        "id,status,product_id,price_id,current_period_end,cancel_at_period_end,paddle_subscription_id",
      )
      .eq("user_id", uid)
      .eq("environment", getPaddleEnvironment())
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setSubscription((data as SubscriptionRow) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null;
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (!uid) {
        setLoading(false);
        return;
      }
      refresh(uid);
      channel = supabase
        .channel(`subscriptions:${uid}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "subscriptions",
            filter: `user_id=eq.${uid}`,
          },
          () => refresh(uid),
        )
        .subscribe();
    });
    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return {
    subscription,
    userId,
    loading,
    isActive: computeActive(subscription),
    refresh: () => userId && refresh(userId),
  };
}
