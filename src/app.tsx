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
  BrowserHashNavigationProvider,
  Loading,
  TalerWalletIntegrationBrowserProvider,
  TranslationProvider
} from "@gnu-taler/web-util/browser";
import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { SWRConfig } from "swr";
import { Routing } from "./Routing.js";
import { SettingsProvider } from "./context/settings.js";
import { strings } from "./i18n/strings.js";
import { AppUiSettings, fetchSettings } from "./settings.js";
import { canonicalizeBaseUrl } from "./utils.js";
const WITH_LOCAL_STORAGE_CACHE = false;

export function App() {
  const [settings, setSettings] = useState<AppUiSettings>();
  useEffect(() => {
    fetchSettings(setSettings);
  }, []);
  if (!settings) return <Loading />;

  // const baseUrl = getInitialBackendBaseURL(settings.backendBaseURL);
  return (
    <SettingsProvider value={settings}>
      <TranslationProvider
        source={strings}
        completeness={{
          es: strings["es"].completeness,
          de: strings["de"].completeness,
        }}
      >
        <SWRConfig
          value={{
            provider: WITH_LOCAL_STORAGE_CACHE
              ? localStorageProvider
              : undefined,
            // normally, do not revalidate
            revalidateOnFocus: false,
            revalidateOnReconnect: false,
            revalidateIfStale: false,
            revalidateOnMount: undefined,
            focusThrottleInterval: undefined,

            // normally, do not refresh
            refreshInterval: undefined,
            dedupingInterval: 2000,
            refreshWhenHidden: false,
            refreshWhenOffline: false,

            // ignore errors
            shouldRetryOnError: false,
            errorRetryCount: 0,
            errorRetryInterval: undefined,

            // do not go to loading again if already has data
            keepPreviousData: true,
          }}
        >
          <TalerWalletIntegrationBrowserProvider>
            <BrowserHashNavigationProvider>
              <Routing />
            </BrowserHashNavigationProvider>
          </TalerWalletIntegrationBrowserProvider>
        </SWRConfig>
      </TranslationProvider>
    </SettingsProvider>
  );
}

// // @ts-expect-error creating a new property for window object
// window.setGlobalLogLevelFromString = setGlobalLogLevelFromString;
// // @ts-expect-error creating a new property for window object
// window.getGlobalLevel = getGlobalLogLevel;

function localStorageProvider(): Map<unknown, unknown> {
  const map = new Map(JSON.parse(localStorage.getItem("app-cache") || "[]"));

  window.addEventListener("beforeunload", () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem("app-cache", appCache);
  });
  return map;
}

function getInitialBackendBaseURL(
  backendFromSettings: string | undefined,
): string {
  const overrideUrl =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("api-base-url")
      : undefined;
  let result: string;

  if (!overrideUrl) {
    // normal path
    if (!backendFromSettings) {
      console.error(
        "ERROR: backendBaseURL was overridden by a setting file and missing. Setting value to 'window.origin'",
      );
      result = window.origin;
    } else {
      result = backendFromSettings;
    }
  } else {
    // testing/development path
    result = overrideUrl;
  }
  try {
    return canonicalizeBaseUrl(result);
  } catch (e) {
    // fall back
    return canonicalizeBaseUrl(window.origin);
  }
}
