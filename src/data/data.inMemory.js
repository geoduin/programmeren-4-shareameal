

let dataSet = {
    userData: [
        {
            id: 0,
            firstName: "Xin",
            lastName: "Wang",
            city: "Rotterdam",
            street: "Moskouplein",
            email: "Xin20Wang@outlook.com",
            password: "NoPassword123",
            isActive: true,
            phoneNumber: "06 12425475"
        }, {
            id: 1,
            firstName: "Wessel",
            lastName: "Pijpers",
            city: "Alphen aan de Rhijn",
            street: "Alphen",
            email: "Wessel@outlook.com",
            password: "NoPassword456",
            isActive: true,
            phoneNumber: "06 12425475"
        }, {
            id: 2,
            firstName: "Brian",
            lastName: "Thomson",
            city: "Rotterdam",
            street: "Beurs",
            email: "BrieThom@outlook.com",
            password: "NoPassword789",
            isActive: true,
            phoneNumber: "06 12425475"
        }
    ],
    mealData: [
        {
            name: "Patat",
            description: "Gefrituurde aardappelen, gesneden in dunne kleine stukken.",
            isActive: true,
            isVega: true,
            isVegan: true,
            isToTakeHome: false,
            dateTime: "2022-04-27T15:38:30.394Z",
            imageUrl: "https://miljuschka.nl/wp-content/uploads/2021/02/Pasta-bolognese-3-2.jpg",
            allergenes: ["gluten", "noten", "lactose"],
            maxAmountOfParticipants: 6,
            price: 6.75,
            id: 0,
            cook: 2,
            createDate: "2022-04-27T15:44:19.615Z",
            updateDate: "2022-04-27T15:44:19.615Z",
            participants: [{
                id: 0,
                firstName: "Xin",
                lastName: "Wang",
                city: "Rotterdam",
                street: "Moskouplein",
                email: "Xin20Wang@outlook.com",
                password: "NoPassword123",
                isActive: true,
                phoneNumber: "06 12425475"
            }
                ,
            {
                id: 2,
                firstName: "Brian",
                lastName: "Thomson",
                city: "Rotterdam",
                street: "Beurs",
                email: "BrieThom@outlook.com",
                password: "NoPassword789",
                isActive: true,
                phoneNumber: "06 12425475"
            }]
        }
    ],
}

module.exports = dataSet;