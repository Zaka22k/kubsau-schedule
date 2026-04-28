import axios from "axios";
import * as cheerio from "cheerio";

function parseLesson($, lesson) {
  try {
    const timeTd = $(lesson).find("td.time");
    const times = timeTd
      .contents()
      .filter((i, el) => el.type === "text")
      .map((i, el) => $(el).text().trim())
      .get();
    const startTime = times[0] || "";
    const endTime = times[1] || "";

    const isLection = $(lesson).find("td.lection.yes").length > 0;

    const dissTd = $(lesson).find("td.diss");
    let teachers = [];

    dissTd.find("span.diss-info").each((i, span) => {
      const tRaw = $(span).text().replace(/\s+/g, " ").trim();
      tRaw.split(",").forEach((name) => {
        const cleanName = name.trim();
        if (cleanName) teachers.push(cleanName);
      });
    });

    const dissClone = dissTd.clone();
    dissClone.find("span").remove();
    const discipline = dissClone.text().trim();

    const rooms = $(lesson)
      .find("a.room-link")
      .map((i, el) => $(el).text().trim())
      .get();

    const groups = $(lesson)
      .find("a.group-link")
      .map((i, el) => $(el).text().trim())
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

    return {
      startTime: startTime,
      endTime: endTime,
      isLection: isLection,
      discipline: discipline,
      teachers: teachers,
      rooms: rooms,
      groups: groups,
      isNow: isNow,
    };
  } catch (err) {
    throw new Error("Ошибка парсинга урока: " + err.message);
  }
}

function parseDay($, day) {
  try {
    const dayData = $(day).find("h4.card-title");
    const dayTitle = dayData.text().trim().split(" | ");
    const dayName = dayTitle[0] || "";
    const dayDate = dayTitle[1] || "";
    const classes = dayData.attr("class") || "";

    const dayResult = {
      name: dayName,
      date: dayDate,
      isToday: classes.includes("today"),
      lessons: [],
    };

    $(day)
      .find("tr")
      .each((i, tr) => {
        dayResult.lessons.push(parseLesson($, tr));
      });

    return dayResult;
  } catch (err) {
    throw new Error("Ошибка парсинга дня: " + err.message);
  }
}

function parseWeek($, index, week) {
  try {
    const days = [];

    $(week)
      .find('div[class^="card-block day-"]')
      .each((i, day) => {
        days.push(parseDay($, day));
      });

    return days;
  } catch (err) {
    throw new Error("Ошибка парсинга недели: " + err.message);
  }
}

async function getSchedule(type, value) {
  let html;
  const schedule = {
    weeks: {},
  };

  try {
    const response = await axios.get(
      `${import.meta.env.VITE_SCHEDULE_URL}/?type_schedule=${type}&val=${value}`,
    );
    html = response.data;

    const $ = cheerio.load(html);

    const weekBlocks = $(
      ".card.card-sched.schedule-first-week, .card.card-sched.schedule-second-week",
    );

    weekBlocks.each((index, week) => {
      const weekNum = index + 1;
      const parsedWeek = parseWeek($, weekNum, week);

      if (parsedWeek.some((day) => day.isToday)) {
        schedule.currentWeek = weekNum;
      }

      schedule["weeks"][weekNum] = parsedWeek;
    });
  } catch (err) {
    console.error("Ошибка парсинга расписания:", err.message);
  }
  return schedule;
}

export default getSchedule;
