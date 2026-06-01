/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(tabs)` | `/(tabs)/` | `/(tabs)/attendance` | `/(tabs)/profile` | `/(tabs)/scan` | `/_sitemap` | `/attendance` | `/login` | `/profile` | `/scan`;
      DynamicRoutes: never;
      DynamicRouteTemplate: never;
    }
  }
}
