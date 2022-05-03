const req = require("express/lib/request");
const assert = require('assert');
const dataSet = require('../data/data.inMemory');
const DBConnection = require("../data/dbConnection");
const { json } = require("express/lib/response");

//Note: Due to the dummydata present within the in-memory database(in case of testing), the id will start at 2 instead of 0.
let id = 2;

let controller = {
    checkLogin: (req, res, next) => {
        try {

            next();
        } catch (error) {
            const err = {
                status: 401,
                result: 'User has not been logged in'
            }
            next(err);
        }
    },
    checkOwnershipUser: (req, res, next) => {
        const userId = parseInt(req.params.userId);
        const inputUserId = req.body.id;
        console.log(`ID of user is ${userId}.`);

        DBConnection.getConnection((err2, Connection) => {
            if (err2) { throw err2 }
            Connection.query('SELECT * FROM user WHERE id = ?;', [userId], (err3, result) => {
                if (err3) { throw err3 }
                Connection.release();
                let aa = result.length;
                //assert(aa != 0, 'User is not found')
                try {
                    console.log(aa);
                    assert(aa > 0, 'User does not exist');
                    assert(result[0].id == inputUserId, `This user does not own user with ID ${userId}`)
                    next();
                } catch (error) {
                    let err = null;
                    if (error.message == 'User does not exist') {
                        err = {
                            status: 404,
                            result: error.message
                        }
                    } else {
                        err = {
                            status: 401,
                            result: error.message
                        }
                    }
                    next(err);
                }
            })
        })

    }
    ,
    validateUserRegistration: (req, res, next) => {
        let User = req.body;
        let { firstName, lastName, street, city, isActive, email, password, phoneNumber } = User;

        //let {firstName,...other(Mag zelf bedacht worden) } = User;
        //Other in dit geval is het object en de attribuut firstname is weggelaten in het object
        try {
            assert(typeof firstName == 'string', 'Title must be a string');
            assert(typeof lastName == 'string', 'LastName must be a string');
            assert(typeof city == 'string', 'City must be a string');
            assert(typeof street == 'string', 'Street must be a string');
            assert(typeof email == 'string', 'email must be a string');
            assert(typeof password == 'string', 'password must be a string');
            next();
        } catch (err) {
            const error = {
                status: 400,
                result: err.message
            };
            next(error);
        }
    },
    validateUserPost: (req, res, next) => {
        let User = req.body.user;
        console.log(User);
        let { firstName, lastName, street, city, isActive, email, password, phoneNumber } = User;

        //let {firstName,...other(Mag zelf bedacht worden) } = User;
        //Other in dit geval is het object en de attribuut firstname is weggelaten in het object
        try {
            assert(typeof firstName == 'string', 'Title must be a string');
            assert(typeof lastName == 'string', 'LastName must be a string');
            assert(typeof city == 'string', 'City must be a string');
            assert(typeof street == 'string', 'Street must be a string');
            assert(typeof email == 'string', 'email must be a string');
            assert(typeof password == 'string', 'password must be a string');
            assert(typeof phoneNumber == 'string', 'phoneNumber must be a string');
            assert(phoneNumber.length > 8, 'Phonenumber must be 9 characters long');
            next();
        } catch (err) {
            const error = {
                status: 400,
                result: err.message
            };
            next(error);
        }
    },
    //UC-201 Creates user. 
    createUser: (req, res) => {
        let user = req.body;
        console.log(user);
        DBConnection.getConnection((err, connection) => {
            if (err) { throw err };
            console.log('Connection with database');
            connection.query('INSERT INTO user (firstName, lastName, street, city, phoneNumber, emailAdress) VALUES(?, ?, ?, ?, ?, ?)', [user.firstName, user.lastName, user.street, user.city, user.phoneNumber, user.email], (error, results, fields) => {
                if (error) {
                    res.status(401).json({
                        status: 401,
                        result: "Email has been taken"
                    })
                    connection.release();
                } else {
                    connection.query('SELECT * FROM user WHERE emailAdress = ?', [user.email], (err, results, fields) => {
                        connection.release();
                        console.log(`User with ${user.email} has been found.`);
                        //Token generation in development
                        console.log(results[0]);
                        res.status(200).json({
                            status: 200,
                            result: `User has been registered.`,
                            user: results[0]
                        })
                    })
                }

            })

        })
    }
    ,
    //UC-202 Retrieves all users
    //amount=? query parameters
    //active or inactive query parameters
    getAllUsers: (req, res) => {
        let active = req.query.isActive;

        let booleanValue = 0;
        if (active != undefined && active == 'true') {
            booleanValue = 1;
        }
        console.log(booleanValue)
        let searchTerm = req.query.searchTerm;
        let limit = req.query.amount;
        let query = "SELECT * FROM user";

        console.log(`Active is ${active}`);
        console.log(`Searchterm is ${searchTerm}`)
        console.log(`Limit is ${limit}`)

        if (active != undefined && searchTerm != undefined && limit != undefined) {
            query = `SELECT * FROM user WHERE isActive = ${booleanValue} AND firstName LIKE %${searchTerm}% OR lastName LIKE %${searchTerm}% LIMIT ${limit};`
            console.log(query);
        } else if (active != undefined && searchTerm != undefined) {
            query = `SELECT * FROM user WHERE isActive = ${booleanValue} AND firstName LIKE '%${searchTerm}%' OR lastName LIKE '%${searchTerm}%';`
            console.log(query);
        } else if (searchTerm != undefined && limit != undefined) {
            query = `SELECT * FROM user WHERE firstName LIKE '%${searchTerm}%' OR lastName LIKE '%${searchTerm}%' LIMIT ${limit};`
            console.log(query);
        } else if (limit != undefined) {
            query = `SELECT * FROM user LIMIT ${limit};`
            console.log(query);
        } else if (active != undefined) {
            query = `SELECT * FROM user WHERE isActive = ${booleanValue};`
            console.log(query);
        } else if (searchTerm != undefined) {
            query = `SELECT * FROM user WHERE firstName LIKE '%${searchTerm}%' OR lastName LIKE '%${searchTerm}%';`
            console.log(query);
        }
        DBConnection.getConnection((error, connection) => {
            connection.query(query, (error, result, fields) => {
                connection.release();
                if (error) { throw error }
                let roles = [];
                result.forEach(user => {
                    roles = user.roles.split(",");
                    user.roles = roles;
                    user.isActive = (user.isActive == 1);
                });
                res.status(200).json({
                    status: 200,
                    amount: result.length,
                    result: result,
                })
            })
        })
    },
    //UC-203 Retrieve user profile, based on Token and userID
    //Token functionality has not been developed - in process
    getProfile: (req, res) => {
        //Token, still empty
        res.status(401).json({
            status: 401,
            result: "Correct token functionality has not been implemented",
        })
    }
    ,
    //UC-204 Retrieves user, based on userId
    retrieveUserById: (req, res) => {
        const userId = req.params.userId;
        console.log(`User met ID ${userId} gezocht`);
        DBConnection.getConnection((err, connection) => {
            connection.query('SELECT * FROM user WHERE id = ?', [userId], (error, result, field) => {
                connection.release();
                console.log(`Length of result is ${result.length}`);
                console.log(result[0])
                if (result.length != 0) {
                    res.status(202).json({
                        status: 202,
                        result: `User with id: ${userId} found`,
                        user: result[0]
                    })
                } else {
                    res.status(404).json({
                        status: 404,
                        result: `User with id: ${userId} does not exist. Retrieval has failed.`
                    })
                }
            })
        })
    }
    ,
    //UC-205 Edits user.
    updateUser: (req, res) => {
        const id = req.params.userId;
        let newUser = req.body.user;
        let activeValue = 0;
        if (newUser.isActive) {
            activeValue = 1;
        }
        console.log(`UserID of ${newUser.firstName} is ${id}.`)
        //Filters the array, based on userId. If the input userId is found in the in-memory database, 
        //it will return 1. otherwise it will return 0
        DBConnection.getConnection((error, connection) => {
            connection.query('UPDATE user SET firstName = ?, lastName = ?, city = ?, street = ?, password = ?, emailAdress = ?, isActive = ?, phoneNumber = ? WHERE id = ?;',
                [newUser.firstName, newUser.lastName, newUser.city, newUser.street, newUser.password, newUser.email, activeValue, newUser.phoneNumber, id],
                (error, result, field) => {
                    console.log(`Affected rows UPDATE: ${result.affectedRows}`);
                    connection.release();
                    if (result.affectedRows == 0) {
                        res.status(404).json({
                            status: 404,
                            result: `Update has failed. Id: ${id} does not exist.`
                        })
                    } else {
                        newUser = { id, ...newUser };
                        res.status(200).json({
                            status: 200,
                            result: "Succesful transaction",
                            updatedUser: newUser
                        })
                    }

                })
        })
    }
    ,
    //UC-206 Deletes user based on id
    deleteUser: (req, res) => {
        const iD = req.params.userId
        DBConnection.getConnection((error, conn) => {
            conn.query('DELETE FROM user  WHERE id = ?;', [iD], (error, result) => {
                console.log('Ronde deletion');
                console.log(result.affectedRows);
                if (result.affectedRows > 0) {
                    res.status(200).json({
                        status: 200,
                        result: `User with user with Id ${iD}, has been removed.`,
                        CurrentUsers: dataSet.userData
                    })
                } else {
                    res.status(404).json({
                        status: 404,
                        result: `Removal has failed. Id ${iD} has either been removed or does not exist`
                    })
                }
                conn.release();
            })
        })
    }
}

module.exports = controller;