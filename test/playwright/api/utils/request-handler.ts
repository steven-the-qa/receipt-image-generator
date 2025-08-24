import type { APIRequestContext } from "@playwright/test";
import { test } from "@playwright/test";
import safeUrl from "./safeUrl";
import type { APILogger } from "./logger";

/**
 * @class RequestHandler
 * @description A utility class for making and validating API requests in Playwright tests.
 * This class simplifies API test patterns by providing chainable methods for request
 * configuration and automatic status code validation.
 *
 * @example
 * // Basic GET request with status code validation
 * const handler = new RequestHandler(request);
 * const response = await handler
 *   .path('/users')
 *   .params({ limit: 10 })
 *   .getRequest(200);
 *
 * @example
 * // POST request with custom headers and body
 * const response = await handler
 *   .path('/projects')
 *   .headers({ 'Content-Type': 'application/json' })
 *   .body({ name: 'New Project' })
 *   .postRequest(201);
 *
 * @param {APIRequestContext} request - The Playwright APIRequestContext instance
 * @param {string} [baseUrl] - Optional base URL, defaults to "http://localhost:3000/api"
 */
export class RequestHandler {
    private request: APIRequestContext;
    private logger: APILogger;
    private baseUrl: string | undefined;
    private defaultBaseUrl = "http://localhost:3000/api";
    private requestPath = "";
    private queryParams: object = {};
    private requestHeaders: Record<string, string> = {};
    private requestBody: any = {};

    constructor(request: APIRequestContext, logger: APILogger, baseUrl?: string) {
        this.request = request;
        this.baseUrl = baseUrl ?? this.defaultBaseUrl;
        this.logger = logger;
    }

    /**
     * Sets a custom base URL for the request
     * @param {string} baseUrl - The base URL to use
     * @returns {RequestHandler} - Returns this instance for chaining
     */
    url(baseUrl: string): RequestHandler {
        this.baseUrl = baseUrl;
        return this;
    }

    /**
     * Sets the API endpoint path to be appended to the base URL
     * @param {string} path - The endpoint path (e.g., "/users/123")
     * @returns {RequestHandler} - Returns this instance for chaining
     */
    path(path: string): RequestHandler {
        this.requestPath = path;
        return this;
    }

    /**
     * Sets query parameters for the request URL
     * @param {object} params - Key-value pairs of query parameters
     * @returns {RequestHandler} - Returns this instance for chaining
     */
    params(params: object): RequestHandler {
        this.queryParams = params;
        return this;
    }

    /**
     * Sets request headers
     * @param {Record<string, string>} headers - Key-value pairs of header fields
     * @returns {RequestHandler} - Returns this instance for chaining
     */
    headers(headers: Record<string, string>): RequestHandler {
        this.requestHeaders = headers;
        return this;
    }

    /**
     * Sets the request body for POST/PUT requests
     * @param {any} body - The request payload
     * @returns {RequestHandler} - Returns this instance for chaining
     */
    body(body: any): RequestHandler {
        this.requestBody = body;
        return this;
    }

    /**
     * Performs a GET request and validates the response status code
     * @param {number} statusCode - Expected HTTP status code
     * @returns {Promise<any>} - Parsed JSON response body
     * @throws {Error} - Throws if the status code doesn't match the expected value
     */
    async getRequest(statusCode: number): Promise<any> {
        let responseJSON: any;
        const url = this.getUrl();

        await test.step(`GET request to ${url}`, async () => {
            this.logger.logRequest("GET", url, this.requestHeaders);
            const response = await this.request.get(url, {
                headers: this.requestHeaders,
            });
            this.cleanUpFields();

            const responseStatus = response.status();
            const responseText = await response.text();
            if (responseText.trim()) {
                try {
                    responseJSON = JSON.parse(responseText);
                } catch {
                    responseJSON = responseText;
                }
            } else {
                responseJSON = null;
            }

            this.logger.logResponse(responseStatus, responseJSON);
            this.statusCodeValidator(responseStatus, statusCode, this.getRequest);
        });

        return responseJSON;
    }

