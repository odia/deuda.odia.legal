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

import { serve } from "@gnu-taler/web-util/node";
import { initializeDev } from "@gnu-taler/web-util/build";

const devEntryPoints = ["src/index.tsx"];

const build = initializeDev({
  type: "development",
  source: {
    js: devEntryPoints,
    assets: [
      {
        base: "src",
        files: [
          "src/index.html",
          "src/settings.json",
          "src/assets/data/aapl.csv",
          "src/assets/data/riaa-us-revenue.csv",
          "src/assets/data/goog.csv",
          "src/assets/data/ejemplo.csv",
          "src/assets/icons/isotipo.png",
        ],
      },
    ],
  },
  destination: "./dist/dev",
  public: "/app",
  css: "postcss",
});

await build();

serve({
  folder: "./dist/dev",
  port: 8080,
  source: "./src",
  onSourceUpdate: build,
});
