/* eslint-disable @typescript-eslint/no-require-imports */
/*eslint-env node*/
// Learn more https://docs.expo.io/guides/customizing-metro

const { getDefaultConfig } = require("expo/metro-config");
/** @type {import('expo/metro-config').MetroConfig} */

const config = getDefaultConfig(__dirname, {
  // [Web-only]: Enables CSS support in Metro.]
  isCSSEnabled: true,
});
// add nice web support with optimizing compiler + CSS extraction
config.resolver.sourceExts.push("cjs");
config.resolver.sourceExts.push("mjs");

config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ["require"];

// for react-native-maps
const ALIASES = {
  "react-native-maps": "@teovilla/react-native-web-maps",
};
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web") {
    // The alias will only be used when bundling for the web.
    return context.resolveRequest(
      context,
      ALIASES[moduleName] ?? moduleName,
      platform,
    );
  }
  // Ensure you call the default resolver.
  return context.resolveRequest(context, moduleName, platform);
};

const { withTamagui } = require("@tamagui/metro-plugin");

module.exports = withTamagui(config, {
  components: ["tamagui"],
  config: "./tamagui.config.ts",
  outputCSS: "./tamagui-web.css",
});
