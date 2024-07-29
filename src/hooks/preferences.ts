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

import {
  useTranslationContext,
} from "@gnu-taler/web-util/browser";
import { Codec, buildCodecForObject, codecForBoolean, codecForNumber } from "../codec.js";
import { buildStorageKey, useLocalStorage } from "../utils.js";
import { TranslatedString } from "@gnu-taler/taler-util";

interface Preferences {
  showWithdrawalSuccess: boolean;
  showDemoDescription: boolean;
  showInstallWallet: boolean;
  maxWithdrawalAmount: number;
  fastWithdrawal: boolean;
  showDebugInfo: boolean;
}

export const codecForPreferences = (): Codec<Preferences> =>
  buildCodecForObject<Preferences>()
    .property("showWithdrawalSuccess", codecForBoolean())
    .property("showDemoDescription", codecForBoolean())
    .property("showInstallWallet", codecForBoolean())
    .property("fastWithdrawal", codecForBoolean())
    .property("showDebugInfo", codecForBoolean())
    .property("maxWithdrawalAmount", codecForNumber())
    .build("Settings");

const defaultPreferences: Preferences = {
  showWithdrawalSuccess: true,
  showDemoDescription: true,
  showInstallWallet: true,
  maxWithdrawalAmount: 25,
  fastWithdrawal: false,
  showDebugInfo: false,
};

const PREFERENCES_KEY = buildStorageKey(
  "odia-deuda-preferences",
  codecForPreferences(),
);
/**
 * User preferences.
 *
 * @returns tuple of [state, update()]
 */
export function usePreferences(): [
  Readonly<Preferences>,
  <T extends keyof Preferences>(key: T, value: Preferences[T]) => void,
] {
  const { value, update } = useLocalStorage(
    PREFERENCES_KEY,
    defaultPreferences,
  );

  function updateField<T extends keyof Preferences>(k: T, v: Preferences[T]) {
    const newValue = { ...value, [k]: v };
    update(newValue);
  }
  return [value, updateField];
}

export function getAllBooleanPreferences(): Array<keyof Preferences> {
  return [
    "fastWithdrawal",
    "showDebugInfo",
    "showDemoDescription",
    "showInstallWallet",
    "showWithdrawalSuccess",
  ];
}

export function getLabelForPreferences(
  k: keyof Preferences,
  i18n: ReturnType<typeof useTranslationContext>["i18n"],
): TranslatedString {
  switch (k) {
    case "maxWithdrawalAmount":
      return i18n.str`Max withdrawal amount`;
    case "showWithdrawalSuccess":
      return i18n.str`Show withdrawal confirmation`;
    case "showDemoDescription":
      return i18n.str`Show demo description`;
    case "showInstallWallet":
      return i18n.str`Show install wallet first`;
    case "fastWithdrawal":
      return i18n.str`Use fast withdrawal form`;
    case "showDebugInfo":
      return i18n.str`Show debug info`;
  }
}
