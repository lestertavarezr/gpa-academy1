/* global __BUILD_TARGET__, __API_BASE__, __APP_VERSION__ */
// Replaced at build time by esbuild `define`; the fallbacks apply under tests.
export const BUILD_TARGET = typeof __BUILD_TARGET__ !== "undefined" ? __BUILD_TARGET__ : "web";
export const API_BASE = typeof __API_BASE__ !== "undefined" ? __API_BASE__ : "/api/v1";
export const APP_VERSION = typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "dev";
