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
import { useContext, useEffect, useState } from "preact/hooks";
import { AppLocation } from "../route.js";

/**
 *
 * @author Sebastian Javier Marchano (sebasjm)
 */

export type Type = {
  path: string;
  params: Record<string, string>;
  navigateTo: (path: AppLocation) => void;
  // addNavigationListener: (listener: (path: string, params: Record<string, string>) => void) => (() => void);
};

// @ts-expect-error should not be used without provider
const Context = createContext<Type>(undefined);

export const useNavigationContext = (): Type => useContext(Context);

function getPathAndParamsFromWindow() {
  const path =
    typeof window !== "undefined" ? window.location.hash.substring(1) : "/";
  const params: Record<string, string> = {};
  if (typeof window !== "undefined") {
    for (const [key, value] of new URLSearchParams(window.location.search)) {
      params[key] = value;
    }
  }
  return { path, params };
}

const { path: initialPath, params: initialParams } =
  getPathAndParamsFromWindow();

// there is a possibility that if the browser does a redirection
// (which doesn't go through navigatTo function) and that executed
// too early (before addEventListener runs) it won't be taking
// into account
const PopStateEventType = "popstate";

export const BrowserHashNavigationProvider = ({
  children,
}: {
  children: ComponentChildren;
}): VNode => {
  const [{ path, params }, setState] = useState({
    path: initialPath,
    params: initialParams,
  });
  if (typeof window === "undefined") {
    throw Error(
      "Can't use BrowserHashNavigationProvider if there is no window object",
    );
  }
  function navigateTo(path: string) {
    const { params } = getPathAndParamsFromWindow();
    setState({ path, params });
    window.location.href = path;
  }

  useEffect(() => {
    function eventListener() {
      setState(getPathAndParamsFromWindow());
    }
    window.addEventListener(PopStateEventType, eventListener);
    return () => {
      window.removeEventListener(PopStateEventType, eventListener);
    };
  }, []);
  return h(Context.Provider, {
    value: { path, params, navigateTo },
    children,
  });
};
