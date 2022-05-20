const jwt = require('jsonwebtoken');
module.exports = {
    IntToBoolean(int){
        return (int == 1);
    },
    convertOldDateToMySqlDate(pp) {
        let dated = pp;
        dated = dated.replace("T", " ").substring(0, 19);
        return dated;
    },
    mealCorrectFormat(meal) {
        meal.isVega = this.IntToBoolean(meal.isVega);
        meal.isVegan = this.IntToBoolean(meal.isVegan);
        meal.isToTakeHome = this.IntToBoolean(meal.isToTakeHome);
        meal.isActive = this.IntToBoolean(meal.isActive);
        meal.allergenes = meal.allergenes.split(",");
        meal.price = parseFloat(meal.price);
        return meal;
    },
    userCookCorrectFormat(User) {
        User.isActive = this.IntToBoolean(User.isActive);
        delete User.password;
        User.roles = User.roles.split(",");
        return User;
    },
    decodeToken(headerBearer) {
        const token = headerBearer.substring(7, headerBearer.length);
        return jwt.decode(token);
    },
    convertBooleanToInt(booleanV) {
        if (booleanV) {
            return 1;
        }
        return 0;
    }
}