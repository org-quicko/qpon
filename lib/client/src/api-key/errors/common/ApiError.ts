/**
 * ApiError
 * Auto-generated - DO NOT EDIT
 */

/**
 * Base error class for all API errors.
 * Contains the HTTP status code and response body.
 *
 * @example
 * ```ts
 * try {
 *   const result = await client.someMethod(params);
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.log(error.statusCode);
 *     console.log(error.body);
 *   }
 * }
 * ```
 */
export class ApiError<T = unknown> extends Error {
	public readonly statusCode: number | undefined;
	public readonly body: T | undefined;
	public readonly rawResponse: unknown | undefined;

	constructor({
		message,
		statusCode,
		body,
		rawResponse,
	}: {
		message?: string;
		statusCode?: number;
		body?: T;
		rawResponse?: unknown;
	}) {
		super(buildMessage({ message, statusCode, body }));
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
		this.statusCode = statusCode;
		this.body = body;
		this.rawResponse = rawResponse;
	}
}

function buildMessage({
	message,
	statusCode,
	body,
}: {
	message: string | undefined;
	statusCode: number | undefined;
	body: unknown | undefined;
}): string {
	const lines: string[] = [];
	if (message != null) {
		lines.push(message);
	}

	if (statusCode != null) {
		lines.push(`Status code: ${statusCode.toString()}`);
	}

	if (body != null) {
		lines.push(`Body: ${JSON.stringify(body, null, 2)}`);
	}

	return lines.join("\n");
}
