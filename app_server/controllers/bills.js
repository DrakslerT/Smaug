//Dependencies
var dictionary = require('./Dictionary');
var Client = require('node-rest-client').Client;

var data = {
    bills: true,
    fileName: 'bills'
};

var translationKeys = {
    message: "messageBills",
    welcomeMessage: "welcomeMessageBills",
    //translations main
    logout: "logout",
    //translations navbar
    DASHBOARD: "DASHBOARD",
    ENVELOPES: "ENVELOPES",
    GOALS: "GOALS",
    BILLS: "BILLS",
    HISTORY: "HISTORY",
    UTILITIES: "UTILITIES",
    user: "user",
    settings: "settings",
    appearance: "appearance",
    light: "light",
    dark: "dark"
}

function translate(language) {
    var translatedKeys = JSON.parse(JSON.stringify(translationKeys));
    Object.keys(translationKeys).forEach(function(key) {
        translatedKeys[key] = dictionary.getTranslation(translatedKeys[key], language);
    });
    return translatedKeys;
}

function respond(res, session) {
    if (session.user) {
        if (session.user.language) {
            data = {...data, ...translate(session.user.language) };
        } else {
            data = {...data, ...translationKeys };
        }
        data.categories = session.user.categories;
        data.card = generateCards(session.user.bills);
        data.bill = generateBills(session.user.bills);
        data.currency = session.user.defaultCurrency;
        res.render('bills', data);
    } else {
        res.redirect('/');
    }
}

function parseRequestBody(req, res, session) {
    switch (req.body.formType) {
        case 'addBill':
            {
                addBill(req, res, session);
                break;
            }
        case 'editBill':
            {
                editBill(req, res, session);
                break;
            }
        case 'deleteBill':
            {
                deleteBill(req, res, session);
                break;
            }
    }
}


function addBill(req, res, session) {
    const data = {
        inputCategory: req.body.inputCategory,
        Payee: req.body.Payee,
        Amount: req.body.Amount,
        inputDateAddBill: req.body.inputDateAddBill,
        rad: req.body.rad,
        id: session.user._id
    }

    var args = {
        data: data,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    };

    var client = new Client();
    client.post("http://" + req.headers.host + "/api/addBill", args,
        function(data, response) {
            if (response.statusCode == 200) {
                res.session = session;
                res.session.user = data;
                res.redirect('/bills');
            } else {
                res.redirect('/bills#error');
            }
        }
    );
}

function editBill(req, res, session) {
    const data = {
        billId: req.body.billId,
        inputCategory: req.body.inputCategory,
        payee: req.body.Payee2,
        amount: req.body.Amount2,
        date: req.body.inputDate,
        repeat: req.body.radio,
        id: session.user._id
    }

    var args = {
        data: data,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    };

    var client = new Client();
    client.post("http://" + req.headers.host + "/api/editBill", args, function(data, response) {
        if (response.statusCode == 200) {
            res.session = session;
            res.session.user = data;
            res.redirect('/bills');
        } else {
            res.redirect('/bills#error');
        }
    });
}

function deleteBill(req, res, session) {
    const data = {
        bill_id: req.body.id,
        user_id: session.user._id
    }

    var args = {
        data: data,
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    };


    var client = new Client();
    client.post("http://" + req.headers.host + "/api/deleteBill", args, function(data, response) {
        if (response.statusCode == 200) {
            res.session = session;
            res.session.user = data;
            res.redirect('/bills');
        } else {
            res.redirect('/bills#error');
        }
    });

}

function translateMonth(month) {
    switch (month) {
        case '01':
            return "JAN";
        case '02':
            return "FEB";
        case '03':
            return "MAR";
        case '04':
            return "APR";
        case '05':
            return "MAY";
        case '06':
            return "JUN";
        case '07':
            return "JUL";
        case '08':
            return "AUG";
        case '09':
            return "SEP";
        case '10':
            return "OCT";
        case '11':
            return "NOV";
        case '12':
            return "DEC";
    }
}

function generateBills(bills) {
    var billsArray = []
    for (var bill of bills) {
        var date = bill.date.split('T')[0].split('-');

        billsArray.push({
            _id: bill._id,
            year: date[0],
            month: date[1],
            monthName: translateMonth(date[1]),
            day: date[2],
            category: bill.category.name,
            recipient: bill.recipient,
            value: bill.value,
            currency: bill.currency,
            repeat: bill.repeating
        });
    }
    billsArray.sort(compare)
    return billsArray;
}

function compare(a, b) { //1 menjava, -1 ni menjava
    if (a.year < b.year) {
        return 1;
    } else if (a.year == b.year) {
        if (a.month < b.month) {
            return 1;
        } else if (a.month == b.month) {
            if (a.day < b.day) {
                return 1;
            } else {
                return -1;
            }
        } else {
            return -1;
        }
    } else {
        return -1;
    }
    return 0;
}

function generateCards(bills) {
    const nearBills = getBillsInTheNext7Days(bills);
    return [{
            id: 1,
            title: 'Bills Total',
            color: 'bg-primary',
            count: bills.length,
            icon: 'fa-paperclip'
        },
        {
            id: 2,
            title: 'Bills This Week',
            color: 'bg-warning',
            count: nearBills.length,
            icon: 'fa-calendar',
            comment: generateComment(nearBills)
        }
    ];
}

function getBillsInTheNext7Days(bills) {
    const currentTime = new Date();
    var billsArray = [];

    for (var bill of bills) {
        const billDate = new Date(Date.parse(bill.date)).getTime();
        const diff = (billDate - currentTime.getTime()) / 86400000;

        if (diff < 7) {
            billsArray.push(bill);
        }
    }
    return billsArray;
}

function findClosestBill(bills) {
    var nearestBill = null;
    const currentTime = new Date();

    var minDiff = null
    for (var bill of bills) {
        const billDate = new Date(Date.parse(bill.date)).getTime();
        const diff = (billDate - currentTime.getTime());

        if (!minDiff || diff < minDiff) {
            minDiff = diff;
            nearestBill = bill;
        }
    }

    return nearestBill
}

function generateComment(bills) {
    var comment = '';

    var bill = findClosestBill(bills);
    if (!bill) return comment;
    const billDate = new Date(Date.parse(bill.date));
    const dtfUK = new Intl.DateTimeFormat('UK', { month: '2-digit', day: '2-digit' });
    comment = "Closest bill:\n" + bill.recipient + " - " + dtfUK.format(billDate);

    return comment;
}

module.exports = {
    get: function(req, res) {
        respond(res, req.session);
    },
    post: function(req, res) {
        parseRequestBody(req, res, req.session);
    }
}