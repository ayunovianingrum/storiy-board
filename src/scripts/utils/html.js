export const html = (strings, ...values) => {
  return String.raw({ raw: strings }, ...values);
};
