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

// import { AbsoluteTime, Duration } from "@gnu-taler/taler-util";
import { useTranslationContext } from "@gnu-taler/web-util/browser";
import {
  formatISO,
  format,
  formatDuration,
  intervalToDuration,
} from "date-fns";
import { Fragment, h, VNode } from "preact";
import { AbsoluteTime, Duration } from "../time.js";

/**
 *
 * @param timestamp time to be formatted
 * @param relative duration threshold, if the difference is lower
 * the timestamp will be formatted as relative time from "now"
 *
 * @returns
 */
export function Time({
  timestamp,
  relative,
  format: formatString,
}: {
  timestamp: AbsoluteTime | undefined;
  relative?: Duration;
  format: string;
}): VNode {
  const { i18n, dateLocale } = useTranslationContext();
  if (!timestamp) return <Fragment />;

  if (timestamp.t_ms === "never") {
    return <time>{i18n.str`never`}</time>;
  }

  const now = AbsoluteTime.now();
  const diff = AbsoluteTime.difference(now, timestamp);
  if (relative && now.t_ms !== "never" && Duration.cmp(diff, relative) === -1) {
    const d = intervalToDuration({
      start: now.t_ms,
      end: timestamp.t_ms,
    });
    d.seconds = 0;
    const duration = formatDuration(d, { locale: dateLocale });
    const isFuture = AbsoluteTime.cmp(now, timestamp) < 0;
    if (isFuture) {
      return (
        <time dateTime={formatISO(timestamp.t_ms)}>
          <i18n.Translate>in {duration}</i18n.Translate>
        </time>
      );
    } else {
      return (
        <time dateTime={formatISO(timestamp.t_ms)}>
          <i18n.Translate>{duration} ago</i18n.Translate>
        </time>
      );
    }
  }
  return (
    <time dateTime={formatISO(timestamp.t_ms)}>
      {format(timestamp.t_ms, formatString, { locale: dateLocale })}
    </time>
  );
}
