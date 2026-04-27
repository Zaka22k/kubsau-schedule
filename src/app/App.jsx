import { SearchInput, WeekSection, Spinner } from "@components";
import useApp from "./useApp";
import { Fragment } from "react";
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

  const getMainContent = () => {
    if (loading === 1) {
      return (
        <div className={styles.emptyMessage}>
          <Spinner loading={true} size={48} />
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
            <WeekSection key={week} days={schedule.weeks[week]} />
          ))}
        </>
      );
    }

    return <div className={styles.emptyMessage}>Расписание не загружено</div>;
  };

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <a href="https://kubsau.ru">
          КУБГАУ <span>Расписание</span>
        </a>
      </header>

      <main className={styles.main}>{getMainContent()}</main>

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
