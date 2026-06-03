import { useState, useRef } from "react";
import { ProgressRing } from "@components";
import { type Suggestion } from "@types";
import styles from "./AutoSuggestBox.module.css";

type AutoSuggestBoxProps = {
  value: string;
  placeholder?: string;
  suggestions: Suggestion[];
  loading?: boolean;
  textChanged?: (text: string) => void;
  suggestionChosen?: (value: string) => void;
};

const AutoSuggestBox = ({
  value = "",
  placeholder = "",
  suggestions,
  loading = false,
  textChanged,
  suggestionChosen,
}: AutoSuggestBoxProps) => {
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    textChanged?.(e.target.value);
  };

  const handleSuggestionChosen = (suggestionValue: string) => {
    inputRef.current?.blur();
    suggestionChosen?.(suggestionValue);
    setOpen(false);
  };

  const showSuggestions = open && suggestions.length > 0;

  return (
    <div className={styles.mainContainer}>
      <ul
        className={`${styles.suggestionList} ${showSuggestions ? styles.visible : ""}`}
      >
        {suggestions?.map((suggestion, index) => (
          <li
            key={`${suggestion.value}-${index}`}
            onMouseDown={() => handleSuggestionChosen(suggestion.value)}
          >
            {suggestion.value}
          </li>
        ))}
      </ul>

      <div className={styles.inputContainer}>
        <ProgressRing loading={loading} />

        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={placeholder}
          className={styles.input}
          onChange={handleTextChange}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        />
      </div>
    </div>
  );
};

export default AutoSuggestBox;
