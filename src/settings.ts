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

import { Codec, buildCodecForObject, codecForBoolean, codecForMap, codecForString, codecOptional } from "./codec.js";
import { canonicalizeBaseUrl } from "./utils.js";

export interface AppUiSettings {
  // Where libeufin backend is localted
  // default: window.origin without "webui/"
  backendBaseURL?: string;
  // Shows a button "create random account" in the registration form
  // Useful for testing
  // default: false
  allowRandomAccountCreation?: boolean;
  // Create all random accounts with password "123"
  // Useful for testing
  // default: false
  simplePasswordForRandomAccounts?: boolean;
  // URL where the user is going to be redirected after
  // clicking in Taler Logo
  // default: home page
  iconLinkURL?: string;
  // Mapping for every link shown in the top navitation bar
  //  - key: link label, what the user will read
  //  - value: link target, where the user is going to be redirected
  // default: empty list
  topNavSites?: Record<string, string>;
}

/**
 * Global settings for the UI.
 */
const defaultSettings: AppUiSettings = {
  backendBaseURL: buildDefaultBackendBaseURL(),
  iconLinkURL: undefined,
  simplePasswordForRandomAccounts: false,
  allowRandomAccountCreation: false,
  topNavSites: {},
};

const codecForAppUiSettings = (): Codec<AppUiSettings> =>
  buildCodecForObject<AppUiSettings>()
    .property("backendBaseURL", codecOptional(codecForString()))
    .property("allowRandomAccountCreation", codecOptional(codecForBoolean()))
    .property(
      "simplePasswordForRandomAccounts",
      codecOptional(codecForBoolean()),
    )
    .property("iconLinkURL", codecOptional(codecForString()))
    .property("topNavSites", codecOptional(codecForMap(codecForString())))
    .build("AppUiSettings");

function removeUndefineField<T extends object>(obj: T): T {
  const keys = Object.keys(obj) as Array<keyof T>;
  return keys.reduce((prev, cur) => {
    if (typeof prev[cur] === "undefined") {
      delete prev[cur];
    }
    return prev;
  }, obj);
}

export function fetchSettings(listener: (s: AppUiSettings) => void): void {
  fetch("./settings.json")
    .then((resp) => resp.json())
    .then((json) => codecForAppUiSettings().decode(json))
    .then((result) =>
      listener({
        ...defaultSettings,
        ...removeUndefineField(result),
      }),
    )
    .catch((e) => {
      console.log("failed to fetch settings", e);
      listener(defaultSettings);
    });
}

function buildDefaultBackendBaseURL(): string | undefined {
  if (typeof window !== "undefined") {
    const currentLocation = new URL(
      window.location.pathname,
      window.location.origin,
    ).href;
    /**
     * By default, backend serves the html content
     * from the /webui root.
     */
    return canonicalizeBaseUrl(currentLocation.replace("/webui", ""));
  }
  throw Error("No default URL");
}
