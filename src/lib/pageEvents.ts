import { createClientUuid } from "@/lib/clientUuid";
import { getSupabaseClient } from "@/lib/supabaseClient";

const SESSION_ID_KEY = "k-work-daily-practice:session-id";
const UTM_KEY = "k-work-daily-practice:utm";

export type ExamEventName =
  | "landing_viewed"
  | "test_intro_viewed"
  | "test_started"
  | "question_answered"
  | "test_submitted"
  | "result_viewed"
  | "share_clicked"
  | "opt_in_submitted"
  | "retake_clicked"
  | "question_bank_fallback"
  | "exam_load_failed";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
};

const sensitiveMetadataKeys = [
  "name",
  "contact",
  "email",
  "phone",
  "whatsapp",
];

const safeMetadataKeys = ["contacttype", "optinchannel"];

export async function trackExamEvent(
  eventName: ExamEventName,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    const utm = readClientUtmParams();
    const attemptId =
      typeof metadata.attemptId === "string" ? metadata.attemptId : null;

    const { error } = await supabase.from("page_events").insert({
      event_name: eventName,
      path: window.location.pathname,
      session_id: getSessionId(),
      attempt_id: attemptId,
      metadata: sanitizeEventMetadata(metadata),
      user_agent: window.navigator.userAgent || null,
      referrer: document.referrer || null,
      utm_source: utm.utm_source ?? null,
      utm_medium: utm.utm_medium ?? null,
      utm_campaign: utm.utm_campaign ?? null,
    });

    if (error) return;
  } catch {
    // Funnel tracking must never block the public test flow.
  }
}

export function getAnonymousSessionIdForEvents() {
  if (typeof window === "undefined") return null;

  try {
    return getSessionId();
  } catch {
    return createClientUuid();
  }
}

function getSessionId() {
  try {
    const existingSessionId = window.localStorage.getItem(SESSION_ID_KEY);
    if (existingSessionId) return existingSessionId;

    const sessionId = createClientUuid();
    window.localStorage.setItem(SESSION_ID_KEY, sessionId);
    return sessionId;
  } catch {
    return createClientUuid();
  }
}

function sanitizeEventMetadata(metadata: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(metadata).flatMap(([key, value]) => {
      if (isSensitiveKey(key)) return [];

      const sanitizedValue = toJsonValue(value);
      return sanitizedValue === undefined ? [] : [[key, sanitizedValue]];
    }),
  );
}

function toJsonValue(value: unknown): JsonValue | undefined {
  if (value === null) return null;
  if (["string", "number", "boolean"].includes(typeof value)) {
    return value as string | number | boolean;
  }

  if (Array.isArray(value)) {
    const sanitizedArray = value
      .map(toJsonValue)
      .filter((item): item is JsonValue => item !== undefined);
    return sanitizedArray;
  }

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).flatMap(([key, item]) => {
        if (isSensitiveKey(key)) return [];

        const sanitizedItem = toJsonValue(item);
        return sanitizedItem === undefined ? [] : [[key, sanitizedItem]];
      }),
    );
  }

  return undefined;
}

function isSensitiveKey(key: string) {
  const normalizedKey = key.toLowerCase();
  if (safeMetadataKeys.includes(normalizedKey)) return false;

  return sensitiveMetadataKeys.some((sensitiveKey) =>
    normalizedKey.includes(sensitiveKey),
  );
}

function readClientUtmParams(): UtmParams {
  if (typeof window === "undefined") return {};

  const currentUtm = getUtmParams(new URLSearchParams(window.location.search));
  if (hasUtmParams(currentUtm)) {
    try {
      window.localStorage.setItem(UTM_KEY, JSON.stringify(currentUtm));
    } catch {
      return currentUtm;
    }
    return currentUtm;
  }

  try {
    const storedUtm = window.localStorage.getItem(UTM_KEY);
    if (!storedUtm) return {};
    return JSON.parse(storedUtm) as UtmParams;
  } catch {
    return {};
  }
}

function getUtmParams(searchParams: URLSearchParams): UtmParams {
  const utm: UtmParams = {};
  const source = searchParams.get("utm_source");
  const medium = searchParams.get("utm_medium");
  const campaign = searchParams.get("utm_campaign");

  if (source) utm.utm_source = source;
  if (medium) utm.utm_medium = medium;
  if (campaign) utm.utm_campaign = campaign;

  return utm;
}

function hasUtmParams(utm: UtmParams) {
  return Boolean(utm.utm_source || utm.utm_medium || utm.utm_campaign);
}
