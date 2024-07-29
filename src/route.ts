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
import { useNavigationContext } from "./context/navigation.js";

declare const __location: unique symbol;
/**
 * special string that defined a location in the application
 *
 * this help to prevent wrong path
 */
export type AppLocation = string & {
  [__location]: true;
};
export type EmptyObject = Record<string, never>;

export function urlPattern<
  T extends Record<string, string | undefined> = EmptyObject,
>(pattern: RegExp, reverse: (p: T) => string): RouteDefinition<T> {
  const url = reverse as (p: T) => AppLocation;
  return {
    pattern: new RegExp(pattern),
    url,
  };
}

/**
 * defines a location in the app
 *
 * pattern: how a string will trigger this location
 * url(): how a state serialize to a location
 */

export type ObjectOf<T> = Record<string, T> | EmptyObject;

export type RouteDefinition<
  T extends ObjectOf<string | undefined> = EmptyObject,
> = {
  pattern: RegExp;
  url: (p: T) => AppLocation;
};

const nullRountDef = {
  pattern: new RegExp(/.*/),
  url: () => "" as AppLocation,
};
export function buildNullRoutDefinition<
  T extends ObjectOf<string>,
>(): RouteDefinition<T> {
  return nullRountDef;
}

/**
 * Search path in the pageList
 * get the values from the path found
 * add params from searchParams
 *
 * @param path
 * @param params
 */
function findMatch<T extends ObjectOf<RouteDefinition>>(
  pagesMap: T,
  pageList: Array<keyof T>,
  path: string,
  params: Record<string, string>,
): Location<T> | undefined {
  for (let idx = 0; idx < pageList.length; idx++) {
    const name = pageList[idx];
    const found = pagesMap[name].pattern.exec(path);
    if (found !== null) {
      const values = {} as Record<string, unknown>;

      Object.entries(params).forEach(([key, value]) => {
        values[key] = value;
      });

      if (found.groups !== undefined) {
        Object.entries(found.groups).forEach(([key, value]) => {
          values[key] = value;
        });
      }

      // @ts-expect-error values is a map string which is equivalent to the RouteParamsType
      return { name, parent: pagesMap, values };
    }
  }
  return undefined;
}

/**
 * get the type of the params of a location
 *
 */
type RouteParamsType<
  RouteType,
  Key extends keyof RouteType,
> = RouteType[Key] extends RouteDefinition<infer ParamType> ? ParamType : never;

/**
 * Helps to create a map of a type with the key
 */
type MapKeyValue<Type> = {
  [Key in keyof Type]: Key extends string
    ? {
        parent: Type;
        name: Key;
        values: RouteParamsType<Type, Key>;
      }
    : never;
};

/**
 * create a enumeration of value of a mapped type
 */
type EnumerationOf<T> = T[keyof T];

type Location<T> = EnumerationOf<MapKeyValue<T>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCurrentLocation<T extends ObjectOf<RouteDefinition<any>>>(
  pagesMap: T,
): Location<T> | undefined {
  const pageList = Object.keys(pagesMap as object) as Array<keyof T>;
  const { path, params } = useNavigationContext();

  return findMatch(pagesMap, pageList, path, params);
}
