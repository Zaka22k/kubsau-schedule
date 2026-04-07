const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

function parseLesson($, lesson) {
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

  return {
    startTime: startTime,
    endTime: endTime,
    isLection: isLection,
    discipline: discipline,
    teachers: teachers,
    rooms: rooms,
  };
}

function parseDay($, day) {
  const dayTitle = $(day).find("h4.card-title");
  const classes = dayTitle.attr("class") || "";

  const dayResult = {
    title: dayTitle.text().trim(),
    isToday: classes.includes("today"),
    lessons: [],
  };

  $(day)
    .find("tr")
    .each((i, tr) => {
      dayResult.lessons.push(parseLesson($, tr));
    });

  return dayResult;
}

function parseWeek($, index, week) {
  const weekResult = {
    week: index,
    days: [],
  };

  $(week)
    .find('div[class^="card-block day-"]')
    .each((i, day) => {
      weekResult.days.push(parseDay($, day));
    });

  return weekResult;
}

async function getScheduleByGroup(group) {
  let html;
  try {
    const response = await axios.get(
      `https://s.kubsau.ru/?type_schedule=1&val=${group}`,
    );
    html = response.data;
    // html = fs.readFileSync("test.html", "utf8");
  } catch (err) {
    console.error("Ошибка загрузки:", err.message);
    return null;
  }

  const $ = cheerio.load(html);
  const schedule = {
    updatedAt: new Date().toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    weeks: [],
  };

  const weekBlocks = $(
    ".card.card-sched.schedule-first-week, .card.card-sched.schedule-second-week",
  );

  weekBlocks.each((index, week) => {
    const weekNum = index + 1;
    const parsedWeek = parseWeek($, weekNum, week);

    if (parsedWeek.days.some((day) => day.is_today)) {
      schedule.currentWeek = weekNum;
    }

    schedule.weeks.push(parsedWeek);
  });

  return schedule;
}

// Запуск
getScheduleByGroup("ИТ2201").then((data) => {
  fs.writeFileSync("schedule.json", JSON.stringify(data, null, 2), "utf-8");
  console.log("Готово! Результат в schedule.json");
});
