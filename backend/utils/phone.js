/** Normalize to 10-digit Indian mobile number. */
export const normalizePhone = (phone) => {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
};

export const isValidIndianPhone = (phone) => /^[6-9]\d{9}$/.test(normalizePhone(phone));
