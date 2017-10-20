'use strict';

const Moment = require('moment');

class WashHistoryModel {

    // TODO - add foreign keys constraints in database
    static async AddHistory(carId, washProgramId, washingDateTime,personId) {

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

    static async GetHistoryForUser(user_id) {

        var result = await global.DbExecute(
            'SELECT `wash_datetime`, `reg_number`, `name` FROM `wash_history` JOIN `cars` ON `wash_history`.`car_id`=`cars`.`id` JOIN `wash_types` ON `wash_history`.`wash_type_id`=`wash_types`.`id` WHERE `person_id`=? ORDER BY `wash_datetime` DESC',
            [user_id]
        );

        // TODO - convert date of retuned objects
        if (result.length > 0) {
            return result.map( r => ({
                "wash_datetime": Moment(r.wash_datetime).format('YYYY-MM-DD HH:mm'),
                "reg_number": r.reg_number,
                "wash_name": r.name
            }));
        }

        return result;
    }

    static async GetHistoryForCar(car_id) {

        var result = await global.DbExecute(
            'SELECT `wash_datetime`, `wash_types`.`name`, `wash_history`.`id`, `used_with_id`, `users`.`name` AS `washer_name` FROM `wash_history` JOIN `wash_types` ON `wash_history`.`wash_type_id`=`wash_types`.`id` LEFT JOIN `users` ON `wash_history`.`person_id`=`users`.`id` WHERE `car_id`=? ORDER BY `wash_datetime` DESC',
            [car_id]
        );

        if (result.length > 0) {
            return result.map( r => ({
                "date": Moment(r.wash_datetime).format('YYYY-MM-DD HH:mm'),
                "wash_type": r.name,
                "is_free": r.id == r.used_with_id,
                "is_used": r.used_with_id != null && r.id != r.used_with_id,
                "washer_name": r.washer_name
            }));
        }
        return result;
    }
}

module.exports = WashHistoryModel;