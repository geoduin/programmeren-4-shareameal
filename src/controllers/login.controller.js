const req = require("express/lib/request");
const data = require('../data/data.inMemory');

let controller = {
    login: (req, res) => {
        const userEmail = req.body.email;
        const userPassWord = req.body.password;
        console.log(`Email ${userEmail} and password ${userPassWord}`);
        let userIndex = data.userData.findIndex((user) => user.email == userEmail && user.password == userPassWord);
        console.log(`Index of ${userEmail} is:  ${userIndex}`);

        if (userIndex != -1) {
            let User = data.userData[userIndex];
            console.log(User);
            //Placeholder function to generate token
            const token = generateToken();
            User = { User, token }
            res.status(200).json({
                status: 200,
                result: User
            })
        } else {
            res.status(400).json({
                status: 400,
                result: "Login failed"
            })
        }
    }
}


//Function to generate a token. Has yet to be developed. Currently has a placeholder return value - in process
function generateToken() {
    return "YouHaveAccessToken";
}
module.exports = controller;