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

import { ComponentChildren, createContext, h, VNode } from "preact";
import { useContext } from "preact/hooks";
import { AppUiSettings } from "../settings.js";

/**
 *
 * @author Sebastian Javier Marchano (sebasjm)
 */

export type Type = AppUiSettings;

const initial: AppUiSettings = {};
const Context = createContext<Type>(initial);

export const useSettingsContext = (): Type => useContext(Context);

export const SettingsProvider = ({
  children,
  value,
}: {
  value: AppUiSettings;
  children: ComponentChildren;
}): VNode => {
  return h(Context.Provider, {
    value,
    children,
  });
};
