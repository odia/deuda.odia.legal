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

import { Codec, buildCodecForObject } from "../codec.js";
import { buildStorageKey, useLocalStorage } from "../utils.js";


interface AppState {
}

export const codecForBankState = (): Codec<AppState> =>
  buildCodecForObject<AppState>()
    .build("AppState");

const defaultBankState: AppState = {
  currentWithdrawalOperationId: undefined,
  currentChallenge: undefined,
};

const BANK_STATE_KEY = buildStorageKey("app-state", codecForBankState());

/**
 * Client state saved in local storage.
 *
 * This information is saved in the client because
 * the backend server session API is not enough.
 *
 * @returns tuple of [state, update(), reset()]
 */
export function useApplicationState(): [
  Readonly<AppState>,
  <T extends keyof AppState>(key: T, value: AppState[T]) => void,
  () => void,
] {
  const { value, update } = useLocalStorage(BANK_STATE_KEY, defaultBankState);

  function updateField<T extends keyof AppState>(k: T, v: AppState[T]) {
    const newValue = { ...value, [k]: v };
    update(newValue);
  }
  function reset() {
    update(defaultBankState);
  }
  return [value, updateField, reset];
}
