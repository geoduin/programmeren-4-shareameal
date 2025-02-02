const assert = require('assert');
const DBConnection = require("../data/dbConnection");
const jwt = require('jsonwebtoken');
const secretKey = require('../config/config').jwtSecretKey;
const logr = require('../config/config').logger;
const BCrypt = require('bcrypt');
const DQuery = require('../data/queryList');
const utill = require('./general.controller');
//Regex for email
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
//Regex for phones - every phonenumber must start with 06 or 31 and has either a space sign, - or nothing in between, and then 9 digits
const phoneRegex = /(06)(\s|\-|)\d{8}|31(\s6|\-6|6)\d{8}/;
//Regex for passwords - at least one lowercase character, at least one UPPERCASE character, at least one digit and at least 8 characters long
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

let controller = {
    //Assists UC-205, 
    checkUserExistenceAndOwnership: (req, res, next) => {
        console.log('UC-205 Check ownership and existence');
        const userId = parseInt(req.params.userId);
        //Id of user performing the update
        const token = req.headers.authorization;
        let package = jwt.decode(token.substring(7, token.length));
        const ownerUserId = package.id;
        logr.trace(`UserId stated in the path parameters: ${userId}, by Current user ID: ${ownerUserId}.`);

        DBConnection.getConnection((error1, Connection) => {
            Connection.query('SELECT id FROM user WHERE id = ?;', [userId], (err1, result, fields) => {
                if (err1) throw err1;
                const userResult = result.length;
                Connection.release();
                try {
                    assert(userResult != 0, 'User does not exist.');
                    assert(result[0].id == ownerUserId, 'Cannot edit user, it is not owned by the performing user.');
                    next();
                } catch (error) {
                    const err = {
                        status: 400,
                        message: error.message
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
        const auth = req.headers.authorization;
        const token = auth.substring(7, auth.length);
        const decoder = jwt.decode(token);
        const currentId = decoder.id;
        logr.trace(`ID of user is ${userId}.`);

        DBConnection.getConnection((err2, Connection) => {
            Connection.query(DQuery.selectUserId, [userId], (err3, result) => {
                Connection.release();
                let aa = result.length;
                //assert(aa != 0, 'User is not found')
                try {
                    logr.trace(aa);
                    assert(aa > 0, 'User does not exist');
                    let ID = result[0].id;
                    logr.trace(currentId);
                    assert(ID == currentId, `This user does not own user with ID ${userId}`)
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
                            status: 403,
                            message: error.message
                        }
                    }
                    next(err);
                }
            })
        })

    }
    ,
    //Assists UC-201 - Checks if user already exists.
    checkUserExistence: (req, res, next) => {
        const userEmail = req.body.emailAdress;
        DBConnection.getConnection((err, con) => {
            con.promise()
                .query(DQuery.selectEmailCount, [userEmail])
                .then(([result]) => {
                    logr.trace(result[0]);
                    if (result[0].amount == 0) {
                        logr.trace("Clean, go to insert method");
                        next();
                    } else {
                        const err = {
                            status: 409,
                            message: "Email has been taken"
                        }
                        next(err);
                    }
                }).finally(() => {
                    con.release();
                })
        })
    }
    ,
    //Assists UC-201 - Checks if inputvalidations are correct
    validateUserRegistration: (req, res, next) => {
        let User = req.body;
        let { firstName, lastName, street, city, emailAdress, password, phoneNumber } = User;
        let emailValid = emailRegex.test(emailAdress);
        let passwordValid = passwordRegex.test(password);
        let phoneNumberValid = phoneRegex.test(phoneNumber);
        //let {firstName,...other(Mag zelf bedacht worden) } = User;
        //Other in dit geval is het object en de attribuut firstname is weggelaten in het object
        logr.trace(User);
        logr.trace("Check input validation")
        try {
            assert(typeof firstName == 'string', 'Firstname must be filled in.');
            assert(typeof lastName == 'string', 'LastName must filled in.');
            assert(typeof city == 'string', 'City must be filled in');
            assert(typeof street == 'string', 'Street must be filled in');
            assert(typeof emailAdress == 'string', 'emailadress must be filled in');
            assert(typeof password == 'string', 'password must be filled in');
            assert(emailValid, 'Emailadress is invalid. Correct email-format: (at least one character or digit)@(atleast one character or digit).(domain length is either 2 or 3 characters long)');
            assert(passwordValid, 'at least one lowercase character, at least one UPPERCASE character, at least one digit and at least 8 characters long');
            assert(phoneNumberValid, 'Invalid phonenumber')
            logr.info("Input is valid");
            next();
        } catch (err) {
            logr.error(`${err.message}`);
            const error = {
                status: 400,
                message: err.message
            };
            next(error);
        }
    },
    //Assists UC-205
    validateUserPost: (req, res, next) => {
        let User = req.body;
        logr.trace(User);
        let { firstName, lastName, street, city, isActive, emailAdress, password, phoneNumber } = User;
        let phoneValid = phoneRegex.test(phoneNumber);
        let emailValid = emailRegex.test(emailAdress);
        let passwordValid = passwordRegex.test(password);
        logr.debug(`Phone: ${phoneValid} email: ${emailValid} password: ${passwordValid}`);
        //let {firstName,...other(Mag zelf bedacht worden) } = User;
        //Other in dit geval is het object en de attribuut firstname is weggelaten in het object
        try {
            assert(typeof firstName == 'string', 'Firstname must be filled in');
            assert(typeof lastName == 'string', 'LastName must be filled in');
            assert(typeof city == 'string', 'City must be filled in');
            assert(typeof street == 'string', 'Street must be filled in');
            assert(typeof emailAdress == 'string', 'email must be filled in');
            assert(typeof password == 'string', 'password must be filled in');
            assert(typeof phoneNumber == 'string', 'phoneNumber must be filled in');
            assert(phoneValid, 'Invalid phonenumber')
            assert(emailValid, 'Emailadress is invalid. Correct email-format: (at least one character or digit)@(atleast one character or digit).(domain length is either 2 or 3 characters long)');
            assert(passwordValid, 'at least one lowercase character, at least one UPPERCASE character, at least one digit and at least 8 characters long');
            logr.info("Input is valid");
            next();
        } catch (err) {
            const error = {
                status: 400,
                message: err.message
            };
            logr.error(error);
            next(error);
        }
    },
    //UC-201 Creates user.s 
    createUser: (req, res) => {
        logr.info('UC-201 User creation');
        let user = req.body;
        logr.info("User input has started");
        BCrypt.hash(user.password, 9).then((hashedPassword) => {
            DBConnection.getConnection((err, connect) => {
                connect.promise().query(DQuery.insertNewUser,
                    [user.firstName, user.lastName, user.street, user.city, 
                        user.phoneNumber, user.emailAdress, hashedPassword])
                    .then(connect.promise()
                        .query(DQuery.selectUserEmail, [user.emailAdress])
                        .then(([results]) => {
                            logr.trace(`User with ${user.emailAdress} has been found.`);
                            logr.trace(results[0]);
                            let User = results[0];
                            const payLoad = { id: User.id };
                            jwt.sign(payLoad, secretKey, { expiresIn: '3d' }, (err, token) => {
                                connect.release();
                                User = { ...User, token };
                                User = utill.userCookCorrectFormat(User);
                                logr.trace("User registered");
                                res.status(201).json({
                                    status: 201,
                                    message: `User has been registered.`,
                                    result: User
                                })
                            })
                        })
                    ).catch(err => {
                        logr.error(`User already exist`);
                        connect.release();
                        res.status(409).json({
                            status: 409,
                            message: "Email has been taken"
                        })
                    })
            })
        })
    }
    ,
    //UC-202 Retrieves all users
    //amount=? query parameters
    //active or inactive query parameters
    getAllUsers: (req, res) => {
        logr.info('UC-202 Retrieval users');
        const active = req.query.isActive;
        const searchTerm = req.query.firstName;
        const limit = parseInt(req.query.limit);
        let booleanValue = 0;
        if (active != undefined && active == 'true') {
            booleanValue = 1;
        }
        logr.trace(booleanValue)

        let query = "SELECT * FROM user";
        let inserts = [];
        logr.trace(`Active is ${active} + Searchterm is ${searchTerm} + Limit is ${limit}`);

        if (active && searchTerm) {
            query += ` WHERE isActive = ? AND firstName LIKE('%${searchTerm}%')`
            inserts = [booleanValue];
        } else if (active) {
            query += ` WHERE isActive = ?`
            inserts = [booleanValue];
        } else if (searchTerm) {
            query += ` WHERE firstName LIKE('%${searchTerm}%')`;
        }

        if (limit) {
            query += ' LIMIT ?';
            inserts.push(limit);
        }
        query += ';'
        logr.debug(query);
        DBConnection.getConnection((error, connection) => {
            connection
                .promise()
                .query(query, inserts)
                .then(([result, fields]) => {
                    let roles = [];
                    result.forEach(user => {
                        utill.userCookCorrectFormat(user);
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
    //UC-203 Retrieve user profile, based on Token and the userId within.
    getProfile: (req, res) => {
        logr.info('UC-203 Profile');
        //Decodes jwt token
        let package = utill.decodeToken(req.headers.authorization);
        //ID of token.
        let id = package.id;
        DBConnection.getConnection((err, con) => {
            con.promise()
                .query(DQuery.selectUserId, [id])
                .then(([result]) => {
                    const user = result[0];
                    logr.debug(user);
                    if (result.length > 0) {
                        res.status(200).json({
                            status: 200,
                            result: {
                                id: user.id,
                                firstName: user.firstName,
                                lastName: user.lastName,
                                emailAdress: user.emailAdress,
                                password: user.password,
                                phoneNumber: user.phoneNumber,
                                street: user.street,
                                city: user.city,
                                roles: user.roles.split(","),
                                isActive: (user.isActive == 1)
                            }
                        })
                    } else {
                        res.status(400).json({
                            status: 400,
                            message: 'Invalid token'
                        })
                    }

                }).then(() => {
                    con.release();
                })
        })
    }
    ,
    //UC-204 Retrieves user, based on userId
    retrieveUserById: (req, res) => {
        logr.info('UC-204 Retrieve user');
        const userId = req.params.userId;
        let user = null;
        let results = null;
        DBConnection.getConnection((error, connect) => {
            connect.promise().query(DQuery.selectUserId, [userId])
                .then(([result, fields]) => {
                    logr.trace(`Length of result is ${result.length}`);
                    logr.trace(result[0]);
                    results = result;
                }).then(connect.promise()
                    .query(DQuery.selectMealCook, [userId])
                    .then(([meal]) => {
                        if (results.length > 0) {
                            user = utill.userCookCorrectFormat(results[0]);
                            meal.forEach(meal => {
                                utill.mealCorrectFormat(meal);
                            });
                            user.Own_meals = meal;
                            logr.trace(user);
                            res.status(200).json({
                                status: 200,
                                message: `User with id: ${userId} found`,
                                result: user
                            })

                        }
                        //If user does not exist 
                        else {
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
        logr.info('UC-205 Edit user');
        const id = parseInt(req.params.userId);
        //Body with user information
        let newUser = req.body;
        let activeValue = 0;
        if (newUser.isActive) {
            activeValue = 1;
        }
        //NOTE: is assumes the user will put in a new password. 
        //If the user updates the user information without changing the password, 
        //it will hash the old hash and the new password of that user is the hash string.
        logr.trace(`UserID of ${newUser.firstName} is ${id}.`)
        BCrypt.hash(newUser.password, 9).then((updatedHashpassword) => {
            DBConnection.getConnection((error, connection) => {
                connection.promise()
                    .query(DQuery.updateUser,
                        [newUser.firstName, newUser.lastName, newUser.city,
                        newUser.street, updatedHashpassword, newUser.emailAdress,
                            activeValue, newUser.phoneNumber, id])
                    .then(([result]) => {
                        logr.trace(`Affected rows UPDATE: ${result.affectedRows}`);
                        if (result.affectedRows == 0) {
                            res.status(400).json({
                                status: 400,
                                message: `Update has failed. Id: ${id} does not exist.`
                            })
                        } else {
                            connection.query(DQuery.selectUserId, [id], (err4, result2) => {
                                if (err4) { throw err4 }
                                logr.trace(result2);
                                result2[0].isActive = (result2[0].isActive == 1);
                                result2[0].roles = result2[0].roles.split(",")
                                res.status(200).json({
                                    status: 200,
                                    message: "Succesful transaction",
                                    result: result2[0]
                                })
                            })
                        }
                    }).finally(() => {
                        connection.release();
                    })
            })
        })


    }
    ,
    //UC-206 Deletes user based on id
    deleteUser: (req, res) => {
        logr.info('UC-206 Remove user');
        const iD = req.params.userId
        DBConnection.getConnection((error, conn) => {
            conn.promise()
                .query(DQuery.deleteUserAndRelated, [iD, iD])
                .then(([result]) => {
                    logr.trace('Ronde deletion');
                    logr.trace(result.affectedRows);
                    if (result[1].affectedRows > 0) {
                        res.status(200).json({
                            status: 200,
                            message: `User with user with Id ${iD}, has been removed.`,
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

module.exports = controller;