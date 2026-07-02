/**
 * FetchUsersOfAnOrganization404UsersNotFoundError
 * Auto-generated - DO NOT EDIT
 */
import { ApiError } from "../../common/ApiError";
import type { FetchUsersOfAnOrganizationHttp404ErrorBody } from "../../../schemas/user/fetch-users-of-an-organization/FetchUsersOfAnOrganizationHttp404ErrorBody";

export class FetchUsersOfAnOrganization404UsersNotFoundError extends ApiError<FetchUsersOfAnOrganizationHttp404ErrorBody> {
	constructor(body: FetchUsersOfAnOrganizationHttp404ErrorBody, rawResponse?: unknown) {
		super({
			message: "FetchUsersOfAnOrganization404UsersNotFoundError",
			statusCode: 404,
			body: body,
			rawResponse: rawResponse,
		});
		Object.setPrototypeOf(this, new.target.prototype);

		this.name = this.constructor.name;
	}
}
