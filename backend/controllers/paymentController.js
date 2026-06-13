import Course from "../models/course.js";
import PaymentOrder from "../models/paymentOrder.js";
import User from "../models/user.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { isPaidCourse } from "../utils/courseAccess.js";
import {
  createCheckoutToken,
  createTxnId,
  formatPayUAmount,
  generatePaymentHash,
  getPayUConfig,
  sanitizePayUText,
  validateResponseHash,
  verifyPaymentWithPayU,
} from "../utils/payu.js";
import { activateCourseSubscription } from "../utils/subscriptionActivation.js";

const resolveReturnBaseUrl = (req) => {
  const fromBody = req.body?.returnBaseUrl?.toString().trim();
  if (fromBody) return fromBody.replace(/\/$/, "");

  const fromEnv = process.env.API_PUBLIC_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  return `${req.protocol}://${req.get("host")}`;
};

const buildReturnPageHtml = ({ title, message, status, txnid }) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0f172a; color: #fff; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    .card { text-align: center; padding: 24px; }
    h1 { font-size: 1.25rem; margin-bottom: 8px; }
    p { color: #cbd5e1; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
  </div>
  <script>
    window.VidyankPayUResult = { status: "${status}", txnid: "${txnid}" };
  </script>
</body>
</html>`;

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildPayUFormHtml = ({ paymentUrl, params }) => {
  const fields = Object.entries(params)
    .map(
      ([name, value]) =>
        `<input type="hidden" name="${escapeHtml(name)}" value="${escapeHtml(value)}" />`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Redirecting to PayU</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; color: #64748b; }
  </style>
</head>
<body onload="document.forms[0].submit()">
  <form action="${escapeHtml(paymentUrl)}" method="post">
    ${fields}
  </form>
  <p>Redirecting to PayU…</p>
</body>
</html>`;
};

const buildPayUParamsForOrder = (order, user, course) => {
  const payu = getPayUConfig();
  const amount = formatPayUAmount(order.amount);
  const productinfo = sanitizePayUText(
    order.productinfo || `Vidyank ${course?.title || "course"} ${order.plan}`,
    100
  );
  const firstname = sanitizePayUText(order.customerName || user?.name || "Student", 60);
  const email = (order.customerEmail || user?.email || "").trim().toLowerCase();
  const returnBase = (order.returnBaseUrl || process.env.API_PUBLIC_URL || "").replace(
    /\/$/,
    ""
  );

  if (!returnBase) {
    throw new Error("Payment return URL is not configured");
  }

  const surl = `${returnBase}/api/payments/payu/return/success`;
  const furl = `${returnBase}/api/payments/payu/return/failure`;
  const udf1 = order.user.toString();
  const udf2 = order.course.toString();
  const udf3 = order.plan;

  const hash = generatePaymentHash({
    key: payu.key,
    salt: payu.salt,
    txnid: order.txnid,
    amount,
    productinfo,
    firstname,
    email,
    udf1,
    udf2,
    udf3,
  });

  return {
    paymentUrl: payu.paymentUrl,
    params: {
      key: payu.key,
      txnid: order.txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone: "9999999999",
      surl,
      furl,
      udf1,
      udf2,
      udf3,
      hash,
    },
  };
};

const finalizeSuccessfulPayment = async (
  order,
  payuPayload = {},
  { markFailedIfNotVerified = true } = {}
) => {
  if (order.status === "success") {
    return order;
  }

  const verification = await verifyPaymentWithPayU(order.txnid);
  if (!verification.verified) {
    if (markFailedIfNotVerified) {
      order.status = "failed";
      order.payuStatus = verification.status || "verification_failed";
      await order.save();
    }
    throw new Error("Payment verification failed");
  }

  const user = await User.findById(order.user);
  if (!user) {
    throw new Error("User not found for payment order");
  }

  await activateCourseSubscription({
    user,
    courseId: order.course,
    plan: order.plan,
    amountPaid: order.amount,
    currency: order.currency,
    paymentId: verification.paymentId || payuPayload.mihpayid?.toString() || order.txnid,
  });

  order.status = "success";
  order.payuPaymentId = verification.paymentId || payuPayload.mihpayid?.toString();
  order.payuStatus = verification.status || payuPayload.status?.toString() || "success";
  await order.save();

  return order;
};

