import { describe, expect, it } from "vitest";
import { sign, verify } from "../worker/auth";
const secret = "a-secret-longer-than-thirty-two-characters-for-tests";
const claims = {
  sub: "student-1",
  iss: "gpa-academy-os",
  aud: "gpa-imaging-lab",
  exp: Math.floor(Date.now() / 1000) + 300,
  caseIds: ["GPA-NEURO-001"],
};
describe("signed LMS contract", () => {
  it("accepts a signed, current token for the intended audience", async () => {
    const token = await sign(claims, secret);
    expect((await verify(token, secret, claims.iss, claims.aud))?.sub).toBe(
      "student-1",
    );
  });
  it("rejects tampering, wrong audience, wrong issuer and expiration", async () => {
    const token = await sign(claims, secret);
    expect(
      await verify(token.slice(0, -2) + "xx", secret, claims.iss, claims.aud),
    ).toBeNull();
    expect(
      await verify(token, secret, claims.iss, "another-service"),
    ).toBeNull();
    expect(
      await verify(token, secret, "another-issuer", claims.aud),
    ).toBeNull();
    const expired = await sign(
      { ...claims, exp: Math.floor(Date.now() / 1000) - 1 },
      secret,
    );
    expect(await verify(expired, secret, claims.iss, claims.aud)).toBeNull();
  });
});
