/*
 This file is part of GNU Taler
 (C) 2017-2019 Taler Systems S.A.

 GNU Taler is free software; you can redistribute it and/or modify it under the
 terms of the GNU General Public License as published by the Free Software
 Foundation; either version 3, or (at your option) any later version.

 GNU Taler is distributed in the hope that it will be useful, but WITHOUT ANY
 WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with
 GNU Taler; see the file COPYING.  If not, see <http://www.gnu.org/licenses/>
 */

/**
 * Helpers for relative and absolute time.
 */

/**
 * Imports.
 */
import { Codec, Context, renderContext } from "./codec.js";

declare const flavor_AbsoluteTime: unique symbol;
declare const flavor_TalerProtocolTimestamp: unique symbol;
declare const flavor_TalerPreciseTimestamp: unique symbol;

const opaque_AbsoluteTime: unique symbol = Symbol("opaque_AbsoluteTime");

// FIXME: Make this opaque!
export interface AbsoluteTime {
  /**
   * Timestamp in milliseconds.
   */
  readonly t_ms: number | "never";

  readonly _flavor?: typeof flavor_AbsoluteTime;

  // Make the type opaque, we only want our constructors
  // to able to create an AbsoluteTime value.
  [opaque_AbsoluteTime]: true;
}

export interface TalerProtocolTimestamp {
  /**
   * Seconds (as integer) since epoch.
   */
  readonly t_s: number | "never";

  readonly _flavor?: typeof flavor_TalerProtocolTimestamp;
}

/**
 * Precise timestamp, typically used in the wallet-core
 * API but not in other Taler APIs so far.
 */
export interface TalerPreciseTimestamp {
  /**
   * Seconds (as integer) since epoch.
   */
  readonly t_s: number | "never";

  /**
   * Optional microsecond offset (non-negative integer).
   */
  readonly off_us?: number;

  readonly _flavor?: typeof flavor_TalerPreciseTimestamp;
}

export namespace TalerPreciseTimestamp {
  export function now(): TalerPreciseTimestamp {
    const absNow = AbsoluteTime.now();
    return AbsoluteTime.toPreciseTimestamp(absNow);
  }

  export function round(t: TalerPreciseTimestamp): TalerProtocolTimestamp {
    return {
      t_s: t.t_s,
    };
  }

  export function fromSeconds(s: number): TalerPreciseTimestamp {
    return {
      t_s: Math.floor(s),
      off_us: Math.floor((s - Math.floor(s)) / 1000 / 1000),
    };
  }

  export function fromMilliseconds(ms: number): TalerPreciseTimestamp {
    return {
      t_s: Math.floor(ms / 1000),
      off_us: Math.floor((ms - Math.floor(ms / 1000) * 1000) * 1000),
    };
  }
}

export namespace TalerProtocolTimestamp {
  export function now(): TalerProtocolTimestamp {
    return AbsoluteTime.toProtocolTimestamp(AbsoluteTime.now());
  }

  export function zero(): TalerProtocolTimestamp {
    return {
      t_s: 0,
    };
  }

  export function never(): TalerProtocolTimestamp {
    return {
      t_s: "never",
    };
  }

  export function isNever(t: TalerProtocolTimestamp): boolean {
    return t.t_s === "never";
  }

  export function fromSeconds(s: number): TalerProtocolTimestamp {
    return {
      t_s: s,
    };
  }

  export function min(
    t1: TalerProtocolTimestamp,
    t2: TalerProtocolTimestamp,
  ): TalerProtocolTimestamp {
    if (t1.t_s === "never") {
      return { t_s: t2.t_s };
    }
    if (t2.t_s === "never") {
      return { t_s: t1.t_s };
    }
    return { t_s: Math.min(t1.t_s, t2.t_s) };
  }
  export function max(
    t1: TalerProtocolTimestamp,
    t2: TalerProtocolTimestamp,
  ): TalerProtocolTimestamp {
    if (t1.t_s === "never" || t2.t_s === "never") {
      return { t_s: "never" };
    }
    return { t_s: Math.max(t1.t_s, t2.t_s) };
  }
}

