/*
 This file is part of GNU Taler
 (C) 2022-2024 Taler Systems S.A.

 GNU Taler is free software; you can redistribute it and/or modify it under the
 terms of the GNU General Public License as published by the Free Software
 Foundation; either version 3, or (at your option) any later version.

 GNU Taler is distributed in the hope that it will be useful, but WITHOUT ANY
 WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

 You should have received a copy of the GNU General Public License along with
 GNU Taler; see the file COPYING.  If not, see <http://www.gnu.org/licenses/>
 */

import { useEffect, useState } from "preact/hooks";
import { AbsoluteTime } from "./time.js";
import { Codec, codecForString } from "./codec.js";

declare const opaque_StorageKey: unique symbol;

type StorageKey<Key> = {
  id: string;
  [opaque_StorageKey]: true;
  codec: Codec<Key>;
};

export function buildStorageKey<Key>(
  name: string,
  codec: Codec<Key>,
): StorageKey<Key>;
export function buildStorageKey(name: string): StorageKey<string>;
export function buildStorageKey<Key = string>(
  name: string,
  codec?: Codec<Key>,
): StorageKey<Key> {
  return {
    id: name,
    codec: codec ?? (codecForString() as Codec<Key>),
  } as StorageKey<Key>;
}


export interface StorageState<Type = string> {
  value: Type;
  update: (s: Type) => void;
  reset: () => void;
}

export function assertUnreachable(x: never): never {
  throw new Error("Didn't expect to get here");
}

export function canonicalizeBaseUrl(url: string): string {
  if (!url.startsWith("http") && !url.startsWith("https")) {
    url = "https://" + url;
  }
  const x = new URL(url);
  if (!x.pathname.endsWith("/")) {
    x.pathname = x.pathname + "/";
  }
  x.search = "";
  x.hash = "";
  return x.href;
}

export enum KnownErrorCode {
  UNEXPECTED_EXCEPTION = 0,
}

export interface KnownErrorDetail {
  code: KnownErrorCode;
  when?: AbsoluteTime;
  hint?: string;
  [x: string]: unknown;
}

export interface DetailsMap {
  [KnownErrorCode.UNEXPECTED_EXCEPTION]: {
  };
}

type empty = Record<string, never>;

type ErrBody<Y> = Y extends keyof DetailsMap ? DetailsMap[Y] : empty;

export class KnownError<T = any> extends Error {
  errorDetail: KnownErrorDetail & T;
  cause: Error | undefined;
  static GENERIC_TIMEOUT: any;
  static GENERIC_CLIENT_INTERNAL_ERROR: any;
  static HTTP_REQUEST_GENERIC_TIMEOUT: any;
  static HTTP_REQUEST_THROTTLED: any;
  static RECEIVED_MALFORMED_RESPONSE: any;
  static NETWORK_ERROR: any;
  static UNEXPECTED_REQUEST_ERROR: any;
  private constructor(d: KnownErrorDetail & T, cause?: Error) {
    super(d.hint ?? `Error (code ${d.code})`);
    this.errorDetail = d;
    this.cause = cause;
    Object.setPrototypeOf(this, KnownError.prototype);
  }

  static fromDetail<C extends KnownErrorCode>(
    code: C,
    detail: ErrBody<C>,
    hint?: string,
    cause?: Error,
  ): KnownError {
    if (!hint) {
      hint = getDefaultHint(code);
    }
    const when = AbsoluteTime.now();
    return new KnownError<unknown>({ code, when, hint, ...detail }, cause);
  }

  static fromUncheckedDetail(d: KnownErrorDetail, c?: Error): KnownError {
    return new KnownError<unknown>({ ...d }, c);
  }

  static fromException(e: any): KnownError {
    const errDetail = getErrorDetailFromException(e);
    return new KnownError(errDetail, e);
  }

  hasErrorCode<C extends keyof DetailsMap>(
    code: C,
  ): this is KnownError<DetailsMap[C]> {
    return this.errorDetail.code === code;
  }

  toString(): string {
    return `KnownError: ${JSON.stringify(this.errorDetail)}`;
  }
}

/**
 * Convert an exception (or anything that was thrown) into
 * a KnownErrorDetail object.
 */