export const initiatePayUPayment = asyncHandler(async (req, res) => {
  const { courseId, plan, returnBaseUrl } = req.body;

  if (!courseId || !plan) {
    res.status(400);
    throw new Error("courseId and plan are required");
  }

  if (!["monthly", "yearly", "lifetime"].includes(plan)) {
    res.status(400);
    throw new Error("Invalid subscription plan");
  }

  const course = await Course.findById(courseId);
  if (!course) {
    res.status(404);
    throw new Error("Course not found");
  }

  if (!isPaidCourse(course)) {
    res.status(400);
    throw new Error("This course is free and does not require payment");
  }

  const amountPaid = course.getPriceForPlan(plan);
  if (!amountPaid || amountPaid <= 0) {
    res.status(400);
    throw new Error(`The ${plan} plan is not available for this course`);
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const now = new Date();
  const alreadyActive = user.subscriptions.some(
    (sub) =>
      sub.course.toString() === courseId.toString() &&
      sub.status === "active" &&
      (!sub.endDate || sub.endDate > now)
  );

  if (alreadyActive) {
    res.status(400);
    throw new Error("You already have access to this course");
  }

  const returnBase = (returnBaseUrl || resolveReturnBaseUrl(req)).replace(/\/$/, "");
  const checkoutToken = createCheckoutToken();
  const productinfo = sanitizePayUText(`Vidyank ${course.title} ${plan}`, 100);

  const order = await PaymentOrder.create({
    user: user._id,
    course: courseId,
    plan,
    txnid: createTxnId(),
    amount: amountPaid,
    currency: course.pricing?.currency || "INR",
    productinfo,
    checkoutToken,
    customerName: user.name,
    customerEmail: user.email,
    returnBaseUrl: returnBase,
  });

  const checkout = buildPayUParamsForOrder(order, user, course);
  const checkoutUrl = `${returnBase}/api/payments/payu/launch/${checkoutToken}`;

  res.status(201).json({
    success: true,
    data: {
      txnid: order.txnid,
      checkoutUrl,
      paymentUrl: checkout.paymentUrl,
      params: checkout.params,
    },
  });
});

export const launchPayUCheckout = asyncHandler(async (req, res) => {
  const token = req.params.token?.toString();
  if (!token) {
    res.status(400).send("Invalid checkout link");
    return;
  }

  const order = await PaymentOrder.findOne({ checkoutToken: token, status: "pending" });
  if (!order) {
    res.status(404).send("This payment session has expired or was already completed.");
    return;
  }

  const createdAt = order.createdAt ? new Date(order.createdAt).getTime() : 0;
  if (createdAt && Date.now() - createdAt > 30 * 60 * 1000) {
    res.status(410).send("This payment session has expired. Please start checkout again.");
    return;
  }

  const user = await User.findById(order.user);
  const course = await Course.findById(order.course);
  const checkout = buildPayUParamsForOrder(order, user, course);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(buildPayUFormHtml(checkout));
});

const handlePayUCallback = async (req, res, expectedOutcome) => {
  const payload = { ...req.body, ...req.query };
  const txnid = payload.txnid?.toString();
  const status = payload.status?.toString() || expectedOutcome;

  if (!txnid) {
    res.status(400).send(
      buildReturnPageHtml({
        title: "Payment error",
        message: "Missing transaction reference.",
        status: "failed",
        txnid: "",
      })
    );
    return;
  }

  const order = await PaymentOrder.findOne({ txnid });
  if (!order) {
    res.status(404).send(
      buildReturnPageHtml({
        title: "Payment error",
        message: "Order not found.",
        status: "failed",
        txnid,
      })
    );
    return;
  }

  const payu = getPayUConfig();
  const hashValid = validateResponseHash({
    salt: payu.salt,
    status: payload.status?.toString() || "",
    udf5: payload.udf5?.toString() || "",
    udf4: payload.udf4?.toString() || "",
    udf3: payload.udf3?.toString() || "",
    udf2: payload.udf2?.toString() || "",
    udf1: payload.udf1?.toString() || "",
    email: payload.email?.toString() || "",
    firstname: payload.firstname?.toString() || "",
    productinfo: payload.productinfo?.toString() || "",
    amount: payload.amount?.toString() || formatPayUAmount(order.amount),
    txnid,
    key: payu.key,
    hash: payload.hash?.toString() || "",
  });

  if (!hashValid) {
    const verification = await verifyPaymentWithPayU(order.txnid);
    if (!verification.verified) {
      order.status = "failed";
      order.payuStatus = "invalid_hash";
      await order.save();
      res.status(400).send(
        buildReturnPageHtml({
          title: "Payment failed",
          message: "Could not verify payment response.",
          status: "failed",
          txnid,
        })
      );
      return;
    }

    try {
      await finalizeSuccessfulPayment(order, payload);
      res.send(
        buildReturnPageHtml({
          title: "Payment successful",
          message: "You can return to the Vidyank app.",
          status: "success",
          txnid,
        })
      );
      return;
    } catch (error) {
      res.status(400).send(
        buildReturnPageHtml({
          title: "Payment failed",
          message: error.message || "Verification failed.",
          status: "failed",
          txnid,
        })
      );
      return;
    }
  }

  const payuStatus = payload.status?.toString().toLowerCase() || "";
  if (expectedOutcome === "success" && payuStatus === "success") {
    try {
      await finalizeSuccessfulPayment(order, payload);
      res.send(
        buildReturnPageHtml({
          title: "Payment successful",
          message: "You can return to the Vidyank app.",
          status: "success",
          txnid,
        })
      );
      return;
    } catch (error) {
      res.status(400).send(
        buildReturnPageHtml({
          title: "Payment failed",
          message: error.message || "Verification failed.",
          status: "failed",
          txnid,
        })
      );
      return;
    }
  }

  order.status = "failed";
  order.payuStatus = payuStatus || expectedOutcome;
  await order.save();

  res.send(
    buildReturnPageHtml({
      title: "Payment failed",
      message: "Your payment was not completed. You can try again from the app.",
      status: "failed",
      txnid,
    })
  );
};

export const payuReturnSuccess = asyncHandler(async (req, res) => {
  await handlePayUCallback(req, res, "success");
});

export const payuReturnFailure = asyncHandler(async (req, res) => {
  await handlePayUCallback(req, res, "failure");
});

export const getPayUPaymentStatus = asyncHandler(async (req, res) => {
  const txnid = req.params.txnid?.toString();
  if (!txnid) {
    res.status(400);
    throw new Error("Transaction id is required");
  }

  const order = await PaymentOrder.findOne({ txnid, user: req.user._id }).populate(
    "course",
    "title slug thumbnail pricing"
  );

  if (!order) {
    res.status(404);
    throw new Error("Payment order not found");
  }

  if (order.status === "pending") {
    try {
      await finalizeSuccessfulPayment(order, {}, { markFailedIfNotVerified: false });
    } catch {
      // Payment may still be in progress on PayU — keep order pending.
    }
  }

  const refreshedOrder = await PaymentOrder.findOne({
    txnid,
    user: req.user._id,
  }).populate("course", "title slug thumbnail pricing");

  if (!refreshedOrder) {
    res.status(404);
    throw new Error("Payment order not found");
  }

  const user = await User.findById(req.user._id)
    .select("subscriptions")
    .populate("subscriptions.course", "title slug thumbnail pricing");

  const courseId =
    refreshedOrder.course?._id?.toString() || refreshedOrder.course?.toString();
  const subscription = user?.subscriptions.find(
    (sub) =>
      sub.course?._id?.toString() === courseId ||
      sub.course?.toString() === courseId
  );

  res.json({
    success: true,
    data: {
      txnid: refreshedOrder.txnid,
      status: refreshedOrder.status,
      payuStatus: refreshedOrder.payuStatus,
      subscription,
    },
  });
});