export interface Duration {
  /**
   * Duration in milliseconds.
   */
  readonly d_ms: number | "forever";
}

export interface TalerProtocolDuration {
  readonly d_us: number | "forever";
}

/**
 * Timeshift in milliseconds.
 */
let timeshift = 0;

/**
 * Set timetravel offset in milliseconds.
 *
 * Use carefully and only for testing.
 */
export function setDangerousTimetravel(dt: number): void {
  timeshift = dt;
}

export namespace Duration {
  export function toMilliseconds(d: Duration): number {
    if (d.d_ms === "forever") {
      return Number.MAX_VALUE;
    }
    return d.d_ms;
  }
  export function getRemaining(
    deadline: AbsoluteTime,
    now = AbsoluteTime.now(),
  ): Duration {
    if (deadline.t_ms === "never") {
      return { d_ms: "forever" };
    }
    if (now.t_ms === "never") {
      throw Error("invalid argument for 'now'");
    }
    if (deadline.t_ms < now.t_ms) {
      return { d_ms: 0 };
    }
    return { d_ms: deadline.t_ms - now.t_ms };
  }

  export function fromPrettyString(s: string): Duration {
    let dMs = 0;
    let currentNum = "";
    let parsingNum = true;
    for (let i = 0; i < s.length; i++) {
      const cc = s.charCodeAt(i);
      if (cc >= "0".charCodeAt(0) && cc <= "9".charCodeAt(0)) {
        if (!parsingNum) {
          throw Error("invalid duration, unexpected number");
        }
        currentNum += s[i];
        continue;
      }
      if (s[i] == " ") {
        if (currentNum != "") {
          parsingNum = false;
        }
        continue;
      }

      if (currentNum == "") {
        throw Error("invalid duration, missing number");
      }

      if (s[i] === "s") {
        dMs += 1000 * Number.parseInt(currentNum, 10);
      } else if (s[i] === "m") {
        dMs += 60 * 1000 * Number.parseInt(currentNum, 10);
      } else if (s[i] === "h") {
        dMs += 60 * 60 * 1000 * Number.parseInt(currentNum, 10);
      } else if (s[i] === "d") {
        dMs += 24 * 60 * 60 * 1000 * Number.parseInt(currentNum, 10);
      } else {
        throw Error("invalid duration, unsupported unit");
      }
      currentNum = "";
      parsingNum = true;
    }
    return {
      d_ms: dMs,
    };
  }

  /**
   * Compare two durations.  Returns 0 when equal, -1 when a < b
   * and +1 when a > b.
   */
  export function cmp(d1: Duration, d2: Duration): 1 | 0 | -1 {
    if (d1.d_ms === "forever") {
      if (d2.d_ms === "forever") {
        return 0;
      }
      return 1;
    }
    if (d2.d_ms === "forever") {
      return -1;
    }
    if (d1.d_ms == d2.d_ms) {
      return 0;
    }
    if (d1.d_ms > d2.d_ms) {
      return 1;
    }
    return -1;
  }

  export function max(d1: Duration, d2: Duration): Duration {
    return durationMax(d1, d2);
  }

  export function min(d1: Duration, d2: Duration): Duration {
    return durationMin(d1, d2);
  }

  export function multiply(d1: Duration, n: number): Duration {
    return durationMul(d1, n);
  }

  export function toIntegerYears(d: Duration): number {
    if (typeof d.d_ms !== "number") {
      throw Error("infinite duration");
    }
    return Math.ceil(d.d_ms / 1000 / 60 / 60 / 24 / 365);
  }

