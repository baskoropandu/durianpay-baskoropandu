/// <reference types="vite/client" />

/**
 * Central application configuration.
 * Reads environment variables exposed by Vite (prefixed with VITE_).
 */

/** Base URL for the backend API. Empty string uses the Vite dev proxy. */
export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '';

/** Convenience flag for whether we are running in development. */
export const IS_DEV: boolean = import.meta.env.DEV === true;
