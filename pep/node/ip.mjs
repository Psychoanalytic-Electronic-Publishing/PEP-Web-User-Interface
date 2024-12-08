import AWS from 'aws-sdk';
import { createHmac } from 'crypto';

class IpSignatureManager {
    #hmacSecret = null;
    #secretsClient;

    constructor() {
        this.#secretsClient = new AWS.SecretsManager();
    }

    async getHmacSecret() {
        if (!this.#hmacSecret) {
            console.log('Fetching secret from Secrets Manager');

            const response = await this.#secretsClient
                .getSecretValue({
                    SecretId: process.env.IP_HMAC_SECRET_ARN
                })
                .promise();

            this.#hmacSecret = JSON.parse(response.SecretString).secret;
            console.log('Secret fetched and cached');
        }
        return this.#hmacSecret;
    }

    async generateSignature(ip) {
        const secret = await this.getHmacSecret();
        const hmac = createHmac('sha256', secret);
        hmac.update(ip);
        return hmac.digest('hex');
    }
}

const instance = new IpSignatureManager();
Object.freeze(instance);

export default instance;
