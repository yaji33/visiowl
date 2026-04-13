import { describe, it, expect } from "vitest";
import { getTier, shortenAddress, isValidSolanaAddress, formatRelativeTime } from "@/lib/utils";

describe("getTier", () => {
  it("returns OG for score >= 750",            () => expect(getTier(847)).toBe("OG"));
  it("returns Power User for 500–749",         () => expect(getTier(600)).toBe("Power User"));
  it("returns Established for 300–499",        () => expect(getTier(312)).toBe("Established"));
  it("returns Active Member for 100–299",      () => expect(getTier(150)).toBe("Active Member"));
  it("returns Early Wallet for score < 100",   () => expect(getTier(67)).toBe("Early Wallet"));
  it("returns Early Wallet for score 0",       () => expect(getTier(0)).toBe("Early Wallet"));
});

describe("shortenAddress", () => {
  it("truncates a long address", () => {
    expect(shortenAddress("8mH3qX7vR2kL9ePdNtF4uWsYcB6jA1mZ5nV8pK9R")).toBe("8mH3...pK9R");
  });
  it("returns short addresses as-is", () => expect(shortenAddress("abc")).toBe("abc"));
});

describe("isValidSolanaAddress", () => {
  it("accepts valid address", () => expect(isValidSolanaAddress("8mH3qX7vR2kL9ePdNtF4uWsYcB6jA1mZ5nV8pK9R")).toBe(true));
  it("rejects empty string",  () => expect(isValidSolanaAddress("")).toBe(false));
  it("rejects invalid chars", () => expect(isValidSolanaAddress("0OIl!!!")).toBe(false));
});

describe("formatRelativeTime", () => {
  it("shows just now for < 60s", () => expect(formatRelativeTime(new Date(Date.now() - 30000).toISOString())).toBe("just now"));
  it("shows minutes",            () => expect(formatRelativeTime(new Date(Date.now() - 300000).toISOString())).toBe("5m ago"));
});
