import {
    DeliveryServiceProfile,
    DeliveryServiceProfileKeys,
} from '@dm3-org/dm3-lib-profile';

export const configureEnv = (
    keys: DeliveryServiceProfileKeys,
    rpc: string,
    ensDomain: string,
    url: string,
    address: string,
    keyCreationMessage: string,
    profile: DeliveryServiceProfile,
) => {
    return (
        'SIGNING_PUBLIC_KEY=' +
        keys.signingKeyPair.publicKey +
        '\n' +
        'SIGNING_PRIVATE_KEY=' +
        keys.signingKeyPair.privateKey +
        '\n' +
        'ENCRYPTION_PUBLIC_KEY=' +
        keys.encryptionKeyPair.publicKey +
        '\n' +
        'ENCRYPTION_PRIVATE_KEY=' +
        keys.encryptionKeyPair.privateKey +
        '\n' +
        'RPC=' +
        rpc +
        '\n' +
        '# the following information is only included for convenience, it is not used by the delivery service\n' +
        '# ENS_DOMAIN=' +
        ensDomain +
        '\n' +
        '# URL=' +
        url +
        '\n' +
        '# ACCOUNT_USED_FOR_KEY_CREATION=' +
        address +
        '\n' +
        '# MESSAGE_USED_FOR_KEY_CREATION=' +
        keyCreationMessage +
        '\n' +
        '# PROFILE=' +
        JSON.stringify(profile) +
        '\n'
    );
};
