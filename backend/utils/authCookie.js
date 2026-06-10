const COOKIE_NAME = "lp_auth";

const isProduction = process.env.NODE_ENV === "production";

const getCookieOptions = () => {
  const options = {
    httpOnly: true,
    secure: isProduction,
    // www.vidyank.com → api.vidyank.com needs SameSite=None in production
    sameSite: isProduction ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  };

  if (isProduction && process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }

  return options;
};

export const setAuthCookie = (res, token) => {
  res.cookie(COOKIE_NAME, token, getCookieOptions());
};

export const clearAuthCookie = (res) => {
  res.clearCookie(COOKIE_NAME, getCookieOptions());
};

export const getTokenFromRequest = (req) => req.cookies?.[COOKIE_NAME];
