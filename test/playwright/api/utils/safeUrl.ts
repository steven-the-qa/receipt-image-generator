/**
 * A wrapper for the URL constructor that returns null instead of throwing a TypeError if the URL is malformed.
 * This forces callers to explicitly handle the possible null return value.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/URL
 *
 * @param url - The URL string or URL object to parse
 * @param base - The base URL string or URL object to use if the first argument is a relative URL
 * @returns A URL object if the URL is valid, or null if it's malformed
 */
export default function safeUrl(url: string | URL, base?: string | URL): URL | null {
    try {
        // eslint-disable-next-line no-restricted-syntax
        return new URL(url, base);
    } catch {
        return null;
    }
}
