import styles from "./WeekDivider.module.css";

const WeekDivider = ({ children }) => {
  return (
    <div className={styles.dividerWrapper}>
      <div className={styles.line} />
      <div className={styles.dividerTitle}>{children}</div>
      <div className={styles.line} />
    </div>
  );
};

export default WeekDivider;
