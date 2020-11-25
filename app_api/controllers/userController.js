const smtp = require("../../app_api/controllers/smtpClient");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const multer = require('multer');
const user = require("../models/user");
const fs = require('fs');
const path = require("path");

function register(requestBody, res) {
    try {
        var email1 = requestBody.email1up;
        var email2 = requestBody.email2up;
        var pass1 = requestBody.password1up;
        var pass2 = requestBody.password2up;

        /* 
        //check if email is already used - ne dela tko, skos crasha nwm zakva
        if(email1 === email2){
            User.findOne({'email': email1}, function(err, user) {
                if (err) {
                    console.log(err);
                }
                else {
                    if (user) {
                        res.sendStatus(400);
                    }
                }
            });
        }
        */

        var regex = new RegExp("^([a-zA-Z])+$");
        var regex2 = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
        const firstName = regex.test(requestBody.nameup);
        const lastName = regex.test(requestBody.surnameup);
        const password = regex2.test(requestBody.password1up);

        //dodate treba še če je bil mail poslan a.k.a. mail obstaja!!!
        if (firstName && lastName && email1 === email2 && pass1 == pass2 && password) {
            var urlCode = smtp.generateCode(64);
            var confirmationCode = smtp.generateCode(64);

            let user = new User({
                firstname: requestBody.nameup,
                lastname: requestBody.surnameup,
                email: email1,
                password: pass1,
                passwordSalt: "tempSalt",
                confirmationUrl: urlCode,
                confirmationCode: confirmationCode,
                isPremium: false
            });

            user.save(function callback(err) {
                if (err) {
                    res.sendStatus(400);
                } else {
                    var response = {
                        user: user,
                        urlCode: urlCode
                    }
                    smtp.sendCode(email1, requestBody.nameup, requestBody.surnameup, urlCode, confirmationCode);
                    res.status(200).json(response);
                }
            });
        } else {
            console.log(requestBody);
            res.sendStatus(400);
        }
    } catch (ex) {
        console.log(ex);
        res.sendStatus(500);
    }
}


function login(requestBody, res) {
    try {
        var email = requestBody.email;
        var password = requestBody.password;

        User.findOne({ 'email': email }, function(err, user) {
            if (err) {
                res.sendStatus(500);
            } else {
                if (user) {
                    if (user.password === password && user.confirmationUrl == null && user.confirmationCode == null) {
                        user.password = null;
                        user.passwordSalt = null;
                        res.status(200).json(user);
                    } else {
                        res.sendStatus(401);
                    }
                } else {
                    res.sendStatus(404);
                }
            }
        });
    } catch (ex) {
        res.sendStatus(500);
    }
}

function confirm(req, res) {
    try {
        var url = req.params.urlCode;
        var code = req.params.code;

        User.findOne({ 'confirmationUrl': url, 'confirmationCode': code }, function name(err, user) {
            if (err || user == null) {
                res.sendStatus(404);
            }
            else {
                user.confirmationUrl = null;
                user.confirmationCode = null;
                user.save();
                res.sendStatus(200);
            }
        });
    } catch (ex) {
        res.sendStatus(500);
    }
}

function changeIncome(requestBody, res, session) {
    var day = requestBody.date;
    var paycheck = requestBody.amount;

    var regex = new RegExp("^[0-9]+(\.[0-9]{1,2})?$");
    var income = regex.test(paycheck);

    if (income && day > 0 && day < 29) {
        User.findOne({ 'email': session.user.email}, function name(err, user) {
            if (err || user == null) {
                res.sendStatus(404);
            }
            else {
                user.paycheck = paycheck,
                user.paycheckDate = day
                user.save();
                res.sendStatus(200);
            }
        });
    } else {
        res.sendStatus(400);
    }
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');
      },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const uploadImg = multer({storage: storage}).single('image');

function postImg (req, res) {
    try {
        User.findOne({ 'email': req.session.user.email }, function(err, user) {
            if (err) {
                console.log(err);
            } else {
                if (user) {
                    fs.unlink(user.profilePic, (err) => {
                        if (err) {
                            console.log('File: ' + user.profilePic + " does not exist!");
                        } else {
                            console.log('File: ' + user.profilePic + " was deleted");
                        }
                    });
                    user.profilePic = req.file.path;
                    user.save();
                    res.status(200).json(user.profilePic);
                } else {
                    res.sendStatus(404);
                }
            }
        });
    } catch (ex) {
        res.sendStatus(500);
    }
}

function getPfp (req, res) {
    try {
        User.findOne({ 'email': req.session.user.email }, function(err, user) {
            if (err) {
                console.log(err);
            } else {
                if (user) {
                    if (user.profilePic == null) {
                        res.status(404).sendFile(path.resolve("public/images/Default_pfp.png"));
                    }
                    else {
                        res.status(200).sendFile(path.resolve(user.profilePic));
                    }
                } else {
                    res.sendStatus(404);
                }
            }
        });
    } catch (ex) {
        res.sendStatus(500);
    }
}

module.exports = {
    register: function(req, res) {
        register(req.body, res);
    },
    login: function(req, res) {
        login(req.body, res);
    },
    confirm: function(req, res) {
        confirm(req, res);
    },
    changeIncome: function(req, res) {
        changeIncome(req.body, res, req.session);
    },
    postImg,
    uploadImg,
    getPfp: function(req, res) {
        getPfp(req, res);
    }
}