    /**
     * Performs a POST request and validates the response status code
     * @param {number} statusCode - Expected HTTP status code
     * @returns {Promise<any>} - Parsed JSON response body
     * @throws {Error} - Throws if the status code doesn't match the expected value
     */
    async postRequest(statusCode: number): Promise<any> {
        let responseJSON: any;
        const url = this.getUrl();

        await test.step(`POST request to ${url}`, async () => {
            this.logger.logRequest("POST", url, this.requestHeaders, this.requestBody);

            const response = await this.request.post(url, {
                headers: this.requestHeaders,
                data: this.requestBody,
            });
            this.cleanUpFields();

            const responseStatus = response.status();
            const responseText = await response.text();
            if (responseText.trim()) {
                try {
                    responseJSON = JSON.parse(responseText);
                } catch {
                    responseJSON = responseText;
                }
            } else {
                responseJSON = null;
            }

            this.logger.logResponse(responseStatus, responseJSON);
            this.statusCodeValidator(responseStatus, statusCode, this.postRequest);
        });

        return responseJSON;
    }

    /**
     * Performs a PUT request and validates the response status code
     * @param {number} statusCode - Expected HTTP status code
     * @returns {Promise<any>} - Parsed JSON response body
     * @throws {Error} - Throws if the status code doesn't match the expected value
     */
    async putRequest(statusCode: number): Promise<any> {
        let responseJSON: any;
        const url = this.getUrl();

        await test.step(`PUT request to ${url}`, async () => {
            this.logger.logRequest("PUT", url, this.requestHeaders, this.requestBody);
            const response = await this.request.put(url, {
                headers: this.requestHeaders,
                data: this.requestBody,
            });
            this.cleanUpFields();

            const responseStatus = response.status();
            if (responseStatus !== 204) {
                const responseText = await response.text();
                if (responseText.trim()) {
                    try {
                        responseJSON = JSON.parse(responseText);
                    } catch {
                        responseJSON = responseText;
                    }
                } else {
                    responseJSON = null;
                }
            }

            this.logger.logResponse(responseStatus, responseJSON);
            this.statusCodeValidator(responseStatus, statusCode, this.putRequest);
        });

        return responseJSON;
    }

    /**
     * Performs a DELETE request and validates the response status code
     * @param {number} statusCode - Expected HTTP status code
     * @returns {Promise<void>} - Void promise that resolves when the request completes successfully
     * @throws {Error} - Throws if the status code doesn't match the expected value
     */
    async deleteRequest(statusCode: number): Promise<void> {
        const url = this.getUrl();

        await test.step(`DELETE request to ${url}`, async () => {
            this.logger.logRequest("DELETE", url, this.requestHeaders);

            const response = await this.request.delete(url);
            this.cleanUpFields();

            const responseStatus = response.status();

            this.logger.logResponse(responseStatus);
            this.statusCodeValidator(responseStatus, statusCode, this.deleteRequest);
        });
    }

    private getUrl() {
        const url = safeUrl(`${this.baseUrl ?? this.defaultBaseUrl}${this.requestPath}`);
        if (!url) {
            throw new Error(`Invalid URL: ${this.baseUrl}${this.requestPath}`);
        }
        for (const [key, value] of Object.entries(this.queryParams)) {
            url.searchParams.append(key, value);
        }
        return url.toString();
    }

    private statusCodeValidator(
        actualStatus: number,
        expectedStatus: number,
        callingMethod: (statusCode: number) => Promise<any>
    ) {
        if (actualStatus !== expectedStatus) {
            const logs = this.logger.getRecentLogs();
            const error = new Error(
                `Expected status ${expectedStatus} but got ${actualStatus}\n\nRecent API Activity: \n${logs}`
            );
            Error.captureStackTrace(error, callingMethod);
            throw error;
        }
    }

    private cleanUpFields() {
        this.requestBody = {};
        this.requestHeaders = {};
        this.baseUrl = undefined;
        this.requestPath = "";
        this.queryParams = {};
    }
}
