import { AutoSuggestBox, WeekSection, DayItem, Header } from "@components";
import { useRef, useState, useEffect } from "react";
import useApp from "./useApp";
import styles from "./App.module.css";

const App = () => {
  const {
    searchQuery,
    suggestions,
    searching,
    handleSearch,
    schedule,
    parsing,
    handleSelect,
  } = useApp();
  const weeksArray = schedule?.currentWeek === 1 ? [1, 2] : [2, 1];

  const week1Ref = useRef<HTMLDivElement>(null);
  const week2Ref = useRef<HTMLDivElement>(null);

  const [activeWeek, setActiveWeek] = useState<string | null>(
    () => schedule?.currentWeek?.toString() || "1",
  );

  useEffect(() => {
    if (parsing || !schedule) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible && visible.target instanceof HTMLElement) {
          const weekNumber = visible.target.dataset.week;
          if (weekNumber) setActiveWeek(weekNumber);
        }
      },
      {
        threshold: 0.05,
        rootMargin: "-20% 0px -60% 0px",
      },
    );

    const elements = [week1Ref.current, week2Ref.current];
    elements.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [schedule, parsing]);

  const getContent = () => {
    if (parsing === 1) {
      return (
        <div className={styles.centerContainer}>
          {Array.from({ length: 7 }).map((_, i) => (
            <DayItem key={i} />
          ))}
        </div>
      );
    }

    if (parsing === -1) {
      return (
        <div className={styles.centerContainer}>
          <div className={styles.statusCard}>
            <p>Не удалось загрузить расписание</p>
            <button
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Повторить попытку
            </button>
          </div>
        </div>
      );
    }

    if (!schedule && !searchQuery.trim() && parsing === 0) {
      return (
        <div className={styles.centerContainer}>
          <div className={styles.startScreen}>
            <p>Добро пожаловать</p>
          </div>
        </div>
      );
    }

    if (schedule && Object.keys(schedule.weeks || {}).length === 0) {
      return (
        <div className={styles.centerContainer}>
          <div className={styles.statusCard}>
            <p>
              По запросу «{searchQuery}»<br />
              расписание не найдено
            </p>
          </div>
        </div>
      );
    }

    if (schedule) {
      return (
        <>
          {weeksArray.map((week) => {
            const currentRef = week === 1 ? week1Ref : week2Ref;

            return (
              <div
                key={week}
                ref={currentRef}
                data-week={week}
                className={styles.weekWrapper}
              >
                <WeekSection days={schedule.weeks[week]} />
              </div>
            );
          })}
        </>
      );
    }

    return null;
  };

  return (
    <div className={styles.app}>
      <Header activeWeek={activeWeek} />

      <main className={styles.mainContent}> {getContent()}</main>

      <AutoSuggestBox
        placeholder="Группа / Аудитория..."
        textChanged={handleSearch}
        suggestions={suggestions}
        value={searchQuery}
        loading={searching}
        suggestionChosen={handleSelect}
      />
    </div>
  );
};

export default App;