  export function fromSpec(spec: {
    seconds?: number;
    minutes?: number;
    hours?: number;
    days?: number;
    months?: number;
    years?: number;
  }): Duration {
    let d_ms = 0;
    d_ms += (spec.seconds ?? 0) * SECONDS;
    d_ms += (spec.minutes ?? 0) * MINUTES;
    d_ms += (spec.hours ?? 0) * HOURS;
    d_ms += (spec.days ?? 0) * DAYS;
    d_ms += (spec.months ?? 0) * MONTHS;
    d_ms += (spec.years ?? 0) * YEARS;
    return { d_ms };
  }

  export function getForever(): Duration {
    return { d_ms: "forever" };
  }

  export function getZero(): Duration {
    return { d_ms: 0 };
  }

  export function fromTalerProtocolDuration(
    d: TalerProtocolDuration,
  ): Duration {
    if (d.d_us === "forever") {
      return {
        d_ms: "forever",
      };
    }
    return {
      d_ms: Math.floor(d.d_us / 1000),
    };
  }

  export function toTalerProtocolDuration(d: Duration): TalerProtocolDuration {
    if (d.d_ms === "forever") {
      return {
        d_us: "forever",
      };
    }
    return {
      d_us: d.d_ms * 1000,
    };
  }

  export function fromMilliseconds(ms: number): Duration {
    return {
      d_ms: ms,
    };
  }

  export function clamp(args: {
    lower: Duration;
    upper: Duration;
    value: Duration;
  }): Duration {
    return durationMax(durationMin(args.value, args.upper), args.lower);
  }
}

export namespace AbsoluteTime {
  export function getStampMsNow(): number {
    return new Date().getTime();
  }

  export function getStampMsNever(): number {
    return Number.MAX_SAFE_INTEGER;
  }

  export function now(): AbsoluteTime {
    return {
      t_ms: new Date().getTime() + timeshift,
      [opaque_AbsoluteTime]: true,
    };
  }

  export function never(): AbsoluteTime {
    return {
      t_ms: "never",
      [opaque_AbsoluteTime]: true,
    };
  }

  export function fromMilliseconds(ms: number): AbsoluteTime {
    return {
      t_ms: ms,
      [opaque_AbsoluteTime]: true,
    };
  }

  export function cmp(t1: AbsoluteTime, t2: AbsoluteTime): number {
    if (t1.t_ms === "never") {
      if (t2.t_ms === "never") {
        return 0;
      }
      return 1;
    }
    if (t2.t_ms === "never") {
      return -1;
    }
    if (t1.t_ms == t2.t_ms) {
      return 0;
    }
    if (t1.t_ms > t2.t_ms) {
      return 1;
    }
    return -1;
  }

  export function min(t1: AbsoluteTime, t2: AbsoluteTime): AbsoluteTime {
    if (t1.t_ms === "never") {
      return { t_ms: t2.t_ms, [opaque_AbsoluteTime]: true };
    }
    if (t2.t_ms === "never") {
      return { t_ms: t2.t_ms, [opaque_AbsoluteTime]: true };
    }
    return { t_ms: Math.min(t1.t_ms, t2.t_ms), [opaque_AbsoluteTime]: true };
  }

  export function max(t1: AbsoluteTime, t2: AbsoluteTime): AbsoluteTime {
    if (t1.t_ms === "never") {
      return { t_ms: "never", [opaque_AbsoluteTime]: true };
    }
    if (t2.t_ms === "never") {
      return { t_ms: "never", [opaque_AbsoluteTime]: true };
    }
    return { t_ms: Math.max(t1.t_ms, t2.t_ms), [opaque_AbsoluteTime]: true };
  }

  export function difference(t1: AbsoluteTime, t2: AbsoluteTime): Duration {
    if (t1.t_ms === "never") {
      return { d_ms: "forever" };
    }
    if (t2.t_ms === "never") {
      return { d_ms: "forever" };
    }
    return { d_ms: Math.abs(t1.t_ms - t2.t_ms) };
  }

  export function isExpired(t: AbsoluteTime) {
    return cmp(t, now()) <= 0;
  }

