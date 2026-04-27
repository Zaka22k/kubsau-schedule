import { SearchInput, WeekDivider, WeekSection } from "@components";
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

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        КУБГАУ <span>Расписание</span>
      </header>

      {schedule ? (
        <>
          {[1, 2].map((week) => (
            <WeekSection
              key={week}
              weekNumber={week}
              days={schedule.weeks[week]}
            />
          ))}
        </>
      ) : (
        <div className={styles.emptyMessage}>
          Введите группу или номер аудитории
        </div>
      )}

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
