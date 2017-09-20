'use strict';

class CarModel {

    static async GetByRegNumberOrCreate(regNumber) {

        var result = await global.DbConnection.execute(
            'SELECT `id` FROM `cars` WHERE `reg_number` = ? ',
             [regNumber]
        );
        
        if (result[0].length > 0) {
            return result[0][0].id;
        }

        result = await global.DbConnection.execute(
            'INSERT INTO `cars` (reg_number) VALUES (?)',
            [regNumber]
        );
        return result[0].insertId;
    }
}

module.exports = CarModel;