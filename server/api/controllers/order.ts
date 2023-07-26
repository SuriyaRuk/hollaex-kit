'use strict';

import { loggerOrders, loggerUser } from '../../config/logger';
import toolsLib from 'hollaex-tools-lib';
import { isPlainObject, isNumber } from 'lodash';
import { errorMessageConverter } from '../../utils/conversion';
import isUUID from  'validator/lib/isUUID';
import { ROLES } from '../../constants';
import { API_KEY_NOT_PERMITTED } from '../../messages';
import { getKitConfig } from '../../utils/hollaex-tools-lib/tools/common';


const createOrder = (req, res) => {
	loggerOrders.verbose(
		req.uuid,
		'controllers/order/createOrder auth',
		req.auth
	);
	loggerOrders.verbose(
		req.uuid,
		'controllers/order/createOrder order',
		req.swagger.params.order.value
	);

	const user_id = req.auth.sub.id;
	let order = req.swagger.params.order.value;

	const opts: any = {
		additionalHeaders: {
			'x-forwarded-for': req.headers['x-forwarded-for']
		}
	};

	if (isPlainObject(order.meta)) {
		opts.meta = order.meta;
	}

	if (isNumber(order.stop)) {
		opts.stop = order.stop;
	}

	if (order.type === 'market') {
		delete order.price;
	}

	toolsLib.order.createUserOrderByKitId(user_id, order.symbol, order.side, order.size, order.type, order.price, opts)
		.then((order) => {
			return res.json(order);
		})
		.catch((err) => {
			loggerOrders.error(
				req.uuid,
				'controllers/order/createOrder error',
				err.message
			);
			return res.status(err.statusCode || 400).json({ message: errorMessageConverter(err) });
		});
};

const getQuickTrade = (req, res) => {
	loggerOrders.verbose(
		req.uuid,
		'controllers/order/createQuickTrade auth',
		req.auth
	);

	const bearerToken = req.headers['authorization'];
	const ip = req.headers['x-real-ip'];

	const opts = {
		additionalHeaders: {
			'x-forwarded-for': req.headers['x-forwarded-for']
		}
	};

	const {
		spending_currency,
		spending_amount,
		receiving_amount,
		receiving_currency,
	} = req.swagger.params;

	toolsLib.order.getUserQuickTrade(spending_currency?.value, spending_amount?.value, receiving_amount?.value, receiving_currency?.value, bearerToken, ip, opts)
		.then((order) => {
			return res.json(order);
		})
		.catch((err) => {
			loggerOrders.error(
				req.uuid,
				'controllers/order/createQuickTrade error',
				err.message
			);
			return res.status(err.statusCode || 400).json({ message: errorMessageConverter(err) });
		});
};

const orderExecute = (req, res) => {
	loggerOrders.verbose(
		req.uuid,
		'controllers/order/orderExecute auth',
		req.auth
	);
	loggerOrders.verbose(
		req.uuid,
		'controllers/order/orderExecute',
		req.swagger.params.data.value
	);


	const { token } = req.swagger.params.data.value;
	const user_id = req.auth.sub.id;

	const opts = {
		additionalHeaders: {
			'x-forwarded-for': req.headers['x-forwarded-for']
		}
	};

	toolsLib.order.executeUserOrder(user_id, opts, token)
		.then((result) => {
			const { symbol, side, size } = result;
			toolsLib.broker.reverseTransaction({ symbol, side, size });
			return res.json(result);
		})
		.catch((err) => {
			loggerOrders.error(
				req.uuid,
				'controllers/order/orderExecute error',
				err.message
			);
			return res.status(err.statusCode || 400).json({ message: errorMessageConverter(err) });
		});
};


const dustBalance = (req, res) => {
	loggerOrders.verbose(
		req.uuid,
		'controllers/order/dustBalance auth',
		req.auth
	);
	loggerOrders.verbose(
		req.uuid,
		'controllers/order/dustBalance',
		req.swagger.params.data.value
	);


	const { assets } = req.swagger.params.data.value;
	const dustConfig = getKitConfig().dust;

	const user_id = req.auth.sub.id;

	const opts = {
		additionalHeaders: {
			'x-forwarded-for': req.headers['x-forwarded-for']
		}
	};

	toolsLib.order.dustUserBalance(user_id, opts, { assets, spread: dustConfig?.spread, maker_id: dustConfig?.maker_id, quote: dustConfig?.quote })
		.then((result) => {
			return res.json(result);
		})
		.catch((err) => {
			loggerOrders.error(
				req.uuid,
				'controllers/order/dustBalance error',
				err.message
			);
			return res.status(err.statusCode || 400).json({ message: errorMessageConverter(err) });
		});
};

