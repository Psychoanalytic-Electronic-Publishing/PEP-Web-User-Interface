import Service from '@ember/service';
import { inject as service } from '@ember/service';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import fetch from 'fetch';

let cachedSecret: string | null = null;

export default class IpSignatureService extends Service {
    @service fastboot!: FastbootService;

    async getIpHmacSecret(): Promise<string> {
        if (!this.fastboot.isFastBoot) {
            throw new Error('ServerSecretsService can only be used in FastBoot');
        }

        if (cachedSecret) {
            return cachedSecret;
        }

        const extensionPort = process.env.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT || 2773;
        const sessionToken = process.env.AWS_SESSION_TOKEN;

        if (!sessionToken) {
            throw new Error('AWS_SESSION_TOKEN is required for secrets extension');
        }

        const response = await fetch(
            `http://localhost:${extensionPort}/secretsmanager/get?secretId=${process.env.IP_HMAC_SECRET_ARN}`,
            {
                headers: {
                    'X-Aws-Parameters-Secrets-Token': sessionToken
                }
            }
        );
        if (!response.ok) {
            throw new Error(`Failed to fetch secret: ${response.statusText}`);
        }

        const data = await response.json();
        cachedSecret = data.SecretString as string;

        return cachedSecret;
    }

    async generateIpSignature(ip: string): Promise<string> {
        if (!this.fastboot.isFastBoot) {
            throw new Error('ServerSecretsService can only be used in FastBoot');
        }

        const secret = await this.getIpHmacSecret();
        const hmac = createHmac('sha256', 'secret-1234');
        hmac.update(ip);
        return hmac.digest('hex');
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        'ip-signature': IpSignatureService;
    }
}
