module.exports = {
	PORT: process.env.PORT || 3000,
	MONGO_URL: process.env.MONGODB_URI || 'mongodb://localhost:27017/jsonmicroservice',
	BOXID_MIN_LENGTH: 3,
	baseUrl: '/',
	API_KEY_ALL: 'YOUR PUBLIC API KEY (only get)',
	API_KEY_LIMITED: 'ADMIN LIKE PUBLIC API KEY',
	ARRAY_MAX_LENGTH: 5000,
	JSON_MAX_SIZE: 512 * 1024,
	WINDOW_MS: 500,
	MAX_RATE: 5,
	QUERY_LIMIT: 10000
};
