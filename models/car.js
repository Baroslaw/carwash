'use strict';

class CarModel {

    static async GetByRegNumberOrCreate(regNumber) {

        var result = await global.DbExecute(
            'SELECT `id` FROM `cars` WHERE `reg_number` = ? ',
             [regNumber]
        );
        
        if (result && result.length > 0) {
            return result[0].id;
        }

        result = await global.DbExecute(
            'INSERT INTO `cars` (reg_number) VALUES (?)',
            [regNumber]
        );

        if (result) {
            return result.insertId;
        }
        return null;
    }

    static async GetCarDataById(carId) {

        var result = await global.DbExecute(
            'SELECT * FROM `cars` WHERE `id` = ?',
            [carId]
        );

        if (!result || result.length < 1) {
            return null;
        }

        var carResult = result[0];
        var WashHistoryModel = require('./wash_history');

        carResult.notUsedWashingCount = await WashHistoryModel.GetNotUsedWashingCount(carId);

        return carResult;
    }
}

module.exports = CarModel;