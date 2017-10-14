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
            'SELECT `name`,`role` FROM `users` WHERE `name` = ? AND `password` = ? AND `active` = 1',
             [username, hashedPassword]
        );

        if (result && result.length > 0) {

            var user = result[0];

            // Setting some extra data
            user.isAdmin = user.role == 'admin';

            return user;
        }

        throw new Error("User not found");
    }

    static async GetUsersNames() {

        var result = await global.DbExecute(
            'SELECT `name` FROM `users` WHERE `active` = 1'
        );

        if (result && result.length > 0) {
            return result.map(user => user.name);
        }
        return [];
    }

    static async GetAllUsersData() {
        
        var result = await global.DbExecute(
            'SELECT * FROM `users` WHERE `active` = 1'
        );
        if (result && result.length > 0) {
            return result;
        }
        return [];
    }

    static async DeleteUserById(id) {

        var result = await global.DbExecute(
            'UPDATE `users` SET `active`=0 WHERE `id`=?',
            [id]
        );

        return (result && result.affectedRows > 0);
    }

    static async CreateUser(name, role, password) {

        try{
            var result = await global.DbExecute(
                'INSERT INTO `users` (`name`, `role`, `password`) VALUES (?,?,?)',
                [name, role, this.HashedPassword(password)]
            );
            return (result && result.insertId > 0);
        }
        catch(e)
        {
            console.log(e.message);
            return false;
        }
    }
}

module.exports = UserModel;