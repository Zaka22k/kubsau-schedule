import { useState, useRef } from "react";
import { Spinner } from "@components";
import { useApp } from "@contexts";
import styles from "./SearchInput.module.css";

const SearchInput = () => {
  const {
    suggestions,
    fetchSuggestions,
    query,
    handleSuggestionChosen,
    fetchSchedule,
  } = useApp();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const handleSearch = (value) => {
    setLoading(true);
    setTimeout(() => {
      fetchSuggestions(value);
      setLoading(false);
    }, 80);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    inputRef.current?.blur();
    await fetchSchedule();
  };

  const handleSelect = (value) => {
    handleSuggestionChosen(value);
    setOpen(false);
  };

  const showSuggestions = open && suggestions.length > 0;

  return (
    <form
      className={`${styles.searchContainer} ${open && styles.focus}`}
      onSubmit={handleSubmit}
    >
      <ul
        className={`${styles.suggestionList} ${showSuggestions ? styles.visible : ""}`}
      >
        {suggestions.map((group, index) => (
          <li
            key={`${group.value}-${index}`}
            onMouseDown={(e) => {
              e.preventDefault();
              handleSelect(group.value);
            }}
          >
            {group.value}
          </li>
        ))}
      </ul>
      <div className={styles.inputContainer}>
        <Spinner loading={loading} />

        <input
          ref={inputRef}
          type="search"
          value={query}
          className={styles.input}
          placeholder="Поиск по группе / аудитории"
          onChange={(e) => {
            const value = e.target.value;
            handleSearch(value);
          }}
          maxLength={7}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        />
      </div>
    </form>
  );
};

export default SearchInput;
