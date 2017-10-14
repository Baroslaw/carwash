'use strict';

const Moment = require('moment');

class WashHistoryModel {

    // TODO - add foreign keys constraints in database
    static async AddHistory(carId, washProgramId, washingDateTime) {

        // TODO - get id of currently logged person
        var personId = 0;

        if (!washingDateTime) {
            washingDateTime = Moment().format('YYYY-MM-DD HH:mm');
        }

        // TODO - handle errors here
        var result = await global.DbExecute(
            'INSERT INTO `wash_history` (`car_id`,`wash_type_id`,`wash_datetime`,`person_id`) VALUES (?,?,?,?)',
            [carId, washProgramId, washingDateTime, personId]
        );

        if (!result) {
            return null;
        }

        return result.insertId;
    }

    static async GetNotUsedWashingCount(carId)
    {
        var notUsedWashings = await this.GetNotUsedWashings(carId);

        if (!notUsedWashings) {
            return 0;
        }
        
        return notUsedWashings.length;
    }

    static async GetNotUsedWashings(carId)
    {
        var result = await global.DbExecute(
            'SELECT * FROM `wash_history` WHERE `car_id` = ? AND `used_with_id` IS NULL',
            [carId]
        );
        
        return result;
    }

    static async SetUsedWithIdToEntries(used_with_id, idsArray) {

        var result = await global.DbExecute(
            'UPDATE `wash_history` SET `used_with_id` = ? WHERE `id` IN (' + idsArray.toString() +')',
            [used_with_id]
        );
    }
}

module.exports = WashHistoryModel;