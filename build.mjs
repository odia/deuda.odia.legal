#!/usr/bin/env node
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

import { build } from "@gnu-taler/web-util/build";

await build({
  type: "production",
  source: {
    js: ["src/index.tsx"],
    assets: [
      {
        base: "src",
        files: [
          "src/index.html",
          "src/settings.json",
          "src/assets/data/aapl.csv",
          "src/assets/data/goog.csv",
          "src/assets/icons/isotipo.png",
        ],
      },
    ],
  },
  destination: "./docs",
  css: "postcss",
});
