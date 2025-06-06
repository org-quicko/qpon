export class QponCredentials {
  private apiKey: string;

  private apiSecret: string;

  constructor(private key: string, private secret: string) {
    this.apiKey = key;
    this.apiSecret = secret;
  }

  public getApiKey() {
    return this.apiKey;
  }

  public getApiSecret() {
    return this.apiSecret;
  }
}
