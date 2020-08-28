declare module 'pep/api' {
    export interface ServerStatus {
        db_server_ok: boolean;
        text_server_ok: boolean;
        text_server_version: string;
        opas_version: string;
        dataSource: string;
        timeStamp: string;
        user_ip: string;
    }
}
