'use strict';

module.exports = {

    async GetByRegNumber(regNumber) {

        var result = await global.DbExecute(
            'SELECT * FROM `cars` WHERE `reg_number` = ? ',
             [regNumber]
        );
        
        if (result && result.length > 0) {
            return result[0];
        }
        return null;
    },

    async GetByRegNumberOrCreate(regNumber) {

        var car = await this.GetByRegNumber(regNumber);
        if (car != null) {
            return car.id;
        }

        var result = await global.DbExecute(
            'INSERT INTO `cars` (reg_number) VALUES (?)',
            [regNumber]
        );

        if (result) {
            return result.insertId;
        }
        return null;
    },

    async GetCarDataById(carId) {

        var result = await global.DbExecute(
            'SELECT * FROM `cars` WHERE `id` = ?',
            [carId]
        );

        if (!result || result.length < 1) {
            return null;
        }

        var carResult = result[0];
        var WashHistoryDataAccess = require('app/data_access/wash_history');

        carResult.notUsedWashingCount = await WashHistoryDataAccess.GetNotUsedWashingCount(carId);
        carResult.lastWashDate = await WashHistoryDataAccess.GetLastCarWashDate(carId);

        return carResult;
    }
}
