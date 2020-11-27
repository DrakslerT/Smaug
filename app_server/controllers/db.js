//Dependencies
var Client = require('node-rest-client').Client;

var data = {
    fileName: 'db',
    noheader: true,
    notfound: true
}

function respond(res, req) {



    res.render('db', data);
}

function parseRequestBody(body, res, session) {
    switch (body.formType) {
        case 'removeAllDbData':
            {
                removeAllDbData(body, res);
                break;
            }

    }
}

function removeAllDbData(body, res) {
    var args = {
        headers: { "Content-Type": "application/x-www-form-urlencoded" }
    }

    var client = new Client();
    client.post("http://localhost:8080/api/removeAllDbData", args,
        function(data, response) {
            if (response.statusCode == 204) {
                res.redirect('/db');
            } else {
                res.redirect('/db#error');
            }
        }
    );
}



module.exports = {
    get: function(req, res) {
        respond(res, req);
    },
    post: function(req, res) {
        parseRequestBody(req.body, res);
    }
}