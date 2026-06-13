import crypto from "crypto";
import axios from "axios";

const sha512 = (value) =>
  crypto.createHash("sha512").update(String(value)).digest("hex");

export const getPayUConfig = () => {
  const key = process.env.PAYU_KEY;
  const salt = process.env.PAYU_SALT;
  const mode = (process.env.PAYU_MODE || "TEST").toUpperCase();

  if (!key || !salt) {
    throw new Error("PayU credentials are not configured");
  }

  const isLive = mode === "LIVE" || mode === "PRODUCTION";
  return {
    key,
    salt,
    mode: isLive ? "LIVE" : "TEST",
    paymentUrl: isLive
      ? "https://secure.payu.in/_payment"
      : "https://test.payu.in/_payment",
    verifyUrl: isLive
      ? "https://info.payu.in/merchant/postservice?form=2"
      : "https://test.payu.in/merchant/postservice?form=2",
  };
};

export const generatePaymentHash = ({
  key,
  salt,
  txnid,
  amount,
  productinfo,
  firstname,
  email,
  udf1 = "",
  udf2 = "",
  udf3 = "",
  udf4 = "",
  udf5 = "",
}) => {
  const hashString = [
    key,
    txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1,
    udf2,
    udf3,
    udf4,
    udf5,
    "",
    "",
    "",
    "",
    "",
    salt,
  ].join("|");

  return sha512(hashString);
};

export const validateResponseHash = ({
  salt,
  status,
  udf5 = "",
  udf4 = "",
  udf3 = "",
  udf2 = "",
  udf1 = "",
  email,
  firstname,
  productinfo,
  amount,
  txnid,
  key,
  hash,
}) => {
  if (!hash) return false;

  const hashString = [
    salt,
    status,
    "",
    "",
    "",
    "",
    "",
    udf5,
    udf4,
    udf3,
    udf2,
    udf1,
    email,
    firstname,
    productinfo,
    amount,
    txnid,
    key,
  ].join("|");

  return sha512(hashString) === hash;
};

export const generateVerifyHash = ({ key, salt, txnid }) =>
  sha512([key, "verify_payment", txnid, salt].join("|"));

export const verifyPaymentWithPayU = async (txnid) => {
  const { key, salt, verifyUrl } = getPayUConfig();
  const hash = generateVerifyHash({ key, salt, txnid });

  const body = new URLSearchParams({
    key,
    command: "verify_payment",
    var1: txnid,
    hash,
  });

  const response = await axios.post(verifyUrl, body.toString(), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    timeout: 20000,
  });

  const payload = response.data;
  if (!payload || payload.status !== 1) {
    return { verified: false, details: payload };
  }

  const details = payload.transaction_details?.[txnid];
  if (!details) {
    return { verified: false, details: payload };
  }

  const status = String(details.status || "").toLowerCase();
  return {
    verified: status === "success",
    status,
    paymentId: details.mihpayid?.toString() || "",
    amount: details.amt?.toString() || "",
    details,
  };
};

export const formatPayUAmount = (amount) => Number(amount).toFixed(2);

export const createTxnId = () => {
  const suffix = Math.random().toString(36).slice(2, 6);
  return `VN${Date.now().toString().slice(-10)}${suffix}`.slice(0, 25);
};

export const createCheckoutToken = () => crypto.randomBytes(24).toString("hex");

export const sanitizePayUText = (value, maxLength = 100) =>
  String(value || "")
    .replace(/[^\w\s\-.,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
