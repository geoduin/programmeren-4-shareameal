const BCrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
const logr = require('../config/config').logger;

const passWordCryprion = {

    try: (password) => {
        BCrypt.hash(password, saltRounds, function (err, hash) {
            // Store hash in your password DB.
            logr.debug(hash);
            return hash;
        });
    }
}

module.exports = passWordCryprion;