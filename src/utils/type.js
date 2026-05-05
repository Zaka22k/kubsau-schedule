export const getType = (value) => {
  return /^[а-яё]{2}/iu.test(value) ? "1" : /^\d{2}/.test(value) ? "3" : null;
};
