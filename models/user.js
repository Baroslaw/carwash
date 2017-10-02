'use strict';

const CryptoModule = require('crypto');

const passwordSalt = 'Cr5aJNRt2ZfD51O';

class UserModel {

    static HashedPassword(password) {

        try {
            var hash = CryptoModule.createHash("SHA256");
            var digest = hash.update(password + passwordSalt).digest('hex');
            console.log(`Digest ${digest} for password ${password}`);
            return digest;
        }
        catch(e) {
            console.log(e.message);
            throw e;
        }
    }

    // Throws when user is not found
    static async GetUser(username, password) {
        
        var hashedPassword = this.HashedPassword(password);

        var result = await global.DbExecute(
            'SELECT `name`,`role` FROM `users` WHERE `name` = ? AND `password` = ?',
             [username, hashedPassword]
        );

        if (result && result.length > 0) {
            return result[0];
        }

        throw new Error("User not found");
    }

    static async GetUsersNames() {

        var result = await global.DbExecute(
            'SELECT `name` FROM `users`'
        );

        if (result && result.length > 0) {
            return result.map(user => user.name);
        }
        return [];
    }
}

module.exports = UserModel;