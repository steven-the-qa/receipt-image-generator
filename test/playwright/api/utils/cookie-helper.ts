/**
 * Helper utility for managing cookies in API tests
 */
export class CookieHelper {
  private cookies: Map<string, string> = new Map();

  /**
   * Extract cookies from response headers and store them
   */
  extractCookies(headers: Record<string, string | string[]>): void {
    const setCookieHeader = headers['set-cookie'] || headers['Set-Cookie'];
    if (!setCookieHeader) return;

    const cookieArray = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    
    cookieArray.forEach((cookieString: string) => {
      const [nameValue] = cookieString.split(';');
      const [name, value] = nameValue.split('=');
      if (name && value) {
        this.cookies.set(name.trim(), value.trim());
      }
    });
  }

  /**
   * Get cookie string for request headers
   */
  getCookieString(): string {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; ');
  }

  /**
   * Clear all stored cookies
   */
  clear(): void {
    this.cookies.clear();
  }

  /**
   * Set a cookie manually
   */
  setCookie(name: string, value: string): void {
    this.cookies.set(name, value);
  }

  /**
   * Get a specific cookie value
   */
  getCookie(name: string): string | undefined {
    return this.cookies.get(name);
  }
}
