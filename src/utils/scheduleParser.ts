import * as ch from "cheerio";
import type { AnyNode } from "domhandler";
import type { Lesson, Day, Schedule, Week } from "@types";
import axios from "axios";

const parseLesson = (
  $: ch.CheerioAPI,
  el: ch.BasicAcceptedElems<AnyNode>,
): Lesson => {
  let lesson: Lesson = {
    startTime: "",
    endTime: "",
    isLection: false,
    discipline: "",
    teachers: [],
    rooms: [],
    groups: [],
    isNow: false,
  };

  try {
    const timesColumn = $(el).find("td.time").html() || "";
    const [startTime, endTime] = timesColumn
      .split(/<br\s*\/?>/i)
      .map((time) => time.trim());

    const isLection = $(el).find("td.lection.yes").length > 0;

    const dissColumn = $(el).find("td.diss");
    const dissColumnClone = $(dissColumn).clone();
    dissColumnClone.find("span").remove();

    const discipline = dissColumnClone.text().trim();

    const teachers: string[] = [];
    dissColumn.find("span").each((_, span) => {
      const tRaw = $(span).text().replace(/\s+/g, " ").trim();
      tRaw.split(",").forEach((name) => {
        const cleanName = name.trim();
        if (cleanName) teachers.push(cleanName);
      });
    });

    const rooms = $(el)
      .find("a.room-link")
      .map((_, el) => $(el).text().trim())
      .get();

    const groups = $(el)
      .find("a.group-link")
      .map((_, el) => $(el).text().trim())
      .get();

    const now = new Date();
    const currentTimeStr =
      now.getHours().toString().padStart(2, "0") +
      ":" +
      now.getMinutes().toString().padStart(2, "0");

    let isNow = false;
    if (startTime && endTime) {
      const startDate = new Date(`1970-01-01T${startTime}:00Z`);
      const endDate = new Date(`1970-01-01T${endTime}:00Z`);
      const currentDate = new Date(`1970-01-01T${currentTimeStr}:00Z`);

      isNow = currentDate >= startDate && currentDate <= endDate;
    }

    lesson = {
      startTime,
      endTime,
      isLection,
      discipline,
      teachers,
      rooms,
      groups,
      isNow,
    };
  } catch (error: unknown) {
    if (error instanceof Error)
      console.error("Ошибка парсинга пары: " + error.message);
  }
  return lesson;
};

const parseDay = (
  $: ch.CheerioAPI,
  el: ch.BasicAcceptedElems<AnyNode>,
): Day => {
  let day: Day = {
    weekday: "",
    date: "",
    isToday: false,
    lessons: [],
  };
  try {
    const title = $(el).find("h4");
    const [weekday, date] = title.text().trim().split(" | ");
    const isToday = title.attr("class")?.includes("today") || false;
    day = {
      weekday: weekday,
      date: date,
      isToday: isToday,
      lessons: [],
    };
    $(el)
      .find("tr")
      .each((_, el) => {
        const parsedLesson = parseLesson($, el);
        day.lessons.push(parsedLesson);
      });
  } catch (error: unknown) {
    if (error instanceof Error)
      console.error("Ошибка парсинга дня: " + error.message);
  }
  return day;
};

const parseWeek = (
  $: ch.CheerioAPI,
  el: ch.BasicAcceptedElems<AnyNode>,
): Week => {
  const week: Week = [];

  try {
    $(el)
      .find('div[class^="card-block day-"]')
      .each((_, el) => {
        const parsedDay = parseDay($, el);
        week.push(parsedDay);
      });
  } catch (error: unknown) {
    if (error instanceof Error)
      console.error("Ошибка парсинга недели: " + error.message);
  }
  return week;
};

const parseSchedule = async (
  type: string,
  value: string,
): Promise<Schedule> => {
  let html: string;
  const schedule: Schedule = { weeks: {}, currentWeek: undefined };

  try {
    const response = await axios.get(`https://s.kubsau.ru/`, {
      params: {
        type_schedule: type,
        val: value,
      },
    });
    html = response.data;

    const $: ch.CheerioAPI = ch.load(html);
    const weekSections = $(
      ".card.card-sched.schedule-first-week, .card.card-sched.schedule-second-week",
    );

    weekSections.each((index: number, element) => {
      const weekNumber = index + 1;
      const parsedWeek = parseWeek($, element);

      if (parsedWeek.some((day: Day) => day.isToday)) {
        schedule.currentWeek = weekNumber;
      }

      schedule["weeks"][weekNumber] = parsedWeek;
    });
  } catch (error: unknown) {
    if (error instanceof Error)
      console.error("Ошибка парсинга расписания:", error.message);
  }

  return schedule;
};

export default parseSchedule;
