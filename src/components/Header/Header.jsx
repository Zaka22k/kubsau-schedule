import { useEffect, useState } from "react";
import { ThemeToggle } from "@components";
import styles from "./Header.module.css";

const Header = ({ children, scrollRef, activeWeek }) => {
  const [scrolled, setScrolled] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const el = scrollRef?.current;
    if (!el) return;

    const handleScroll = () => {
      setScrolled(el.scrollTop > 50);
    };

    el.addEventListener("scroll", handleScroll);

    return () => {
      el.removeEventListener("scroll", handleScroll);
    };
  }, [scrollRef]);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, [activeWeek]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={styles.left}>
        <div
          className={`${styles.content} ${isAnimating ? styles.animate : ""}`}
        >
          {children}
        </div>
      </div>

      <div className={styles.right}>
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
