import styles from "./ProgressRing.module.css";

interface ProgressRingProps {
  loading?: boolean;
  size?: number;
}

const ProgressRing = ({ loading = false, size = 28 }: ProgressRingProps) => {
  return (
    <svg
      viewBox="0 -960 960 960"
      className={`${styles.spinner} ${loading && styles.visible}`}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
    >
      <path d="M323.67-111.17q-73-31.16-127.17-85.33t-85.33-127.17Q80-396.67 80-480.17t31.17-156.33q31.16-72.83 85.33-127t127.17-85.33Q396.67-880 480-880q13.67 0 23.5 9.83 9.83 9.84 9.83 23.5 0 13.67-9.83 23.5-9.83 9.84-23.5 9.84-138.33 0-235.83 97.5T146.67-480q0 138.33 97.5 235.83T480-146.67q138.33 0 235.83-97.5T813.33-480q0-13.67 9.84-23.5 9.83-9.83 23.5-9.83 13.66 0 23.5 9.83Q880-493.67 880-480q0 83.33-31.17 156.33-31.16 73-85.33 127.17t-127 85.33Q563.67-80 480.17-80q-83.5 0-156.5-31.17Z" />
    </svg>
  );
};

export default ProgressRing;