const dustEstimatePrice = (req, res) => {
	loggerOrders.verbose(
		req.uuid,
		'controllers/order/dustEstimatePrice auth',
		req.auth
	);
	loggerOrders.verbose(
		req.uuid,
		'controllers/order/dustEstimatePrice',
		req.swagger.params.data.value
	);


	const { assets } = req.swagger.params.data.value;
	const dustConfig = getKitConfig().dust;

	const user_id = req.auth.sub.id;

	const opts = {
		additionalHeaders: {
			'x-forwarded-for': req.headers['x-forwarded-for']
		}
	};

	toolsLib.order.dustPriceEstimate(user_id, opts, { assets, spread: dustConfig?.spread, maker_id: dustConfig?.maker_id, quote: dustConfig?.quote })
		.then((result) => {
			return res.json(result);
		})
		.catch((err) => {
			loggerOrders.error(
				req.uuid,
				'controllers/order/dustEstimatePrice error',
				err.message
			);
			return res.status(err.statusCode || 400).json({ message: errorMessageConverter(err) });
		});
};

const getUserOrder = (req, res) => {
	loggerOrders.verbose(req.uuid, 'controllers/order/getUserOrder auth', req.auth);
	loggerOrders.verbose(
		req.uuid,
		'controllers/order/getUserOrder order_id',
		req.swagger.params.order_id.value
	);
	const user_id = req.auth.sub.id;
	const order_id = req.swagger.params.order_id.value;

	if (!order_id || typeof order_id !== 'string' || !isUUID(order_id)) {
		loggerUser.error(
			req.uuid,
			'controllers/order/getUserOrder invalid order_id',
			order_id
		);
		return res.status(400).json({ message: 'Invalid order id' });
	}

	toolsLib.order.getUserOrderByKitId(user_id, order_id, {
		additionalHeaders: {
			'x-forwarded-for': req.headers['x-forwarded-for']
		}
	})
		.then((order) => {
			return res.json(order);
		})
		.catch((err) => {
			loggerOrders.error(req.uuid, 'controllers/order/getUserOrder error', err.message);
			return res.status(err.statusCode || 400).json({ message: errorMessageConverter(err) });
		});
};

const cancelUserOrder = (req, res) => {
	loggerOrders.verbose(req.uuid, 'controllers/order/cancelUserOrder auth', req.auth);
	loggerOrders.verbose(
		req.uuid,
		'controllers/order/cancelUserOrder order_id',
		req.swagger.params.order_id.value
	);
	const user_id = req.auth.sub.id;
	const order_id = req.swagger.params.order_id.value;

	if (!order_id || typeof order_id !== 'string' || !isUUID(order_id)) {
		loggerUser.error(
			req.uuid,
			'controllers/order/cancelUserOrder invalid order_id',
			order_id
		);
		return res.status(400).json({ message: 'Invalid order id' });
	}

	toolsLib.order.cancelUserOrderByKitId(user_id, order_id, {
		additionalHeaders: {
			'x-forwarded-for': req.headers['x-forwarded-for']
		}
	})
		.then((order) => {
			return res.json(order);
		})
		.catch((err) => {
			loggerOrders.error(req.uuid, 'controllers/order/cancelUserOrder error', err.message);
			return res.status(err.statusCode || 400).json({ message: errorMessageConverter(err) });
		});
};

const getAllUserOrders = (req, res) => {
	loggerOrders.verbose(req.uuid, 'controllers/order/getAllUserOrders auth', req.auth);
	const user_id = req.auth.sub.id;
	const { symbol, side, status, open, limit, page, order_by, order, start_date, end_date, format } = req.swagger.params;

	toolsLib.order.getAllUserOrdersByKitId(
		user_id,
		symbol.value,
		side.value,
		status.value,
		open.value,
		limit.value,
		page.value,
		order_by.value,
		order.value,
		start_date.value,
		end_date.value,
		format.value,
		{
			additionalHeaders: {
				'x-forwarded-for': req.headers['x-forwarded-for']
			}
		}
	)
		.then((order) => {
			if (format.value === 'csv') {
				res.setHeader('Content-disposition', `attachment; filename=${toolsLib.getKitConfig().api_name}-orders.csv`);
				res.set('Content-Type', 'text/csv');
				return res.status(202).send(order);
			} else {
				return res.json(order);
			}
		})
		.catch((err) => {
			loggerOrders.error(req.uuid, 'controllers/order/getAllUserOrders error', err.message);
			return res.status(err.statusCode || 400).json({ message: errorMessageConverter(err) });
		});
};

