export const SET_SELECTED_PAYMENT = 'SET_SELECTED_PAYMENT';
export const SET_EXCHANGE_PLAN_TYPE = 'SET_EXCHANGE_PLAN_TYPE';
export const SET_SELECTED_TYPE = 'SET_SELECTED_TYPE';
export const SET_SELECTED_CRYPTO = 'SET_SELECTED_CRYPTO';
export const SET_CRYPTO_PAYMENT_TYPE = 'SET_CRYPTO_PAYMENT_TYPE';
export const SET_TRANSFER_CRYPTO_PAYMENT = 'SET_TRANSFER_CRYPTO_PAYMENT';

export const setSelectedPayment = (data = '') => ({
	type: SET_SELECTED_PAYMENT,
	payload: data,
});

export const setSelectedType = (data = '') => ({
	type: SET_SELECTED_TYPE,
	payload: data,
});

export const setExchangePlanType = (data = '') => ({
	type: SET_EXCHANGE_PLAN_TYPE,
	payload: data,
});

export const setSelectedCrypto = (data = '') => ({
	type: SET_SELECTED_CRYPTO,
	payload: data,
});

export const setCryptoPaymentType = (data = '') => ({
	type: SET_CRYPTO_PAYMENT_TYPE,
	payload: data,
});

export const setTransferCryptoPayment = (data = '') => ({
	type: SET_TRANSFER_CRYPTO_PAYMENT,
	payload: data,
});
