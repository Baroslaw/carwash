'use strict';

module.exports = {
    async GetWashTypes() {

        var result = await global.DbExecute(
            'SELECT * FROM `wash_types` WHERE `active` <> 0 ORDER BY `order_number`'
        );
        return result || [];
    },

    async GetWashTypeById(id) {

        var result = await global.DbExecute(
            'SELECT * FROM `wash_types` WHERE `id` = ?',
            [id]
        );

        if (result && result.length > 0) {
            return result[0];
        }
        else {
            return null;
        }
    },

    async AddWashType(order_number, name, description) {

        try
        {
            var result = await global.DbExecute(
                'INSERT INTO `wash_types` (`order_number`, `name`, `description`) VALUES (?,?,?)',
                [order_number, name, description]
            );

            return result && result.insertId > 0;
        }
        catch(e)
        {
            global.Logger.error('AddWashType '+e.message);
            return false;
        }
    },

    async UpdateWashType(id, order_number, name, description) {

        try
        {
            var result = await global.DbExecute(
                'UPDATE `wash_types` SET `order_number`=?, `name`=?, `description`=? WHERE `id`=?',
                [order_number, name, description, id]
            );
            return result & result.affectedRows > 0;
        }
        catch(e)
        {
            gloabl.Logger.error('UpdateWashType ' + e.message);
            return false;
        }
    },

    async DeleteWashTypeById(id) {

        var result = await global.DbExecute(
            'UPDATE `wash_types` SET `active`=0 WHERE `id`=?',
            [id]
        );
        return (result && result.affectedRows > 0);
    }
}
