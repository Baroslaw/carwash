'use strict';

class WashTypeModel {
    static async GetWashTypes() {

        var result = await global.DbConnection.execute(
            'SELECT * FROM `wash_types` WHERE `active` <> 0 ORDER BY `order_number`'
        );

        if (result[0].length > 0) {
            return result[0];
        }
        else {
            return [];
        }
    }
}

module.exports = WashTypeModel;