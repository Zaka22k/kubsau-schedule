export const getType = (value: string): "1" | "3" | null => {
  const groupRegex = /^[а-яё]{2}\d{0,6}$/iu;
  const roomRegex = /^\d{1,3}[а-яё]{0,3}$/iu;

  if (groupRegex.test(value)) {
    return "1";
  }

  if (roomRegex.test(value)) {
    return "3";
  }

  return null;
};
