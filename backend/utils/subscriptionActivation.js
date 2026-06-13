const addMonths = (date, months) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

const addYears = (date, years) => {
  const next = new Date(date);
  next.setFullYear(next.getFullYear() + years);
  return next;
};

export const activateCourseSubscription = async ({
  user,
  courseId,
  plan,
  amountPaid,
  currency,
  paymentId,
}) => {
  const now = new Date();
  const existing = user.subscriptions.find(
    (sub) =>
      sub.course.toString() === courseId.toString() &&
      sub.status === "active" &&
      (!sub.endDate || sub.endDate > now)
  );

  if (existing) {
    return { subscription: existing, created: false };
  }

  const startDate = now;
  const endDate =
    plan === "lifetime"
      ? null
      : plan === "yearly"
        ? addYears(startDate, 1)
        : addMonths(startDate, 1);

  const subscription = {
    course: courseId,
    plan,
    status: "active",
    startDate,
    endDate,
    amountPaid,
    currency,
    paymentId,
    autoRenew: plan !== "lifetime",
  };

  user.subscriptions.push(subscription);
  await user.save();

  return {
    subscription: user.subscriptions[user.subscriptions.length - 1],
    created: true,
  };
};
