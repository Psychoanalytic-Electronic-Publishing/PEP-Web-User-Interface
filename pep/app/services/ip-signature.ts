import Service from '@ember/service';
import { inject as service } from '@ember/service';
import FastbootService from 'ember-cli-fastboot/services/fastboot';

// @ts-ignore
import AWS from 'aws-sdk';
import { createHmac } from 'crypto';

let cachedSecret: string | null = null;

export default class ServerSecretsService extends Service {
    @service fastboot!: FastbootService;

    async getIpHmacSecret(): Promise<string> {
        if (!this.fastboot.isFastBoot) {
            throw new Error('ServerSecretsService can only be used in FastBoot');
        }

        if (cachedSecret) {
            return cachedSecret;
        }

        const secretsClient = new AWS.SecretsManager();

        const response = await secretsClient
            .getSecretValue({
                SecretId: process.env.IP_HMAC_SECRET_ARN
            })
            .promise();

        cachedSecret = response.SecretString as string;
        return cachedSecret;
    }

    async generateIpSignature(ip: string): Promise<string> {
        const secret = await this.getIpHmacSecret();
        const hmac = createHmac('sha256', secret);
        hmac.update(ip);
        return hmac.digest('hex');
    }
}
