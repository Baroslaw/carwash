'use strict';

const Moment = require('moment');

module.exports = {

    // TODO - add foreign keys constraints in database
    async AddHistory(carId, washProgramId, washingDateTime, personId) {

        if (!washingDateTime) {
            washingDateTime = Moment().format('YYYY-MM-DD HH:mm:ss');
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

    async GetNotUsedHistoryForCar(car_id)
    {
        var result = await global.DbExecute(
            'SELECT `wash_datetime`, `wash_types`.`name`, `wash_history`.`id`, `used_with_id`, `users`.`name` AS `washer_name`, `users`.`id` AS `washer_id`, `wash_types`.`id` AS `wash_type_id` FROM `wash_history` JOIN `wash_types` ON `wash_history`.`wash_type_id`=`wash_types`.`id` LEFT JOIN `users` ON `wash_history`.`person_id`=`users`.`id` WHERE `car_id`=? AND `wash_history`.`active` = 1 AND ISNULL(`wash_history`.`used_with_id`) ORDER BY `wash_datetime` DESC',
            [car_id]
        );

        if (result.length > 0) {
            return result.map( r => ({
                "id": r.id,
                "date": Moment(r.wash_datetime).format('YYYY-MM-DD HH:mm'),
                "wash_type": r.name,
                "wash_type_id": r.wash_type_id,
                "washer_name": r.washer_name,
                "washer_id": r.washer_id
            }));
        }
        return result;
    },

    async GetLastCarWashDate(car_id) {

        var result = await global.DbExecute(
            'SELECT `wash_datetime` FROM `wash_history` WHERE `car_id`=? AND `wash_history`.`active` = 1 ORDER BY `wash_datetime` DESC LIMIT 1',
            [car_id]
        );

        if (result.length > 0) {
            return result[0].wash_datetime;
        }
        return null;
    },

    async GetHistory(options) {

        var query = 'SELECT \
            wh1.id, \
            wh1.used_with_id, \
            wash_type_id, \
            wash_datetime, \
            cars.reg_number, \
            wash_types.name, \
            users.name AS washer_name, \
            users.id AS washer_id, \
            TIMESTAMPDIFF( \
                HOUR, \
                (\
                    SELECT MAX(wh2.wash_datetime) \
                    FROM wash_history wh2 \
                    WHERE wh2.active=1 AND wh1.car_id=wh2.car_id AND wh2.wash_datetime<=wh1.wash_datetime AND wh1.id!=wh2.id \
                ), \
                wash_datetime) as delta \
        FROM wash_history wh1 \
        JOIN cars ON wh1.car_id=cars.id \
        JOIN wash_types ON wh1.wash_type_id=wash_types.id \
        LEFT JOIN users ON wh1.person_id=users.id';

        var params = [];
        var whereClause = ' wh1.active=1';

        if (options.date_from)
        {
            if (whereClause.length) whereClause += ' AND';
            whereClause += ' wh1.wash_datetime>=?';
            params.push(options.date_from);
        }
        if (options.date_to)
        {
            if (whereClause.length) whereClause += ' AND';
            whereClause += ' wh1.wash_datetime<=?';
            params.push(options.date_to);
        }
        if (options.reg_number)
        {
            if (whereClause.length) whereClause += ' AND';
            whereClause += ' reg_number=?';
            params.push(options.reg_number);
        }
        if (options.washer_id)
        {
            if (whereClause.length) whereClause += ' AND';
            whereClause += ' wh1.person_id=?';
            params.push(options.washer_id);
        }
        if (whereClause.length)
        {
            query += ' WHERE' + whereClause;
        }
        query += ' ORDER BY wash_datetime DESC';

        var result = await global.DbExecute(query, params);

        if (result.length > 0) {
            return result.map( r => ({
                "id": r.id,
                "reg_number": r.reg_number,
                "date": Moment(r.wash_datetime).format('YYYY-MM-DD HH:mm'),
                "wash_type": r.name,
                "wash_type_id": r.wash_type_id,
                "is_free": r.id == r.used_with_id,
                "is_used": r.used_with_id != null && r.id != r.used_with_id,
                "delta": r.delta,
                "is_fast": r.delta != null && r.delta < 48,
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
            'UPDATE `wash_history` SET `wash_datetime` = ?, `wash_type_id` = ?, `person_id` = ? WHERE `active=` AND `id` = ?',
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
