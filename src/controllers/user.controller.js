const req = require("express/lib/request");
const assert = require('assert');
const dataSet = require('../data/data.inMemory');
const DBConnection = require("../data/dbConnection");


//Note: Due to the dummydata present within the in-memory database(in case of testing), the id will start at 2 instead of 0. 
let id = 2;
//Regex for email
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//Regex for phones - every phonenumber must start with 06
const phoneRegex = /06|31( {1}|-{1})\d{9}/;
//Regex for passwords - at least one lowercase character, at least one UPPERCASE character, at least one digit and at least 8 characters long
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

let controller = {
    //As placeholder for the token, will the object with the id function as the Id, Object{id:(id)}/
    checkToken: (req, res, next) => {
        console.log('Token checker');
        const userObject = req.body.id;
        try {
            assert(typeof userObject == 'number', 'Invalid token')
            next();
        } catch (error) {
            const err = {
                status: 404,
                result: error.message,
                note: 'Token implementation has not been implemented. It is in process'
            }
            next(err);
        }
    }
    ,
    testRegex: (req, res) => {
        let value = phoneRegex.test(req.params.input);
        let value2 = passwordRegex.test(req.params.input2);
        let d = new Date(1443567600000);
        d.setTime(d.getTime() - new Date().getTimezoneOffset() * 60 * 1000);

        res.status(200).json({
            status: 200,
            phoneResult: d,
            passwordResult: value2
        })
    }
    ,
    testDateDB: (req, res) => {
        console.log('Start');
        DBConnection.getConnection((error, connect) => {
            connect.promise().query('SELECT * FROM user WHERE id = ?;', [req.params.id])
                .then(([result, fields]) => {
                    console.log(result[0]);
                }).then(connect.promise().query('SELECT * FROM meal WHERE cookId = ?;', [req.params.id]).then(([result2]) => {
                    console.log(result2);
                }).then(() => {
                    connect.release();
                }))
        })
        // DBConnection.getConnection((err, con) => {
        //     con.promise()
        //         .query('SELECT * FROM user;', [req.params.id])
        //         .then(([rows, fields]) => {
        //             console.log(rows);
        //         })
        //         .then(con.promise().query('SELECT * FROM meal')
        //                 .then(([rows2, fields2]) => {
        //                     console.log(rows2[0]);
        //                     res.status(200).json({
        //                         status: 200,
        //                         phoneResult: 'Yes'
        //                     })
        //                 }).then(()=>{
        //                     con.release();
        //                 })
        //         )
        // })
    }
    ,
    checkLogin: (req, res, next) => {
        console.log('Check login');
        const userObject = req.body.id;
        try {
            assert(typeof userObject == 'number', 'User has not been logged in')
            next();
        } catch (error) {
            const err = {
                status: 401,
                result: error.message
            }
            next(err);
        }
    },

    //Assists UC-205, Note: The functional design document has stated that the response code for non-existent users when updating a user is 400. 
    //Unlike that of the response code for non-existent users of UC-206, which is 404. That is why their is two similiar methods of validating user existence
    checkUserExistenceAndOwnership: (req, res, next) => {
        console.log('UC-205 Check ownership and existence');
        const userId = parseInt(req.params.userId);
        //Id of user performing the update
        const inputUserId = req.body.id;
        console.log(`UserId stated in the path parameters: ${userId}, by Current user ID: ${inputUserId}.`);

        DBConnection.getConnection((error1, Connection) => {
            Connection.query('SELECT id FROM user WHERE id = ?;', [userId], (err1, result, fields) => {
                const userResult = result.length;
                Connection.release();
                try {
                    assert(userResult != 0, 'User does not exist.');
                    assert(result[0].id == inputUserId, 'Cannot edit user, it is not owned by the performing user.');
                    next();
                } catch (error) {
                    const err = {
                        status: 400,
                        message: error.message,
                        error_Specific: error
                    }
                    next(err);
                }
            })
        })

    }
    ,
    //Assists UC-206//
    checkOwnershipUser: (req, res, next) => {
        const userId = parseInt(req.params.userId);
        const inputUserId = req.body.id;
        console.log('UC-206 Check ownership user and existence');
        console.log(`ID of user is ${userId}.`);

        DBConnection.getConnection((err2, Connection) => {
            Connection.query('SELECT * FROM user WHERE id = ?;', [userId], (err3, result) => {
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
                            status: 400,
                            message: error.message
                        }
                    } else {
                        err = {
                            status: 401,
                            message: error.message
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
        let { firstName, lastName, street, city, email, password, phoneNumber } = User;
        let emailValid = emailRegex.test(email);
        let passwordValid = passwordRegex.test(password);
        //let {firstName,...other(Mag zelf bedacht worden) } = User;
        //Other in dit geval is het object en de attribuut firstname is weggelaten in het object
        console.log('Check inputvalidation');
        try {
            assert(typeof firstName == 'string', 'Title must be a string');
            assert(typeof lastName == 'string', 'LastName must be a string');
            assert(typeof city == 'string', 'City must be a string');
            assert(typeof street == 'string', 'Street must be a string');
            assert(typeof email == 'string', 'email must be a string');
            assert(typeof password == 'string', 'password must be a string');
            assert(emailValid, 'Emailadress is invalid. Correct email-format: (at least one character or digit)@(atleast one character or digit).(domain length is either 2 or 3 characters long)');
            assert(passwordValid, 'at least one lowercase character, at least one UPPERCASE character, at least one digit and at least 8 characters long');
            next();
        } catch (err) {
            const error = {
                status: 400,
                message: err.message
            };
            next(error);
        }
    },
    validateUserPost: (req, res, next) => {
        let User = req.body.user;
        console.log(User);
        let { firstName, lastName, street, city, isActive, email, password, phoneNumber } = User;
        console.log('Check update user update');
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
                message: err.message
            };
            next(error);
        }
    },
    //UC-201 Creates user.s 
    createUser: (req, res) => {
        console.log('UC-201 User creation');
        let user = req.body;
        console.log(user);
        DBConnection.getConnection((err, connect) => {
            connect.promise()
                .query(
                    'INSERT INTO user (firstName, lastName, street, city, phoneNumber, emailAdress, password) VALUES(?, ?, ?, ?, ?, ?, ?);',
                    [user.firstName, user.lastName, user.street, user.city, user.phoneNumber, user.email, user.password])
                .then(() => {
                    connect.promise()
                        .query('SELECT * FROM user WHERE emailAdress = ?', [user.email])
                        .then(([results]) => {
                            console.log(`User with ${user.email} has been found.`);
                            //Token generation in development
                            console.log(results[0]);
                            res.status(201).json({
                                status: 201,
                                message: `User has been registered.`,
                                user: results[0]
                            })
                        }).finally(() => {
                            connect.release();
                        })
                }).catch(err => {
                    console.log(err);
                    connect.release();
                    res.status(409).json({
                        status: 409,
                        message: "Email has been taken"
                    })
                })
        })
    }
    ,
    //UC-202 Retrieves all users
    //amount=? query parameters
    //active or inactive query parameters
    getAllUsers: (req, res) => {
        console.log('UC-202 Retrieval users');
        const active = req.query.isActive;
        const searchTerm = req.query.searchTerm;
        const limit = req.query.amount;
        let booleanValue = 0;
        if (active != undefined && active == 'true') {
            booleanValue = 1;
        }
        console.log(booleanValue)

        let query = "SELECT * FROM user";
        let inserts = [];
        console.log(`Active is ${active}`);
        console.log(`Searchterm is ${searchTerm}`)
        console.log(`Limit is ${limit}`)

        if (active != undefined && searchTerm != undefined && limit != undefined) {
            query += (` WHERE isActive = ? AND firstName LIKE %?% OR lastName LIKE %?% LIMIT ?;`)
            inserts = [booleanValue, searchTerm, searchTerm, limit];
            query = mysql.format(query, inserts);
            console.log(query);
        } else if (active != undefined && searchTerm != undefined) {
            query += ` WHERE isActive = ? AND firstName LIKE '%?%' OR lastName LIKE '%?%';`
            inserts = [booleanValue, searchTerm, searchTerm];
            query = mysql.format(query, inserts);
            console.log(query);
        } else if (searchTerm != undefined && limit != undefined) {
            query += ` WHERE firstName LIKE '%?%' OR lastName LIKE '%?%' LIMIT ?;`
            inserts = [searchTerm, searchTerm, limit];
            query = mysql.format(query, inserts);
            console.log(query);
        } else if (limit != undefined) {
            query += ` LIMIT ${limit};`
            console.log(query);
        } else if (active != undefined) {
            query += ` WHERE isActive = ${booleanValue};`
            console.log(query);
        } else if (searchTerm != undefined) {
            query += ` WHERE firstName LIKE '%${searchTerm}%' OR lastName LIKE '%${searchTerm}%';`
            console.log(query);
        }
        DBConnection.getConnection((error, connection) => {
            connection
                .promise()
                .query(query)
                .then(([result, fields]) => {
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
                }).finally(() => {
                    connection.release();
                })
        })
    },
    //UC-203 Retrieve user profile, based on Token and userID
    //Token functionality has not been developed - in process
    getProfile: (req, res) => {
        console.log('UC-203 Profile');
        //Token, still empty
        res.status(401).json({
            status: 401,
            message: "Correct token functionality has not been implemented",
        })
    }
    ,
    //UC-204 Retrieves user, based on userId
    retrieveUserById: (req, res) => {
        console.log('UC-204 Retrieve user');
        const userId = req.params.userId;
        let user = null;
        let results = null;
        DBConnection.getConnection((error, connect) => {
            connect.promise().query('SELECT * FROM user WHERE id = ?;', [userId])
                .then(([result, fields]) => {
                    console.log(`Length of result is ${result.length}`);
                    console.log(result[0]);
                    results = result;
                }).then(connect.promise()
                    .query('SELECT * FROM meal WHERE cookId = ?;', [userId])
                    .then(([meal]) => {
                        if (results.length > 0) {
                            user = results[0];
                            user.isActive = intToBoolean(user.isActive);
                            user.roles = user.roles.split(",");
                            meal.forEach(meal => {
                                meal.isActive = intToBoolean(meal.isActive);
                                meal.isToTakeHome = intToBoolean(meal.isToTakeHome);
                                meal.isVega = intToBoolean(meal.isVega);
                                meal.isVegan = intToBoolean(meal.isVegan);
                                meal.allergenes = meal.allergenes.split(",");
                            });
                            user.Own_meals = meal;
                            console.log(user);
                            res.status(200).json({
                                status: 200,
                                message: `User with id: ${userId} found`,
                                user: user
                            })
                        } else {
                            res.status(404).json({
                                status: 404,
                                message: `User with id: ${userId} does not exist. Retrieval has failed.`
                            })
                        }
                    }).then(() => {
                        connect.release();
                    }))
        })
    }
    ,
    //UC-205 Edits user.
    updateUser: (req, res) => {
        console.log('UC-205 Edit user');
        const id = parseInt(req.params.userId);
        let newUser = req.body.user;
        let activeValue = 0;
        if (newUser.isActive) {
            activeValue = 1;
        }
        console.log(`UserID of ${newUser.firstName} is ${id}.`)
        DBConnection.getConnection((error, connection) => {
            connection.promise()
                .query('UPDATE user SET firstName = ?, lastName = ?, city = ?, street = ?, password = ?, emailAdress = ?, isActive = ?, phoneNumber = ? WHERE id = ?;',
                    [newUser.firstName, newUser.lastName, newUser.city, newUser.street, newUser.password, newUser.email, activeValue, newUser.phoneNumber, id])
                .then(([result]) => {
                    console.log(`Affected rows UPDATE: ${result.affectedRows}`);
                    if (result.affectedRows == 0) {
                        res.status(404).json({
                            status: 404,
                            message: `Update has failed. Id: ${id} does not exist.`
                        })
                    } else {
                        connection.query('SELECT * FROM user WHERE id =?;', [id], (err4, result2) => {
                            if (err4) { throw err4 }
                            console.log(result2);
                            result2[0].isActive = (result2[0].isActive == 1);
                            result2[0].roles = result2[0].roles.split(",")
                            res.status(200).json({
                                status: 200,
                                message: "Succesful transaction",
                                updatedUser: result2[0]
                            })
                        })
                    }
                }).finally(() => {
                    connection.release();
                })
        })
    }
    ,
    //UC-206 Deletes user based on id
    deleteUser: (req, res) => {
        console.log('UC-206 Remove user');
        const iD = req.params.userId
        DBConnection.getConnection((error, conn) => {
            conn.promise()
                .query('DELETE FROM user  WHERE id = ?;', [iD])
                .then(([result]) => {
                    console.log('Ronde deletion');
                    console.log(result.affectedRows);
                    if (result.affectedRows > 0) {
                        res.status(200).json({
                            status: 200,
                            message: `User with user with Id ${iD}, has been removed.`,
                            CurrentUsers: dataSet.userData
                        })
                    } else {
                        res.status(400).json({
                            status: 400,
                            message: `Removal has failed. Id ${iD} has either been removed or does not exist`
                        })
                    }
                }).finally(() => {
                    conn.release();
                })
        })
    }
}

function intToBoolean(int){
    return (int == 1);
}
module.exports = controller;