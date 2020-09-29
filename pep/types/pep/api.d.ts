declare module 'pep/api' {
    import { SessionType } from 'pep/authenticators/credentials';
    export interface ServerStatus {
        db_server_ok: boolean;
        text_server_ok: boolean;
        text_server_version: string;
        opas_version: string;
        dataSource: string;
        timeStamp: string;
        user_ip: string;
    }

    export interface SearchMetadata {
        facetCounts: {
            facet_fields: {
                [x: string]: {
                    [x: string]: number;
                };
            };
        };
    }

    export interface PepSecureAuthenticatedData {
        HasSubscription: boolean;
        IsValidLogon: boolean;
        IsValidUserName: boolean;
        ReasonId: number;
        ReasonStr: string;
        SessionId: string;
        SessionExpires: number;
        SessionType: SessionType;
        authenticator: string;
        expiresAt: number;
    }
}
