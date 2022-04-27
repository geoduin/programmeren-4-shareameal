const req = require("express/lib/request");
const assert = require('assert');
const dataSet= require('../data/data.inMemory');

//Note: Due to the dummydata present within the in-memory database(in case of testing), the id will start at 2 instead of 0.
let id = 2;

let controller = {
    validateUserPost: (req, res, next)=>{
        let User = req.body;
        let {firstName, lastName, street, city, isActive, email, password, phoneNumber} = User;

        //let {firstName,...other(Mag zelf bedacht worden) } = User;
        //Other in dit geval is het object en de attribuut firstname is weggelaten in het object
        try {
            assert(typeof firstName == 'string','Title must be a string');
            assert(typeof lastName == 'string','LastName must be a string');
            assert(typeof city == 'string','City must be a string');
            assert(typeof street == 'string','Street must be a string');
            assert(typeof isActive == 'boolean','isActive must be a boolean');
            assert(typeof email == 'string','email must be a string');
            assert(typeof password == 'string','password must be a string');
            assert(typeof phoneNumber == 'string','phoneNumber must be a string');
            next();
        } catch (err) {
            const error= {
                status: 400,
                result: err.message
            };
            next(error);
        }
    },
    //UC-201 Creates user. 
    addUser: (req, res) => {
        let newUser = req.body;
        const newUserEmail = req.body.email;
        let amount = dataSet.userData.filter((item) => item.email == newUserEmail);
        console.log(`Email: ${newUserEmail}, has ${amount.length} results.`);
        if (amount.length == 0) {
            id++;
            let isActive = assignDefaultValues(newUser.isActive);
            let phoneNumber = assignDefaultValues(newUser.phoneNumber);
            newUser = { id, ...newUser, isActive, phoneNumber }
            console.log(newUser);
            dataSet.userData.push(newUser);
            res.status(201).json({
                status: 201,
                result: `User has been registered.`,
                user: newUser
            })
        } else {
            console.log(`User with email: ${newUserEmail}, has already been registered`);
            res.status(406).json({
                status: 406,
                result: `Email has been taken`
            })
        }


    }
    ,
    //UC-202 Retrieves all users
    getAllUsers: (req, res) => {
        console.log(dataSet.userData);
        res.status(200).json({
            status: 200,
            result: dataSet.userData,
        })
    }
    ,
    //UC-203 Retrieve user profile, based on Token and userID
    //Token functionality has not been developed - in process
    getProfile: (req, res) => {
        //Token, still empty
        res.status(401).json({
            status: 401,
            result: "Failed profile retrieval",
            note: "Correct token functionality has not been implemented"
        })
    }
    ,
    //UC-204 Retrieves user, based on userId
    retrieveUserById: (req, res) => {
        const userId = req.params.userId;
        console.log(`Movie met ID ${userId} gezocht`);
        let user = dataSet.userData.filter((item) => item.id == userId);
        if (user.length > 0) {
            console.log(user);
            res.status(202).json({
                status: 202,
                answer: `User with id: ${userId} found`,
                result: user
            })
        } else {
            res.status(404).json({
                status: 404,
                result: `User with id: ${userId} does not exist. Retrieval has failed.`
            })
        }
    }
    ,
    //UC-205 Edits user.
    updateUser: (req, res) => {
        const userId = req.params.userId;
        const newUser = req.body;
        console.log(`UserID of ${newUser.firstName} is ${userId}. User in question is ${newUser}`)
        //Filters the array, based on userId. If the input userId is found in the in-memory database, 
        //it will return 1. otherwise it will return 0
        let user = dataSet.userData.filter((users) => users.id == userId);
        console.log(`Amount of users are: ${user.length}`)
        if (user.length > 0) {
            let oldUser = user.at(0);
            console.log(`Old: ${oldUser}`)
            //Assigns values to object
            oldUser.firstName = newUser.firstName;
            oldUser.lastName = newUser.lastName;
            oldUser.city = newUser.city;
            oldUser.street = newUser.street;
            oldUser.password = newUser.password;
            //If the new email has already been taken(and thus is not equal to 0), it will not change the emailaddress
            if (emailValidation(newUser.email) == 0) {
                oldUser.email = newUser.email;
            }
            oldUser.isActive = assignDefaultValues(newUser.isActive);
            oldUser.phoneNumber = assignDefaultValues(newUser.phoneNumber);
            console.log(`New: ${oldUser}.`)
            res.status(200).json({
                status: 200,
                result: "Succesful transaction",
                updatedUser: oldUser
            })
        } else {
            res.status(404).json({
                status: 404,
                result: `Update has failed. Id: ${userId} does not exist.`
            })
        }
    }
    ,
    //UC-206 Deletes user based on id
    deleteUser: (req, res) => {
        const iD = req.params.userId
        let nr = dataSet.userData.findIndex((usr) => usr.id == iD);
        console.log(`Index of UserID: ${iD} is ${nr}.`);
        if (nr != -1) {
            dataSet.userData.splice(nr, 1);
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
    }
}


function emailValidation(email) {
    const amount = dataSet.userData.filter((user) => user.email == email);
    console.log(`amount is: ${amount.length}`);
    return amount;
}

//A function that will assign a default value, in case the newValue is undefined. Otherwise it will return the original value
function assignDefaultValues(newValue) {
    if (newValue != undefined) {
        return newValue;
    } else {
        return "";
    }
}

module.exports = controller;