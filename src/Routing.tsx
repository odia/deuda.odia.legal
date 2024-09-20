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
  urlPattern,
  useCurrentLocation,
  useNavigationContext,
  useTranslationContext,
} from "@gnu-taler/web-util/browser";
import { ComponentChildren, Fragment, VNode, h } from "preact";

import { AccessToken } from "@gnu-taler/taler-util";
import { useEffect } from "preact/hooks";
import { Home } from "./Home.js";
import { assertUnreachable } from "./utils.js";
import { Info } from "./Info.js";

function AppFrame({ children }: { children: ComponentChildren }) {
  return (
    <div class="min-h-full">
      <div class="bg-gray-800">
        <nav class="bg-gray-800">
          <div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div class="border-b border-gray-700">
              <div class="flex h-16 items-center justify-between px-4 sm:px-0">
                <div class="flex items-center">
                  <div class="flex-shrink-0">
                    <img
                      class="h-8 w-8"
                      src="assets/icons/isotipo.png"
                      alt="Your Company"
                    />
                  </div>
                  <div class="md:block">
                    <div class="ml-10 flex items-baseline space-x-4">
                      {/* <!-- Current: "bg-gray-900 text-white", Default: "text-gray-300 hover:bg-gray-700 hover:text-white" --> */}
                      <a
                        href="#/home"
                        class="bg-gray-900 text-white rounded-md px-3 py-2 text-sm font-medium"
                        aria-current="page"
                      >
                        Deuda publica
                      </a>
                      <a
                        href="#/info"
                        class="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                      >
                        Info
                      </a>{" "}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      <main>{children}</main>
    </div>
  );
}

export function Routing(): VNode {
  return (
    <AppFrame>
      <PublicRounting onLoggedUser={(username, token) => {}} />
    </AppFrame>
  );
}

const publicPages = {
  home: urlPattern(/\/home/, () => "#/home"),
  info: urlPattern(/\/info/, () => "#/info"),
};

function PublicRounting({
  onLoggedUser,
}: {
  onLoggedUser: (username: string, token: AccessToken) => void;
}): VNode {
  const { i18n } = useTranslationContext();
  const location = useCurrentLocation(publicPages);
  const { navigateTo } = useNavigationContext();

  useEffect(() => {
    if (location === undefined) {
      navigateTo(publicPages.home.url({}));
    }
  }, [location]);

  if (location === undefined) {
    return <Fragment />;
  }

  switch (location.name) {
    case undefined:
    case "home": {
      return <Home />;
    }
    case "info": {
      return <Info />;
    }
    // case "equipo": {
    //   return <Equipo />;
    // }

    default:
      assertUnreachable(location);
  }
}
