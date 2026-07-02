export class QponCredentials {
	constructor(
		private readonly apiKey: string,
		private readonly apiSecret: string,
	) {}

	public getApiKey(): string {
		return this.apiKey;
	}

	public getApiSecret(): string {
		return this.apiSecret;
	}
}
