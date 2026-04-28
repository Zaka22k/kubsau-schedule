import { SearchInput, WeekSection, Spinner, Header } from "@components";
import { useApp } from "@hooks";
import { useRef, useState, useEffect } from "react";
import styles from "./App.module.css";

const App = () => {
  const {
    schedule,
    suggestions,
    getSuggestions,
    query,
    onSuggestionChosen,
    loading,
  } = useApp();
  const [activeWeek, setActiveWeek] = useState(null);
  const mainRef = useRef(null);
  const weekRefsRef = useRef(new Map());

  const registerWeekElement = (week, element) => {
    if (!element) {
      weekRefsRef.current.delete(week);
    } else {
      weekRefsRef.current.set(week, element);
    }
  };

  useEffect(() => {
    const main = mainRef.current;
    if (!main) return;

    const handleScroll = () => {
      if (main.scrollTop < 90) {
        setActiveWeek(null);
        return;
      }

      let visibleWeek = null;

      weekRefsRef.current.forEach((element, week) => {
        const rect = element.getBoundingClientRect();
        if (rect.top < main.clientHeight / 2) {
          visibleWeek = week;
        }
      });

      if (visibleWeek) {
        setActiveWeek(visibleWeek);
      }
    };

    main.addEventListener("scroll", handleScroll);
    return () => main.removeEventListener("scroll", handleScroll);
  }, []);

  const getMainContent = () => {
    if (loading === 1) {
      return (
        <div className={styles.emptyMessage}>
          <Spinner loading={true} size={64} />
        </div>
      );
    }

    if (loading === -1) {
      return (
        <div className={styles.emptyMessage}>Ошибка загрузки расписания</div>
      );
    }

    if (schedule) {
      return (
        <>
          {[1, 2].map((week) => (
            <WeekSection
              key={week}
              week={week}
              days={schedule.weeks[week]}
              onRegister={registerWeekElement}
              rootRef={mainRef}
            />
          ))}
        </>
      );
    }

    return <div className={styles.emptyMessage}>Начните поиск расписания</div>;
  };

  return (
    <div className={styles.root}>
      <Header scrollRef={mainRef} activeWeek={activeWeek}>
        {activeWeek ? (
          <span>Неделя {activeWeek}</span>
        ) : (
          <a className={styles.headerLink} href="https://kubsau.ru">
            КУБГАУ <span>Расписание</span>
          </a>
        )}
      </Header>

      <main ref={mainRef} className={styles.main}>
        {getMainContent()}
      </main>

      <SearchInput
        onSearch={getSuggestions}
        itemsSourse={suggestions}
        onSelect={onSuggestionChosen}
        query={query}
      />
    </div>
  );
};

export default App;
