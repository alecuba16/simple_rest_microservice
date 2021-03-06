const utils = require('./utils');
const Data = require('./db').getInstance();
const config = require('./config');

const post = async (req, res, next) => {
	try {
		const createRecord = async body => {
			const date = new Date();
			let record = { _box: req.box };

			if (req.collection) record['_collection'] = req.collection;
			record['_createdOn'] = date;
			record['data'] = body;

			const newRecord = await new Data(record).save();
			return utils.responseBody(newRecord, req.collection);
		};

		if (Array.isArray(req.body)) {
			const createRecordPromise = req.body.map(createRecord);
			const newRecords = await Promise.all(createRecordPromise);
			res.json(newRecords);
		} else {
			const newRecord = await createRecord(req.body);
			res.json(newRecord);
		}
	} catch (error) {
		next(error);
	}
};

const get = async (req, res, next) => {
	try {
		if (req.recordId) {
			const record = await Data.findOne({ _id: req.recordId, _box: req.box }).exec();
			res.json(utils.responseBody(record, req.collection));
		} else {
			const skip = req.query.skip ? +req.query.skip : 0;

			let limit = req.query.limit ? +req.query.limit : config.QUERY_LIMIT;
			limit = limit > config.QUERY_LIMIT ? config.QUERY_LIMIT : limit;

			let sort = req.query.sort ? req.query.sort : '-_createdOn';
			if (!['_createdOn', '-_createdOn', '_updatedOn', '-_updatedOn'].includes(sort)) {
				sort = sort[0] === '-' ? '-data.' + sort.substr(1) : 'data.' + sort;
			}

			let query = {};
			if (req.query.q) query = utils.parse_query(req.query.q);

			query['_box'] = req.box;
			if (req.collection) query['_collection'] = req.collection;

			const records = await Data.find(query)
				.skip(skip)
				.limit(limit)
				.sort(sort)
				.exec();
			res.json(records.map(r => utils.responseBody(r, req.collection)));
		}
	} catch (error) {
		next(error);
	}
};
const put = async (req, res, next) => {
	try {
		const record = await Data.findOne({ _id: req.recordId, _box: req.box }).exec();
		if (record) {
			await Data.updateOne(
				{ _id: req.recordId, _box: req.box },
				{
					_updatedOn: new Date(),
					data: req.body
				}
			);
			res.json({ message: 'Record updated.' });
		} else {
			res.status(400).json({ message: 'Invalid record Id' });
		}
	} catch (error) {
		next(error);
	}
};
const delete = async (req, res, next) => {
	try {
		if (req.recordId) {
			const record = await Data.findOne({ _id: req.recordId, _box: req.box }).exec();

			if (record) {
				await Data.deleteOne({ _id: req.recordId, _box: req.box });
				res.json({ message: 'Record removed.' });
			} else {
				res.status(400).json({ message: 'Invalid record Id' });
			}
		} else if (req.query.q) {
			const query = utils.parse_query(req.query.q);
			query['_box'] = req.box;

			const result = await Data.deleteMany(query);
			res.json({ message: result.deletedCount + ' Records removed.' });
		}
	} catch (error) {
		next(error);
	}
};

const meta = async (req, res, next) => {
	try {
		let query = {};
		query['_box'] = req.params.boxId;

		const promises = [
			Data.countDocuments(query).exec(),
			Data.findOne(query)
				.sort('_createdOn')
				.exec(),
			Data.findOne(query)
				.sort('-_updatedOn')
				.exec()
		];

		const result = {};
		Promise.all(promises).then(function (values) {
			result['_count'] = values[0];

			if (values[0] > 0) {
				// get first _createdOn
				const createdOn = values[1]['_createdOn'];
				if (createdOn) result['_createdOn'] = createdOn;

				// get last _updatedOn
				const updatedOn = values[2]['_updatedOn'];
				if (updatedOn) result['_updatedOn'] = updatedOn;
			}

			res.json(result);
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	post,
	get,
	put,
	delete,
	meta
};
