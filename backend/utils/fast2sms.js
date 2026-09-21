import axios from "axios";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import OtpChallenge from "../models/otpChallenge.js";
import { normalizePhone } from "./phone.js";

const FAST2SMS_SEND_URL = "https://www.fast2sms.com/dev/otp/send";
const FAST2SMS_VERIFY_URL = "https://www.fast2sms.com/dev/otp/verify";
const FAST2SMS_QUICK_SMS_URL = "https://www.fast2sms.com/dev/bulkV2";

const apiKey = () => process.env.FAST2SMS_API_KEY?.trim() || "";
const otpTemplateId = () => process.env.FAST2SMS_OTP_ID?.trim() || "";

const otpLength = () => {
  const n = Number(process.env.FAST2SMS_OTP_LENGTH || 6);
  return Number.isFinite(n) && n >= 4 && n <= 10 ? n : 6;
};

const otpExpiryMinutes = () => {
  const n = Number(process.env.FAST2SMS_OTP_EXPIRY_MINUTES || 10);
  return Number.isFinite(n) && n >= 1 ? n : 10;
};

const generateLocalOtp = () => {
  const len = otpLength();
  const max = 10 ** len;
  const num = crypto.randomInt(0, max);
  return String(num).padStart(len, "0");
};

const useFast2SmsManagedOtp = () => Boolean(apiKey() && otpTemplateId());

const smsFail = (message, statusCode = 502) => {
  const error = new Error(message || "Failed to send OTP SMS");
  error.statusCode = statusCode;
  throw error;
};

const sendViaSmartOtp = async (mobile) => {
  const response = await axios.post(
    FAST2SMS_SEND_URL,
    {
      mobile,
      otp_id: otpTemplateId(),
      otp_length: otpLength(),
      otp_expiry: otpExpiryMinutes(),
    },
    {
      headers: {
        Authorization: apiKey(),
        "Content-Type": "application/json",
      },
      timeout: 20000,
      validateStatus: () => true,
    }
  );

  if (!response.data?.return) {
    smsFail(
      response.data?.message ||
        (typeof response.data === "string" ? response.data : "Fast2SMS OTP send failed")
    );
  }
};

const sendViaQuickSms = async (mobile, otp) => {
  const message = `Your Vidyank verification code is ${otp}. Valid for ${otpExpiryMinutes()} minutes. Do not share this OTP.`;

  const response = await axios.post(
    FAST2SMS_QUICK_SMS_URL,
    {
      route: "q",
      message,
      numbers: mobile,
      flash: 0,
    },
    {
      headers: {
        authorization: apiKey(),
        "Content-Type": "application/json",
      },
      timeout: 20000,
      validateStatus: () => true,
    }
  );

  if (!response.data?.return) {
    const raw = response.data?.message;
    const detail = Array.isArray(raw) ? raw.join(", ") : raw;
    smsFail(detail || "Fast2SMS Quick SMS send failed");
  }
};

/**
 * Create/replace an OTP challenge and deliver the code by SMS (never returns the OTP).
 */
export const sendOtpChallenge = async ({ phone, purpose, name, email }) => {
  if (!apiKey()) {
    smsFail("SMS is not configured. Set FAST2SMS_API_KEY in backend .env.", 500);
  }

  const normalized = normalizePhone(phone);
  const expiresAt = new Date(Date.now() + otpExpiryMinutes() * 60 * 1000);

  await OtpChallenge.deleteMany({ phone: normalized, purpose });

  if (useFast2SmsManagedOtp()) {
    await sendViaSmartOtp(normalized);

    await OtpChallenge.create({
      phone: normalized,
      purpose,
      name,
      email,
      expiresAt,
    });
  } else {
    const otp = generateLocalOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await sendViaQuickSms(normalized, otp);

    await OtpChallenge.create({
      phone: normalized,
      purpose,
      name,
      email,
      otpHash,
      expiresAt,
    });
  }

  console.log(`[otp] ${purpose} OTP SMS sent to ${normalized}`);

  return {
    phone: normalized,
    expiresInMinutes: otpExpiryMinutes(),
  };
};

export const verifyOtpChallenge = async ({ phone, purpose, otp }) => {
  const normalized = normalizePhone(phone);
  const code = String(otp || "").trim();

  if (!/^\d{4,10}$/.test(code)) {
    const error = new Error("Invalid OTP");
    error.statusCode = 400;
    throw error;
  }

  const challenge = await OtpChallenge.findOne({
    phone: normalized,
    purpose,
  }).select("+otpHash");

  if (!challenge) {
    const error = new Error("OTP not found or expired. Please request a new one.");
    error.statusCode = 400;
    throw error;
  }

  if (challenge.expiresAt.getTime() < Date.now()) {
    await challenge.deleteOne();
    const error = new Error("OTP expired. Please request a new one.");
    error.statusCode = 400;
    throw error;
  }

  if (challenge.attempts >= 5) {
    await challenge.deleteOne();
    const error = new Error("Too many invalid attempts. Please request a new OTP.");
    error.statusCode = 400;
    throw error;
  }

  let ok = false;

  if (useFast2SmsManagedOtp() && !challenge.otpHash) {
    const response = await axios.post(
      FAST2SMS_VERIFY_URL,
      { mobile: normalized, otp: code },
      {
        headers: {
          Authorization: apiKey(),
          "Content-Type": "application/json",
        },
        timeout: 20000,
        validateStatus: () => true,
      }
    );
    ok = Boolean(response.data?.return);
  } else if (challenge.otpHash) {
    ok = await bcrypt.compare(code, challenge.otpHash);
  }

  if (!ok) {
    challenge.attempts += 1;
    await challenge.save();
    const error = new Error("Invalid OTP");
    error.statusCode = 400;
    throw error;
  }

  challenge.verified = true;
  challenge.otpHash = undefined;
  challenge.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await challenge.save();

  return challenge;
};
