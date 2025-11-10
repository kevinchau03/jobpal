export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
};

export const getCodeExpiration = (): Date => {
  return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now
};