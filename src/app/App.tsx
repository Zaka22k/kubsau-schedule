import { SearchField, WeekSection, Header, ProgressRing } from "@components";
import { useRef, useState, useEffect, type ReactNode } from "react";
import useApp from "./useApp";
import styles from "./App.module.css";

type StatusScreenProps = {
  icon: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "accent" | "neutral";
};

const StatusScreen = ({
  icon,
  title,
  description,
  action,
  tone = "neutral",
}: StatusScreenProps) => (
  <div className={styles.centerContainer}>
    <div className={styles.statusCard}>
      <div className={`${styles.iconWrap} ${styles[tone]}`}>{icon}</div>
      <h2 className={styles.statusTitle}>{title}</h2>
      {description && <p className={styles.statusText}>{description}</p>}
      {action}
    </div>
  </div>
);

const svgProps = {
  width: 32,
  height: 32,
  viewBox: "0 0 24 24",
  fill: "none",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const CalendarSearchIcon = () => (
  <svg {...svgProps} stroke="currentColor">
    <rect x="3" y="4" width="18" height="17" rx="3" />
    <path d="M3 9h18M8 2.5v3M16 2.5v3" />
    <circle cx="11" cy="14.5" r="2.5" />
    <path d="m13 16.5 2 2" />
  </svg>
);

const CloudOffIcon = () => (
  <svg {...svgProps} stroke="currentColor">
    <path d="M7 18a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.5a4 4 0 0 1 .5 7.97" />
    <path d="M3 3l18 18" />
  </svg>
);

const EmptyIcon = () => (
  <svg {...svgProps} stroke="currentColor">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5M8.5 11h5" />
  </svg>
);

const App = () => {
  const {
    searchQuery,
    suggestions,
    searching,
    handleSearch,
    schedule,
    parsing,
    handleSelect,
    retry,
  } = useApp();
  const weeksArray = schedule?.currentWeek === 1 ? [1, 2] : [2, 1];

  const week1Ref = useRef<HTMLDivElement>(null);
  const week2Ref = useRef<HTMLDivElement>(null);

  const [activeWeek, setActiveWeek] = useState<string | null>("1");

  useEffect(() => {
    if (schedule?.currentWeek) {
      setActiveWeek(String(schedule.currentWeek));
    }
  }, [schedule]);

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
          <ProgressRing loading size={48} />
        </div>
      );
    }

    if (parsing === -1) {
      return (
        <StatusScreen
          icon={<CloudOffIcon />}
          title="Не получилось загрузить"
          description="Проверьте подключение к интернету и попробуйте ещё раз."
          action={
            <button onClick={retry} className={styles.retryButton}>
              Повторить
            </button>
          }
        />
      );
    }

    if (!schedule && !searchQuery.trim() && parsing === 0) {
      return (
        <StatusScreen
          tone="accent"
          icon={<CalendarSearchIcon />}
          title="Найдите расписание"
          description="Введите номер группы или аудитории в поле ниже."
          action={
            <span className={styles.hintArrow} aria-hidden>
              ↓
            </span>
          }
        />
      );
    }

    if (schedule && Object.keys(schedule.weeks || {}).length === 0) {
      return (
        <StatusScreen
          icon={<EmptyIcon />}
          title="Ничего не найдено"
          description={
            <>
              Для запроса <b className={styles.query}>«{searchQuery}»</b> нет
              расписания. Выберите вариант из подсказок — так точно не
              ошибётесь.
            </>
          }
        />
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

      <main className={styles.mainContent}>{getContent()}</main>

      <footer>
        <SearchField
          placeholder="Поиск"
          textChanged={handleSearch}
          suggestions={suggestions}
          value={searchQuery}
          loading={searching}
          suggestionChosen={handleSelect}
        />
      </footer>
    </div>
  );
};

export default App;
