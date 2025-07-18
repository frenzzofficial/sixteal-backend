// all kind of functions will be stored here

export const OtpGenerator = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};
