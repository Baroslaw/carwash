'use strict';

class CarModel {

    static async GetByRegNumber(regNumber) {

        var result = await global.DbExecute(
            'SELECT * FROM `cars` WHERE `reg_number` = ? ',
             [regNumber]
        );
        
        if (result && result.length > 0) {
            return result[0];
        }
        return null;
    }

    static async GetByRegNumberOrCreate(regNumber) {

        var car = await this.GetByRegNumber(regNumber);
        if (car != null) {
            return car.id;
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