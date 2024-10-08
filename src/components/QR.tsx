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

import { h, VNode } from "preact";
import { useEffect, useRef } from "preact/hooks";
import qrcode from "qrcode-generator";

export function QR({ text }: { text: string }): VNode {
  const divRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const qr = qrcode(0, "L");
    qr.addData(text);
    qr.make();
    if (divRef.current)
      divRef.current.innerHTML = qr.createSvgTag({
        scalable: true,
      });
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "left",
      }}
    >
      <div
        style={{
          width: "100%",
          marginRight: "auto",
          marginLeft: "auto",
        }}
        ref={divRef}
      />
    </div>
  );
}
