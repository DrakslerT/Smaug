//Dependencies
var dictionary = require('./Dictionary');

var data = {
    bills: true,
    fileName: 'bills',
    message: dictionary.getTranslation("messageBills"),
    welcomeMessage: dictionary.getTranslation("welcomeMessageBills"),
    bill: [{
            id: 0,
            year: 2020,
            month: 'DEC',
            day: 10,
            category: 'Cat',
            recipient: 'Meow d.o.o.',
            value: '80',
            currency: '€'
        },
        {
            id: 1,
            year: 2020,
            month: 'DEC',
            day: 09,
            category: 'Gas',
            recipient: 'Petrol d.d',
            value: '500',
            currency: '€'
        },
        {
            id: 2,
            year: 2020,
            month: 'DEC',
            day: 09,
            category: 'Groceries',
            recipient: 'Mercator',
            value: '200',
            currency: '€'
        }
    ],
    card: [{
            id: 1,
            title: 'Bills Total',
            color: 'bg-primary',
            count: 2,
            icon: 'fa-paperclip'
        },
        {
            id: 2,
            title: 'Bills This Week',
            color: 'bg-warning',
            count: 1,
            icon: 'fa-calendar',
            comment: "January 25: Petrol $80"
        }
    ],
    categories: [
        { id: 1, category: "Furniture" },
        { id: 2, category: "Electronics" },
        { id: 3, category: "Trip" },
        { id: 4, category: "Party" },
        { id: 5, category: "Wedding" },
        { id: 6, category: "Car" },
        { id: 7, category: "Gas" },
        { id: 8, category: "Other" },
    ],
    //translations main
    logout: dictionary.getTranslation("logout"),
    //translations navbar
    DASHBOARD: dictionary.getTranslation("DASHBOARD"),
    ENVELOPES: dictionary.getTranslation("ENVELOPES"),
    GOALS: dictionary.getTranslation("GOALS"),
    BILLS: dictionary.getTranslation("BILLS"),
    HISTORY: dictionary.getTranslation("HISTORY"),
    UTILITIES: dictionary.getTranslation("UTILITIES"),
    user: dictionary.getTranslation("user"),
    settings: dictionary.getTranslation("settings"),
    appearance: dictionary.getTranslation("appearance"),
    light: dictionary.getTranslation("light"),
    dark: dictionary.getTranslation("dark")
};

function respond(res, session) {
    if (session.user) {
        res.render('bills', data);
    } else {
        res.redirect('/');
    }
}

module.exports = {
    get: function(req, res) {
        respond(res, req.session);
    }
}