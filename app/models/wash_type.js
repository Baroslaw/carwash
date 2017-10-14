'use strict';

class WashTypeModel {
    static async GetWashTypes() {

        var result = await global.DbExecute(
            'SELECT * FROM `wash_types` WHERE `active` <> 0 ORDER BY `order_number`'
        );

        if (result && result.length > 0) {
            return result;
        }
        else {
            return [];
        }
    }

    static async GetWashTypeById(id) {

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
    }

    static async AddWashType(order_number, name, description) {

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
            console.log(e.message);
            return false;
        }
    }

    static async DeleteWashTypeById(id) {

        var result = await global.DbExecute(
            'UPDATE `wash_types` SET `active`=0 WHERE `id`=?',
            [id]
        );
        return (result && result.affectedRows > 0);
    }
}

module.exports = WashTypeModel;