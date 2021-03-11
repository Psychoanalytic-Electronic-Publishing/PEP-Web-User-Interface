export enum LoginMethod {
    INDIVIDUAL = 'Individual',
    IP = 'IPAddress',
    REFERRER = 'ReferrerURL',
    FEDERATED = 'Federated',
    IP_INDIVIDUAL = 'IPAddressIndividual',
    REFERRER_INDIVIDUAL = 'ReferrerURLIndividual',
    FEDERATED_INDIVIDUAL = 'FederatedIndividual'
}

export interface UserLoginMethod {
    id: LoginMethod;
    label: string;
    logoutLabel?: string;
}

export const LOGIN_INDIVIDUAL: UserLoginMethod = {
    id: LoginMethod.INDIVIDUAL,
    label: 'user.login.individualLogin'
};

export const LOGIN_IP: UserLoginMethod = {
    id: LoginMethod.IP,
    label: 'user.login.ip',
    logoutLabel: 'user.login.network'
};

export const LOGIN_REFERRER: UserLoginMethod = {
    id: LoginMethod.REFERRER,
    label: 'user.login.referrer'
};

export const LOGIN_FEDERATED: UserLoginMethod = {
    id: LoginMethod.FEDERATED,
    label: 'user.login.federated'
};

export const LOGIN_IP_INDIVIDUAL: UserLoginMethod = {
    id: LoginMethod.IP_INDIVIDUAL,
    label: 'user.login.ipIndividual'
};

export const LOGIN_REFERRER_INDIVIDUAL: UserLoginMethod = {
    id: LoginMethod.REFERRER_INDIVIDUAL,
    label: 'user.login.referrerIndividual'
};

export const LOGIN_FEDERATED_INDIVIDUAL: UserLoginMethod = {
    id: LoginMethod.FEDERATED_INDIVIDUAL,
    label: 'user.login.federatedIndividual'
};

const USER_LOGIN_METHODS = [
    LOGIN_INDIVIDUAL,
    LOGIN_IP,
    LOGIN_REFERRER,
    LOGIN_FEDERATED,
    LOGIN_IP_INDIVIDUAL,
    LOGIN_REFERRER_INDIVIDUAL,
    LOGIN_FEDERATED_INDIVIDUAL
];

export default USER_LOGIN_METHODS;
