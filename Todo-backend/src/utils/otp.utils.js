export const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

export const generateOtp = () => {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
};