  export function isNever(t: AbsoluteTime): boolean {
    return t.t_ms === "never";
  }

  export function fromProtocolTimestamp(
    t: TalerProtocolTimestamp,
  ): AbsoluteTime {
    if (t.t_s === "never") {
      return { t_ms: "never", [opaque_AbsoluteTime]: true };
    }
    return {
      t_ms: t.t_s * 1000,
      [opaque_AbsoluteTime]: true,
    };
  }

  export function fromStampMs(stampMs: number): AbsoluteTime {
    return {
      t_ms: stampMs,
      [opaque_AbsoluteTime]: true,
    };
  }

  export function fromPreciseTimestamp(t: TalerPreciseTimestamp): AbsoluteTime {
    if (t.t_s === "never") {
      return { t_ms: "never", [opaque_AbsoluteTime]: true };
    }
    const offsetUs = t.off_us ?? 0;
    return {
      t_ms: t.t_s * 1000 + Math.floor(offsetUs / 1000),
      [opaque_AbsoluteTime]: true,
    };
  }

  export function toStampMs(at: AbsoluteTime): number {
    if (at.t_ms === "never") {
      return Number.MAX_SAFE_INTEGER;
    }
    return at.t_ms;
  }

  export function toPreciseTimestamp(at: AbsoluteTime): TalerPreciseTimestamp {
    if (at.t_ms == "never") {
      return {
        t_s: "never",
      };
    }
    const t_s = Math.floor(at.t_ms / 1000);
    const off_us = Math.floor(1000 * (at.t_ms - t_s * 1000));
    return {
      t_s,
      off_us,
    };
  }

  export function toProtocolTimestamp(
    at: AbsoluteTime,
  ): TalerProtocolTimestamp {
    if (at.t_ms === "never") {
      return { t_s: "never" };
    }
    return {
      t_s: Math.floor(at.t_ms / 1000),
    };
  }

  export function isBetween(
    t: AbsoluteTime,
    start: AbsoluteTime,
    end: AbsoluteTime,
  ): boolean {
    if (cmp(t, start) < 0) {
      return false;
    }
    if (cmp(t, end) > 0) {
      return false;
    }
    return true;
  }

  export function toIsoString(t: AbsoluteTime): string {
    if (t.t_ms === "never") {
      return "<never>";
    } else {
      return new Date(t.t_ms).toISOString();
    }
  }

  export function addDuration(t1: AbsoluteTime, d: Duration): AbsoluteTime {
    if (t1.t_ms === "never" || d.d_ms === "forever") {
      return { t_ms: "never", [opaque_AbsoluteTime]: true };
    }
    return { t_ms: t1.t_ms + d.d_ms, [opaque_AbsoluteTime]: true };
  }

  /**
   * Get the remaining duration until {@param t1}.
   *
   * If {@param t1} already happened, the remaining duration
   * is zero.
   */
  export function remaining(t1: AbsoluteTime): Duration {
    if (t1.t_ms === "never") {
      return Duration.getForever();
    }
    const stampNow = now();
    if (stampNow.t_ms === "never") {
      throw Error("invariant violated");
    }
    return Duration.fromMilliseconds(Math.max(0, t1.t_ms - stampNow.t_ms));
  }

  export function subtractDuraction(
    t1: AbsoluteTime,
    d: Duration,
  ): AbsoluteTime {
    if (t1.t_ms === "never") {
      return { t_ms: "never", [opaque_AbsoluteTime]: true };
    }
    if (d.d_ms === "forever") {
      return { t_ms: 0, [opaque_AbsoluteTime]: true };
    }
    return { t_ms: Math.max(0, t1.t_ms - d.d_ms), [opaque_AbsoluteTime]: true };
  }

  export function stringify(t: AbsoluteTime): string {
    if (t.t_ms === "never") {
      return "never";
    }
    return new Date(t.t_ms).toISOString();
  }
}

