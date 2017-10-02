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
}

module.exports = WashTypeModel;