"use client";

import { useEffect } from "react";
import {
  trackExamEvent,
  type ExamEventName,
} from "@/lib/pageEvents";

type PageEventTrackerProps = {
  eventName: Extract<ExamEventName, "landing_viewed" | "test_intro_viewed">;
};

export function PageEventTracker({ eventName }: PageEventTrackerProps) {
  useEffect(() => {
    void trackExamEvent(eventName);
  }, [eventName]);

  return null;
}
