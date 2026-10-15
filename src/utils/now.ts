import { useEffect, useState } from "react";
import type { Day, Lesson, LessonState, Now, Schedule } from "@types";

const SOON_MINUTES = 10; // сайт подсвечивает пару за 10 минут до начала

const formatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Moscow",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23", // иначе в полночь может прийти "24"
});

export const getNow = (d = new Date()): Now => {
  const p = Object.fromEntries(
    formatter.formatToParts(d).map((x) => [x.type, x.value]),
  );
  return {
    isoDate: `${p.year}-${p.month}-${p.day}`,
    minutes: Number(p.hour) * 60 + Number(p.minute),
  };
};

const toMinutes = (time: string) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

/** Пара — полуинтервал [start, end): в 09:30 первая пара уже закончилась */
export const getLessonState = (
  day: Day,
  lesson: Lesson,
  now: Now,
): LessonState => {
  if (day.date !== now.isoDate) {
    return day.date < now.isoDate ? "past" : "upcoming";
  }
  const start = toMinutes(lesson.startTime);
  const end = toMinutes(lesson.endTime);

  if (now.minutes >= end) return "past";
  if (now.minutes >= start) return "now";
  if (now.minutes >= start - SOON_MINUTES) return "soon";
  return "upcoming";
};

/** Номер недели, в которой есть сегодняшний день */
export const getCurrentWeek = (
  schedule: Schedule | null,
  now: Now,
): number | undefined => {
  for (const [n, days] of Object.entries(schedule?.weeks ?? {})) {
    if (days.some((d) => d.date === now.isoDate)) return Number(n);
  }
  return undefined;
};

/** Обновляется ровно на границе каждой минуты и при возврате на вкладку */
export function useNow(): Now {
  const [now, setNow] = useState<Now>(() => getNow());

  useEffect(() => {
    let timer: number;

    const tick = () => {
      setNow(getNow());
      timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);
    };
    timer = window.setTimeout(tick, 60_000 - (Date.now() % 60_000) + 50);

    // фоновые вкладки throttle'ятся, поэтому обновляемся при возврате
    const onVisible = () => {
      if (document.visibilityState === "visible") setNow(getNow());
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return now;
}