const cancelAllUserOrders = (req, res) => {
	loggerOrders.verbose(req.uuid, 'controllers/order/cancelAllUserOrders auth', req.auth);
	const user_id = req.auth.sub.id;
	const symbol = req.swagger.params.symbol.value;

	toolsLib.order.cancelAllUserOrdersByKitId(user_id, symbol, {
		additionalHeaders: {
			'x-forwarded-for': req.headers['x-forwarded-for']
		}
	})
		.then((order) => {
			return res.json(order);
		})
		.catch((err) => {
			loggerOrders.error(req.uuid, 'controllers/order/cancelAllUserOrders error', err.message);
			return res.status(err.statusCode || 400).json({ message: errorMessageConverter(err) });
		});
};

const getAdminOrders = (req, res) => {
	loggerOrders.verbose(req.uuid, 'controllers/order/getAdminOrders/auth', req.auth);
	const {
		user_id,
		symbol,
		side,
		status,
		open,
		limit,
		page,
		order_by,
		order,
		start_date,
		end_date,
		format
	} = req.swagger.params;

	if (format.value && req.auth.scopes.indexOf(ROLES.ADMIN) === -1 && !user_id.value) {
		return res.status(403).json({ message: API_KEY_NOT_PERMITTED });
	}

	let promiseQuery;

	if (user_id.value) {
		promiseQuery = toolsLib.order.getAllUserOrdersByKitId(
			user_id.value,
			symbol.value,
			side.value,
			status.value,
			open.value,
			limit.value,
			page.value,
			order_by.value,
			order.value,
			start_date.value,
			end_date.value,
			format.value,
			{
				additionalHeaders: {
					'x-forwarded-for': req.headers['x-forwarded-for']
				}
			}
		);
	} else {
		promiseQuery = toolsLib.order.getAllExchangeOrders(
			symbol.value,
			side.value,
			status.value,
			open.value,
			limit.value,
			page.value,
			order_by.value,
			order.value,
			start_date.value,
			end_date.value,
			format.value,
			{
				additionalHeaders: {
					'x-forwarded-for': req.headers['x-forwarded-for']
				}
			}
		);
	}

	promiseQuery
		.then((orders) => {
			return res.json(orders);
		})
		.catch((err) => {
			loggerOrders.debug(req.uuid, 'controllers/order/getAdminOrders', err.message);
			return res.status(err.statusCode || 400).json({ message: errorMessageConverter(err) });
		});
};

const adminCancelOrder = (req, res) => {
	loggerOrders.verbose(req.uuid, 'controllers/order/adminCancelOrder auth', req.auth);

	const userId = req.swagger.params.user_id.value;
	const order_id = req.swagger.params.order_id.value;

	if (!order_id || typeof order_id !== 'string' || !isUUID(order_id)) {
		loggerUser.error(
			req.uuid,
			'controllers/order/adminCancelOrder invalid order_id',
			order_id
		);
		return res.status(400).json({ message: 'Invalid order id' });
	}

	toolsLib.order.cancelUserOrderByKitId(userId, order_id, {
		additionalHeaders: {
			'x-forwarded-for': req.headers['x-forwarded-for']
		}
	})
		.then((data) => {
			return res.json(data);
		})
		.catch((err) => {
			loggerOrders.error(
				req.uuid,
				'controllers/order/adminCancelOrder',
				err.message
			);
			return res.status(err.statusCode || 400).json({ message: errorMessageConverter(err) });
		});
};

export {
	createOrder,
	getUserOrder,
	cancelUserOrder,
	getAllUserOrders,
	cancelAllUserOrders,
	getAdminOrders,
	adminCancelOrder,
	getQuickTrade,
	dustBalance,
	orderExecute,
	dustEstimatePrice
};