export function getErrorDetailFromException(e: any): KnownErrorDetail {
  if (e instanceof KnownError) {
    return e.errorDetail;
  }
  if (e instanceof Error) {
    const err = makeErrorDetail(
      KnownErrorCode.UNEXPECTED_EXCEPTION,
      {
        stack: e.stack,
      },
      `unexpected exception (message: ${e.message})`,
    );
    return err;
  }
  // Something was thrown that is not even an exception!
  // Try to stringify it.
  let excString: string;
  try {
    excString = e.toString();
  } catch (e) {
    // Something went horribly wrong.
    excString = "can't stringify exception";
  }
  const err = makeErrorDetail(
    KnownErrorCode.UNEXPECTED_EXCEPTION,
    {},
    `unexpected exception (not an exception, ${excString})`,
  );
  return err;
}

function getDefaultHint(code: number): string {
  const errName = KnownErrorCode[code];
  if (errName) {
    return `Error (${errName})`;
  } else {
    return `Error (<unknown>)`;
  }
}

function makeErrorDetail<C extends KnownErrorCode>(
  code: C,
  detail: ErrBody<C>,
  hint?: string,
): KnownErrorDetail {
  if (!hint && !(detail as any).hint) {
    hint = getDefaultHint(code);
  }
  const when = AbsoluteTime.now();
  return { code, when, hint, ...detail };
}


/**
 * Validate (the number part of) an amount.  If needed,
 * replace comma with a dot.  Returns 'false' whenever
 * the input is invalid, the valid amount otherwise.
 */
const amountRegex = /^[0-9]+(.[0-9]+)?$/;
export function validateAmount(
  maybeAmount: string | undefined,
): string | undefined {
  if (!maybeAmount || !amountRegex.test(maybeAmount)) {
    return;
  }
  return maybeAmount;
}

/**
 * Extract IBAN from a Payto URI.
 */
export function getIbanFromPayto(url: string): string {
  const pathSplit = new URL(url).pathname.split("/");
  let lastIndex = pathSplit.length - 1;
  // Happens if the path ends with "/".
  if (pathSplit[lastIndex] === "") lastIndex--;
  const iban = pathSplit[lastIndex];
  return iban;
}

export function undefinedIfEmpty<T extends object>(obj: T): T | undefined {
  return Object.keys(obj).some(
    (k) => (obj as Record<string, T>)[k] !== undefined,
  )
    ? obj
    : undefined;
}

export type PartialButDefined<T> = {
  [P in keyof T]: T[P] | undefined;
};

/**
 * every non-map field can be undefined
 */
export type RecursivePartial<Type> = {
  [P in keyof Type]?: Type[P] extends (infer U)[]
  ? RecursivePartial<U>[]
  : Type[P] extends object
  ? RecursivePartial<Type[P]>
  : Type[P];
};

export enum TanChannel {
  SMS = "sms",
  EMAIL = "email",
}
export enum CashoutStatus {
  // The payment was initiated after a valid
  // TAN was received by the bank.
  CONFIRMED = "confirmed",

  // The cashout was created and now waits
  // for the TAN by the author.
  PENDING = "pending",
}


export const PAGINATED_LIST_SIZE = 5;
// when doing paginated request, ask for one more
// and use it to know if there are more to request
export const PAGINATED_LIST_REQUEST = PAGINATED_LIST_SIZE + 1;


export function useLocalStorage<Type = string>(
  key: StorageKey<Type>,
  defaultValue: Type,
): StorageState<Type> {

  const current = convert(localStorage.get(key.id), key, defaultValue);

  const [_, setStoredValue] = useState(AbsoluteTime.now().t_ms);

  useEffect(() => {
    return localStorage.onUpdate(key.id, () => {
      // const newValue = storage.get(key.id);
      setStoredValue(AbsoluteTime.now().t_ms);
    });
  }, [key.id]);

  const setValue = (value?: Type): void => {
    if (value === undefined) {
      localStorage.delete(key.id);
    } else {
      localStorage.set(
        key.id,
        key.codec ? JSON.stringify(value) : (value as string),
      );
    }
  };

  return {
    value: current,
    update: setValue,
    reset: () => {
      setValue(defaultValue);
    },
  };
}

function convert<Type>(updated: string | undefined, key: StorageKey<Type>, defaultValue: Type): Type {
  if (updated === undefined) return defaultValue; //optional
  try {
    return key.codec.decode(JSON.parse(updated));
  } catch (e) {
    //decode error
    return defaultValue;
  }
}
