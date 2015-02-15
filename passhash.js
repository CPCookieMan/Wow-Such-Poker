var crypto = require('crypto');

function hashPassword(username, password)
{
	var shahasher = crypto.createHash('sha1');
	shahasher.update(username + password + "phollinskyFVeSqnQnmMFWkfF5DW8MzsEln5skW7ByE5JRDCgY6OofoR");
	return shahasher.digest('hex');
}

module.exports = { hashPassword: hashPassword };