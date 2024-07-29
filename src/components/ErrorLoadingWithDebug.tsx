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
import { VNode, h } from "preact";
import { usePreferences } from "../hooks/preferences.js";
import { KnownError } from "../utils.js";
import { Attention, useTranslationContext } from "@gnu-taler/web-util/browser";
import { assertUnreachable } from "@gnu-taler/taler-util";

export function ErrorLoadingWithDebug({ error }: { error: KnownError }): VNode {
  const [pref] = usePreferences();
  return <ErrorLoading error={error} showDetail={pref.showDebugInfo} />;
}


export function ErrorLoading({ error, showDetail }: { error: KnownError, showDetail?: boolean }): VNode {
  const { i18n } = useTranslationContext()
  switch (error.errorDetail.code) {
    //////////////////
    // Every error that can be produce in a Http Request
    //////////////////
    case KnownError.GENERIC_TIMEOUT: {
      if (error.hasErrorCode(KnownError.GENERIC_TIMEOUT)) {
        const { requestMethod, requestUrl, timeoutMs } = error.errorDetail
        return <Attention type="danger" title={i18n.str`The request reached a timeout, check your connection.`}>
          {error.message}
          {showDetail &&
            <pre class="whitespace-break-spaces ">
              {JSON.stringify({ requestMethod, requestUrl, timeoutMs }, undefined, 2)}
            </pre>
          }
        </Attention>
      }
      assertUnreachable(1 as never)
    }
    case KnownError.GENERIC_CLIENT_INTERNAL_ERROR: {
      if (error.hasErrorCode(KnownError.GENERIC_CLIENT_INTERNAL_ERROR)) {
        const { requestMethod, requestUrl, timeoutMs } = error.errorDetail
        return <Attention type="danger" title={i18n.str`The request was cancelled.`}>
          {error.message}
          {showDetail &&
            <pre class="whitespace-break-spaces ">
              {JSON.stringify({ requestMethod, requestUrl, timeoutMs }, undefined, 2)}
            </pre>
          }
        </Attention>
      }
      assertUnreachable(1 as never)
    }
    case KnownError.HTTP_REQUEST_GENERIC_TIMEOUT: {
      if (error.hasErrorCode(KnownError.HTTP_REQUEST_GENERIC_TIMEOUT)) {
        const { requestMethod, requestUrl, timeoutMs } = error.errorDetail
        return <Attention type="danger" title={i18n.str`The request reached a timeout, check your connection.`}>
          {error.message}
          {showDetail &&
            <pre class="whitespace-break-spaces ">
              {JSON.stringify({ requestMethod, requestUrl, timeoutMs }, undefined, 2)}
            </pre>
          }
        </Attention>
      }
      assertUnreachable(1 as never)
    }
    case KnownError.HTTP_REQUEST_THROTTLED: {
      if (error.hasErrorCode(KnownError.HTTP_REQUEST_THROTTLED)) {
        const { requestMethod, requestUrl, throttleStats } = error.errorDetail
        return <Attention type="danger" title={i18n.str`A lot of request were made to the same server and this action was throttled`}>
          {error.message}
          {showDetail &&
            <pre class="whitespace-break-spaces ">
              {JSON.stringify({ requestMethod, requestUrl, throttleStats }, undefined, 2)}
            </pre>
          }
        </Attention>
      }
      assertUnreachable(1 as never)
    }
    case KnownError.RECEIVED_MALFORMED_RESPONSE: {
      if (error.hasErrorCode(KnownError.RECEIVED_MALFORMED_RESPONSE)) {
        const { requestMethod, requestUrl, httpStatusCode, validationError } = error.errorDetail
        return <Attention type="danger" title={i18n.str`The response of the request is malformed.`}>
          {error.message}
          {showDetail &&
            <pre class="whitespace-break-spaces ">
              {JSON.stringify({ requestMethod, requestUrl, httpStatusCode, validationError }, undefined, 2)}
            </pre>
          }
        </Attention>
      }
      assertUnreachable(1 as never)
    }
    case KnownError.NETWORK_ERROR: {
      if (error.hasErrorCode(KnownError.NETWORK_ERROR)) {
        const { requestMethod, requestUrl } = error.errorDetail
        return <Attention type="danger" title={i18n.str`Could not complete the request due to a network problem.`}>
          {error.message}
          {showDetail &&
            <pre class="whitespace-break-spaces ">
              {JSON.stringify({ requestMethod, requestUrl }, undefined, 2)}
            </pre>
          }
        </Attention>
      }
      assertUnreachable(1 as never)
    }
    case KnownError.UNEXPECTED_REQUEST_ERROR: {
      if (error.hasErrorCode(KnownError.UNEXPECTED_REQUEST_ERROR)) {
        const { requestMethod, requestUrl, httpStatusCode, errorResponse } = error.errorDetail
        return <Attention type="danger" title={i18n.str`Unexpected request error`}>
          {error.message}
          {showDetail &&
            <pre class="whitespace-break-spaces ">
              {JSON.stringify({ requestMethod, requestUrl, httpStatusCode, errorResponse }, undefined, 2)}
            </pre>
          }
        </Attention>
      }
      assertUnreachable(1 as never)
    }
    //////////////////
    // Every other error 
    //////////////////
    // case TalerErrorCode.UNEXPECTED_REQUEST_ERROR: {
    //   return <Attention type="danger" title={i18n.str``}>
    //   </Attention>
    // }
    //////////////////
    // Default message for unhandled case
    //////////////////
    default: return <Attention type="danger" title={i18n.str`Unexpected error`}>
      {error.message}
      {showDetail &&
        <pre class="whitespace-break-spaces ">
          {JSON.stringify(error.errorDetail, undefined, 2)}
        </pre>
      }
    </Attention>
  }
}

