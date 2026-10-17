import {
  createHmac,
  timingSafeEqual,
  randomBytes,
  scryptSync,
} from "node:crypto";
export function configured() {
  return (
    (process.env.APP_PASSWORD?.length || 0) >= 12 &&
    (process.env.SESSION_SECRET?.length || 0) >= 32
  );
}
export function passwordMatches(password: string) {
  if (!configured()) return false;
  const salt = "medical-marketing-login-v1";
  return timingSafeEqual(
    scryptSync(password, salt, 32),
    scryptSync(process.env.APP_PASSWORD!, salt, 32),
  );
}
function sign(payload: string) {
  return createHmac("sha256", process.env.SESSION_SECRET || "")
    .update(payload)
    .digest("base64url");
}
export function newSession() {
  const payload = Buffer.from(
    JSON.stringify({
      exp: Date.now() + 12 * 3600000,
      nonce: randomBytes(16).toString("hex"),
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}
export function validSession(token: string | undefined) {
  if (!configured() || !token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const actual = Buffer.from(signature),
    expected = Buffer.from(sign(payload));
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
    return false;
  try {
    return (
      JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Date.now()
    );
  } catch {
    return false;
  }
}
