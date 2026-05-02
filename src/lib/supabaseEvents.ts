import { getSupabaseClient } from "@/lib/supabaseClient";
import type { TargetIndustry, UtmParams } from "@/lib/exam";

type NullableUtmParams = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
};

export type SaveTestAttemptPayload = NullableUtmParams & {
  total_score: number;
  total_questions: number;
  vocabulary_score: number;
  grammar_score: number;
  reading_score: number;
  workplace_score: number;
  weakest_sections: string[];
  target_industry: TargetIndustry | null;
  user_agent: string | null;
  referrer: string | null;
};

export type SaveOptInLeadPayload = NullableUtmParams & {
  name: string | null;
  contact: string;
  contact_type: string | null;
  target_industry: TargetIndustry | null;
  total_score: number | null;
  consent: true;
  source: "result_page_opt_in";
};

export type SaveShareEventPayload = NullableUtmParams & {
  attempt_id: string | null;
  total_score: number | null;
  channel: "web_share" | "whatsapp" | "copy_link" | "facebook" | null;
};

export async function saveTestAttempt(payload: SaveTestAttemptPayload) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  const id = createClientUuid();

  try {
    const { error } = await supabase.from("test_attempts").insert({
      id,
      ...payload,
    });

    if (error) return null;
    return id;
  } catch {
    return null;
  }
}

export async function saveOptInLead(payload: SaveOptInLeadPayload) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  try {
    const { error } = await supabase.from("opt_in_leads").insert(payload);

    if (error) return null;
    return true;
  } catch {
    return null;
  }
}

export async function saveShareEvent(payload: SaveShareEventPayload) {
  const supabase = getSupabaseClient();

  if (!supabase) {
    return null;
  }

  try {
    const { error } = await supabase.from("share_events").insert(payload);

    if (error) return null;
    return true;
  } catch {
    return null;
  }
}

export function normalizeUtmParams(utm: UtmParams): NullableUtmParams {
  return {
    utm_source: utm.utm_source ?? null,
    utm_medium: utm.utm_medium ?? null,
    utm_campaign: utm.utm_campaign ?? null,
  };
}

function createClientUuid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}
