/**
 * OMM TIME live helper — COWRI3 CLOCK · OMM TIME v2.1 by Logan Madison Jones.
 * COWRI3 CLOCK · OMM TIME created by Logan Madison Jones.
 * © 2026 Logan Madison Jones. All rights reserved.
 *
 * A static file such as omm-time.json cannot tick on its own. This helper
 * (and the rule it encodes) is how a reader computes the live tick count
 * from a Unix timestamp.
 *
 *   N = floor((unix_milliseconds - ORIGIN_UNIX_MS) * 120 / 1000)
 *
 * Epoch: 1 May, astronomical year 0, 00:00 UTC (proleptic Gregorian).
 * That instant is Unix time -62156764800 seconds.
 *
 * Works in a browser (script tag or import) and in Node.js.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  if (typeof root === "object" && root) root.OMMNow = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  const ORIGIN_UNIX_SECONDS = -62156764800n;
  const ORIGIN_UNIX_MS = ORIGIN_UNIX_SECONDS * 1000n;
  const TICKS_PER_SECOND = 120n;
  const GRAIN_TICKS = 120n;
  const COWRIE_TICKS = 3600000n;

  function asBigInt(value) {
    if (typeof value === "bigint") return value;
    if (typeof value === "number") {
      if (!Number.isFinite(value)) throw new TypeError("timestamp must be finite");
      return BigInt(Math.trunc(value));
    }
    if (typeof value === "string") return BigInt(value);
    throw new TypeError("timestamp must be a number, bigint, or numeric string");
  }

  function floorDiv(a, b) {
    const q = a / b;
    const r = a % b;
    if (r !== 0n && (a < 0n) !== (b < 0n)) return q - 1n;
    return q;
  }

  function ticksFromUnixMs(unixMilliseconds) {
    const ms = asBigInt(unixMilliseconds);
    return floorDiv((ms - ORIGIN_UNIX_MS) * TICKS_PER_SECOND, 1000n);
  }

  function ticksFromUnixSeconds(unixSeconds) {
    const sec = asBigInt(unixSeconds);
    return (sec - ORIGIN_UNIX_SECONDS) * TICKS_PER_SECOND;
  }

  function decomposeEuclid(n) {
    const N = asBigInt(n);
    const cowrieIndex = floorDiv(N, COWRIE_TICKS);
    const rem = N - cowrieIndex * COWRIE_TICKS;
    const grains = floorDiv(rem, GRAIN_TICKS);
    const ticks = rem - grains * GRAIN_TICKS;
    return { cowrieIndex, grains, ticks };
  }

  function reading(unixMilliseconds) {
    const ms = asBigInt(unixMilliseconds);
    const n = ticksFromUnixMs(ms);
    const euc = decomposeEuclid(n);
    return {
      utc: new Date(Number(ms)).toISOString(),
      unix_milliseconds: ms.toString(),
      tick_position_N: n.toString(),
      euclidean: {
        cowrie_index: euc.cowrieIndex.toString(),
        grains: euc.grains.toString(),
        ticks: euc.ticks.toString()
      }
    };
  }

  function now(date = Date.now()) {
    const ms = typeof date === "number" || typeof date === "bigint" || typeof date === "string"
      ? asBigInt(date)
      : asBigInt(date.getTime());
    return reading(ms);
  }

  return {
    creator: "Logan Madison Jones",
    copyright: "© 2026 Logan Madison Jones. All rights reserved.",
    version: "2.1",
    branding: { TIME_EQUALS_MONEY: "TIME = MONEY", system: "COWRI3" },
    dateFirstPublished: "2026-11-13T05:00:00Z (13 November 2026, 00:00 EST)",
    epochUtc: "0000-05-01T00:00:00Z",
    originUnixSeconds: ORIGIN_UNIX_SECONDS.toString(),
    originUnixMilliseconds: ORIGIN_UNIX_MS.toString(),
    ticksPerSecond: TICKS_PER_SECOND.toString(),
    grainTicks: GRAIN_TICKS.toString(),
    cowrieTicks: COWRIE_TICKS.toString(),
    ticksFromUnixMs,
    ticksFromUnixSeconds,
    decomposeEuclid,
    reading,
    now
  };
});
