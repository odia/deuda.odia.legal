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

import { TranslatedString } from "@gnu-taler/taler-util";
import { useState } from "preact/hooks";

export type UIField = {
  value: string | undefined;
  onUpdate: (s: string) => void;
  error: TranslatedString | undefined;
};

type FormHandler<T> = {
  [k in keyof T]?: T[k] extends string
  ? UIField
  // : T[k] extends AmountJson
  //   ? UIField
  : FormHandler<T[k]>;
};

export type FormValues<T> = {
  [k in keyof T]: T[k] extends string
  ? string | undefined
  // : T[k] extends AmountJson
  //   ? string | undefined
  : FormValues<T[k]>;
};

export type RecursivePartial<T> = {
  [k in keyof T]?: T[k] extends string
  ? string
  // : T[k] extends AmountJson
  //   ? AmountJson
  : RecursivePartial<T[k]>;
};

export type FormErrors<T> = {
  [k in keyof T]?: T[k] extends string
  ? TranslatedString
  // : T[k] extends AmountJson
  //   ? TranslatedString
  : FormErrors<T[k]>;
};

export type FormStatus<T> =
  | {
    status: "ok";
    result: T;
    errors: undefined;
  }
  | {
    status: "fail";
    result: RecursivePartial<T>;
    errors: FormErrors<T>;
  };

function constructFormHandler<T>(
  form: FormValues<T>,
  updateForm: (d: FormValues<T>) => void,
  errors: FormErrors<T> | undefined,
): FormHandler<T> {
  const keys = Object.keys(form) as Array<keyof T>;

  const handler = keys.reduce((prev, fieldName) => {
    const currentValue: unknown = form[fieldName];
    const currentError: unknown = errors ? errors[fieldName] : undefined;
    function updater(newValue: unknown) {
      updateForm({ ...form, [fieldName]: newValue });
    }
    if (typeof currentValue === "object") {
      // @ts-expect-error FIXME better typing
      const group = constructFormHandler(currentValue, updater, currentError);
      // @ts-expect-error FIXME better typing
      prev[fieldName] = group;
      return prev;
    }
    const field: UIField = {
      // @ts-expect-error FIXME better typing
      error: currentError,
      // @ts-expect-error FIXME better typing
      value: currentValue,
      onUpdate: updater,
    };
    // @ts-expect-error FIXME better typing
    prev[fieldName] = field;
    return prev;
  }, {} as FormHandler<T>);

  return handler;
}

export function useFormState<T>(
  defaultValue: FormValues<T>,
  check: (f: FormValues<T>) => FormStatus<T>,
): [FormHandler<T>, FormStatus<T>] {
  const [form, updateForm] = useState<FormValues<T>>(defaultValue);

  const status = check(form);
  const handler = constructFormHandler(form, updateForm, status.errors);

  return [handler, status];
}