const SECONDS = 1000;
const MINUTES = SECONDS * 60;
const HOURS = MINUTES * 60;
const DAYS = HOURS * 24;
const MONTHS = DAYS * 30;
const YEARS = DAYS * 365;

export function durationMin(d1: Duration, d2: Duration): Duration {
  if (d1.d_ms === "forever") {
    return { d_ms: d2.d_ms };
  }
  if (d2.d_ms === "forever") {
    return { d_ms: d1.d_ms };
  }
  return { d_ms: Math.min(d1.d_ms, d2.d_ms) };
}

export function durationMax(d1: Duration, d2: Duration): Duration {
  if (d1.d_ms === "forever") {
    return { d_ms: "forever" };
  }
  if (d2.d_ms === "forever") {
    return { d_ms: "forever" };
  }
  return { d_ms: Math.max(d1.d_ms, d2.d_ms) };
}

export function durationMul(d: Duration, n: number): Duration {
  if (d.d_ms === "forever") {
    return { d_ms: "forever" };
  }
  return { d_ms: Math.round(d.d_ms * n) };
}

export function durationAdd(d1: Duration, d2: Duration): Duration {
  if (d1.d_ms === "forever" || d2.d_ms === "forever") {
    return { d_ms: "forever" };
  }
  return { d_ms: d1.d_ms + d2.d_ms };
}

export const codecForAbsoluteTime: Codec<AbsoluteTime> = {
  decode(x: any, c?: Context): AbsoluteTime {
    if (x === undefined) {
      throw Error(`got undefined and expected absolute time at ${renderContext(c)}`);
    }
    const t_ms = x.t_ms;
    if (typeof t_ms === "string") {
      if (t_ms === "never") {
        return { t_ms: "never", [opaque_AbsoluteTime]: true };
      }
    } else if (typeof t_ms === "number") {
      return { t_ms, [opaque_AbsoluteTime]: true };
    }
    throw Error(`expected timestamp at ${renderContext(c)}`);
  },
};

export const codecForTimestamp: Codec<TalerProtocolTimestamp> = {
  decode(x: any, c?: Context): TalerProtocolTimestamp {
    // Compatibility, should be removed soon.
    if (x === undefined) {
      throw Error(`got undefined and expected timestamp at ${renderContext(c)}`);
    }
    const t_ms = x.t_ms;
    if (typeof t_ms === "string") {
      if (t_ms === "never") {
        return { t_s: "never" };
      }
    } else if (typeof t_ms === "number") {
      return { t_s: Math.floor(t_ms / 1000) };
    }
    const t_s = x.t_s;
    if (typeof t_s === "string") {
      if (t_s === "never") {
        return { t_s: "never" };
      }
      throw Error(`expected timestamp at ${renderContext(c)}`);
    }
    if (typeof t_s === "number") {
      return { t_s };
    }
    throw Error(`expected protocol timestamp at ${renderContext(c)}`);
  },
};

export const codecForPreciseTimestamp: Codec<TalerPreciseTimestamp> = {
  decode(x: any, c?: Context): TalerPreciseTimestamp {
    const t_ms = x.t_ms;
    if (typeof t_ms === "string") {
      if (t_ms === "never") {
        return { t_s: "never" };
      }
    } else if (typeof t_ms === "number") {
      return { t_s: Math.floor(t_ms / 1000) };
    }
    throw Error(`expected precise timestamp at ${renderContext(c)}`);
  },
};

export const codecForDuration: Codec<TalerProtocolDuration> = {
  decode(x: any, c?: Context): TalerProtocolDuration {
    const d_us = x.d_us;
    if (typeof d_us === "string") {
      if (d_us === "forever") {
        return { d_us: "forever" };
      }
      throw Error(`expected duration at ${renderContext(c)}`);
    }
    if (typeof d_us === "number") {
      return { d_us };
    }
    throw Error(`expected duration at ${renderContext(c)}`);
  },
};
