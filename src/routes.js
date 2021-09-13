const router = require('express').Router();
const rateLimit = require('express-rate-limit');
// TODO change by express-slow-down
const config = require('./config');
const model = require('./model');
const validators = require('./validators');

router.get(config.baseUrl + '_meta/:boxId', model.xmeta);

// list of all validators to be in place
router.use(validators.removeNativeKeys);
router.use(validators.sizeValidator);
router.use(validators.keysValidator);
router.use(validators.extractParams);
router.use(validators.validateParams);
router.use(validators.authenticateRequest);

// only 100 POST requests are allowed in x's minutes window (rate limit)
router.post(config.baseUrl + '*', rateLimit({ windowMs: config.WINDOW_MS, max: config.MAX_RATE }), model.xpost);
router.get(config.baseUrl + '*', model.xget);
router.put(config.baseUrl + '*', model.xput);
router.delete(config.baseUrl + '*', model.xdelete);

/**
 * DATA endpoint's common error handling middleware
 */
router.use((err, req, res, next) => {
	console.error(err);
	res.status(err.statusCode || 500).json({ message: err.message });
});

module.exports = router;
