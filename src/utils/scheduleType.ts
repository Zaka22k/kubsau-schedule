const GROUP = /^[а-яё]{2}\d{0,6}$/u;
const ROOM = /^\d{1,3}[а-яё]{0,3}$/u;

export const getType = (value: string): "1" | "3" | null => {
  if (GROUP.test(value)) {
    return "1";
  }

  if (ROOM.test(value)) {
    return "3";
  }

  return null;
};
