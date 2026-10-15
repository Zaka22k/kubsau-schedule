import axios from "axios";
import type { Day, Lesson, Schedule } from "@types";

const clean = (s: string | null | undefined) =>
  (s ?? "").replace(/\s+/g, " ").trim();

const WEEKS = {
  1: ".schedule-first-week",
  2: ".schedule-second-week",
} as const;

/** Копия элемента без вложенных <span> (нужна, чтобы получить «чистый» текст) */
const textWithoutSpans = (el: Element | null | undefined) => {
  if (!el) return "";
  const clone = el.cloneNode(true) as Element;
  clone.querySelectorAll("span").forEach((s) => s.replaceWith("\n"));

  const uniqueParts = new Set(
    (clone.textContent ?? "").split("\n").map(clean).filter(Boolean),
  );

  return Array.from(uniqueParts).join(" / ");
};

const textsOf = (els: ArrayLike<Element>) =>
  Array.from(els, (e) => clean(e.textContent)).filter(Boolean);

/**
 * Пустые слоты сохраняются: у них есть номер и время, а discipline === "",
 * teachers/rooms/groups пустые. Не возвращает null только для строк без времени (это не пара).
 */
const parseLesson = (tr: Element, number: number): Lesson | null => {
  const [startTime, endTime] =
    tr.querySelector("td.time")?.textContent?.match(/\d{1,2}:\d{2}/g) ?? [];
  if (!startTime || !endTime) return null;

  const diss = tr.querySelector("td.diss");

  const teachers = textsOf(diss?.querySelectorAll("span") ?? [])
    .flatMap((t) => t.split(","))
    .map((t) => t.trim())
    .filter(Boolean);

  return {
    number,
    startTime,
    endTime,
    isLection: tr.querySelector("td.lection.yes") !== null,
    discipline: textWithoutSpans(diss),
    teachers,
    rooms: textsOf(tr.querySelectorAll("a.room-link")),
    groups: textsOf(tr.querySelectorAll("a.group-link")),
  };
};

const parseDay = (el: Element): Day => {
  const date = el.className.match(/day-(\d{4}-\d{2}-\d{2})/)?.[1];
  if (!date) throw new Error("Не найдена дата дня");

  const [weekday = "", dateLabel = ""] = textWithoutSpans(
    el.querySelector("h4.card-title"),
  ).split(" | ");

  const lessons = Array.from(el.querySelectorAll("tr"))
    .map((tr, i) => parseLesson(tr, i + 1))
    .filter((l): l is Lesson => l !== null);

  return { weekday, date, dateLabel, lessons };
};

/** DOMParser не выполняет скрипты и не грузит ресурсы, так что страница безопасна для разбора */
export const parseHtml = (html: string): Schedule => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  const weeks: Schedule["weeks"] = {};

  for (const [n, sel] of Object.entries(WEEKS)) {
    const section = doc.querySelector(`.card.card-sched${sel}`);
    if (!section) continue;

    weeks[Number(n)] = Array.from(
      section.querySelectorAll('div[class^="card-block day-"]'),
    ).map((el) => parseDay(el));
  }

  // Если недель нет, это не ошибка загрузки: запроса не существует или расписание пустое.
  // UI покажет «Ничего не найдено» по пустому weeks.
  return { weeks };
};

const parseSchedule = async (
  type: string,
  value: string,
  signal?: AbortSignal,
): Promise<Schedule> => {
  const { data } = await axios.get<string>(import.meta.env.VITE_SCHEDULE_URL, {
    params: { type_schedule: type, val: value },
    responseType: "text",
    signal,
  });
  return parseHtml(data);
};

export default parseSchedule;
