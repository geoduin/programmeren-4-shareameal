
const queries = {
    //Search queries
    selectUserId:'SELECT * FROM user WHERE id = ?;',
    selectEmailCount:'SELECT COUNT(*) AS amount FROM user WHERE emailAdress = ?;',
    selectUserEmail: 'SELECT * FROM user WHERE emailAdress = ?;',
    selectAllUsers: 'SELECT * FROM user;',
    selectMealCook:'SELECT * FROM meal WHERE cookId = ?;',
    selectMeal: `SELECT * FROM meal WHERE id = ?;`,
    selectSignUp: 'SELECT COUNT(*) AS count FROM meal_participants_user WHERE mealId = ? AND userId = ?;',
    selectAllMeals: 'SELECT * FROM meal;',
    selectAllCooks: 'SELECT * FROM user WHERE id IN (SELECT cookId FROM meal);',
    selectAmountOfParticipantsOfMeal: 'SELECT id, maxAmountOfParticipants, userId FROM (SELECT id, maxAmountOfParticipants FROM meal)AS meals LEFT JOIN meal_participants_user ON meal_participants_user.mealId = meals.id WHERE id = ?;',
    selectAllParticipants: 'SELECT * FROM user JOIN meal_participants_user ON user.id = meal_participants_user.userId WHERE id IN (SELECT userId FROM meal_participants_user);',
    selectCookMealId:'SELECT cookId FROM meal WHERE id = ?;',
    selectCookInMeal: `SELECT * FROM user WHERE id IN (SELECT cookId FROM meal WHERE id = ?);`,
    selectParticipantsOfMeal: `SELECT * FROM user JOIN meal_participants_user ON user.id = meal_participants_user.userId WHERE meal_participants_user.mealId = ?;`,
    selectParticipantsOfAnMeal: 'SELECT * FROM user WHERE id IN (SELECT userId FROM meal_participants_user WHERE mealId = ?);',
    selectLastId: 'SELECT LAST_INSERT_ID() AS id;',
    //Inserts queries
    insertNewUser:'INSERT INTO user (firstName, lastName, street, city, phoneNumber, emailAdress, password) VALUES(?, ?, ?, ?, ?, ?, ?);',
    insertParticipation: `INSERT INTO meal_participants_user VALUES(?,?);`,
    insertMeal: 'INSERT INTO meal (name, description, isVega, isVegan, isToTakeHome, dateTime, imageUrl, allergenes, maxAmountOfParticipants, price, cookId) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);',
    //Update queries
    updateUser: 'UPDATE user SET firstName = ?, lastName = ?, city = ?, street = ?, password = ?, emailAdress = ?, isActive = ?, phoneNumber = ? WHERE id = ?;',
    updateMeal:"UPDATE meal SET name = ? ,description = ?, isActive = ?,isVega = ?,isVegan = ?,isToTakeHome = ?,dateTime = ?,imageUrl = ?,allergenes = ?,maxAmountOfParticipants = ?, price = ? WHERE id = ?;",
    deleteUserAndRelated: 'DELETE FROM meal WHERE cookId = ?; DELETE FROM user WHERE id = ?;',
    deleteParticipation: 'DELETE FROM meal_participants_user WHERE mealId = ? AND userId = ?;',
}   
module.exports = queries;