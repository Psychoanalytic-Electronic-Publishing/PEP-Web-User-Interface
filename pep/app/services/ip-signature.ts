import Service from '@ember/service';
import { inject as service } from '@ember/service';
import FastbootService from 'ember-cli-fastboot/services/fastboot';
import fetch from 'fetch';
import ENV from 'pep/config/environment';

let cachedSecret: string | null = null;

export default class IpSignatureService extends Service {
    @service fastboot!: FastbootService;

    async getIpHmacSecret(): Promise<string> {
        console.log('Get1');
        if (!this.fastboot.isFastBoot) {
            throw new Error('ServerSecretsService can only be used in FastBoot');
        }

        if (cachedSecret) {
            return cachedSecret;
        }

        const extensionPort = ENV.PARAMETERS_SECRETS_EXTENSION_HTTP_PORT || 2773;
        const sessionToken = ENV.AWS_SESSION_TOKEN;

        if (!sessionToken) {
            throw new Error('AWS_SESSION_TOKEN is required for secrets extension');
        }

        const response = await fetch(
            `http://localhost:${extensionPort}/secretsmanager/get?secretId=${ENV.IP_HMAC_SECRET_ARN}`,
            {
                headers: {
                    'X-Aws-Parameters-Secrets-Token': sessionToken
                }
            }
        );
        console.log('Get2');
        if (!response.ok) {
            throw new Error(`Failed to fetch secret: ${response.statusText}`);
        }

        const data = await response.json();
        cachedSecret = data.SecretString as string;
        console.log('Get3');
        return cachedSecret;
    }

    async generateIpSignature(ip: string): Promise<string> {
        console.log('Gen1');
        const secret = await this.getIpHmacSecret();
        console.log('Gen2');
        const { createHmac } = require('crypto');
        console.log('Gen3');
        const hmac = createHmac('sha256', secret);
        hmac.update(ip);
        console.log('Gen4');
        return hmac.digest('hex');
    }
}

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
    interface Registry {
        'ip-signature': IpSignatureService;
    }
}
