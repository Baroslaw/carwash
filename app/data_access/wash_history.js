'use strict';

const Moment = require('moment');

module.exports = {

    // TODO - add foreign keys constraints in database
    async AddHistory(carId, washProgramId, washingDateTime, personId) {

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
    },

    async GetNotUsedWashingCount(carId)
    {
        var notUsedWashings = await this.GetNotUsedWashings(carId);

        if (!notUsedWashings) {
            return 0;
        }
        
        return notUsedWashings.length;
    },

    async GetNotUsedWashings(carId)
    {
        var result = await global.DbExecute(
            'SELECT * FROM `wash_history` WHERE `car_id` = ? AND `used_with_id` IS NULL AND `active` = 1',
            [carId]
        );
        
        return result;
    },

    async SetUsedWithIdToEntries(used_with_id, idsArray) {

        var result = await global.DbExecute(
            'UPDATE `wash_history` SET `used_with_id` = ? WHERE `id` IN (' + idsArray.toString() +') AND `active` = 1',
            [used_with_id]
        );
    },

    async GetHistoryForUser(user_id, date_from, date_to) {

        var query = 'SELECT `wash_datetime`, `reg_number`, `name` FROM `wash_history` JOIN `cars` ON `wash_history`.`car_id`=`cars`.`id` JOIN `wash_types` ON `wash_history`.`wash_type_id`=`wash_types`.`id` WHERE `person_id`=? AND `wash_history`.`active` = 1'
        var params = [user_id];

        if (date_from != null && date_from != "") {
            query += ' AND `wash_datetime`>=?';
            params.push(date_from);
        }
        if (date_to != null && date_to != "") {
            date_to = Moment(date_to).add(1,"days").format('YYYY-MM-DD');
            query += ' AND `wash_datetime`<=?',
            params.push(date_to);
        }
        query += ' ORDER BY `wash_datetime` DESC';
        var result = await global.DbExecute(
            query, params
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
    },

    async GetHistoryForCar(car_id) {

        var result = await global.DbExecute(
            'SELECT `wash_datetime`, `wash_types`.`name`, `wash_history`.`id`, `used_with_id`, `users`.`name` AS `washer_name`, `users`.`id` AS `washer_id`, `wash_types`.`id` AS `wash_type_id` FROM `wash_history` JOIN `wash_types` ON `wash_history`.`wash_type_id`=`wash_types`.`id` LEFT JOIN `users` ON `wash_history`.`person_id`=`users`.`id` WHERE `car_id`=? AND `wash_history`.`active` = 1 ORDER BY `wash_datetime` DESC',
            [car_id]
        );

        if (result.length > 0) {
            return result.map( r => ({
                "id": r.id,
                "date": Moment(r.wash_datetime).format('YYYY-MM-DD HH:mm'),
                "wash_type": r.name,
                "wash_type_id": r.wash_type_id,
                "is_free": r.id == r.used_with_id,
                "is_used": r.used_with_id != null && r.id != r.used_with_id,
                "washer_name": r.washer_name,
                "washer_id": r.washer_id
            }));
        }
        return result;
    },

    async GetHistoryEntryById(id) {

        global.Logger.debug('GetHistoryEntryById ' + id);

        var result = await global.DbExecute(
            'SELECT * FROM `wash_history` WHERE `id` = ?',
            [id]
        );
        return result;
    },

    async UpdateHistoryEntryById(id, date, wash_type_id, washer_id) {

        global.Logger.debug('UpdateHistoryEntryById ' + id);
        
        var result = await global.DbExecute(
            'UPDATE `wash_history` SET `wash_datetime` = ?, `wash_type_id` = ?, `person_id` = ? WHERE `id` = ?',
            [date, wash_type_id, washer_id, id]
        );

        return (result && result.affectedRows > 0);
    },

    async RemoveHistory(id) {

        var result = await global.DbExecute(
            'UPDATE `wash_history` SET `active` = 0 WHERE `id` = ?',
            [id]
        );

        return (result && result.affectedRows > 0);
    }
}
