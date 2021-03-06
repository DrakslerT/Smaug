const smtp = require("../../app_api/controllers/smtpClient");
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Categories = mongoose.model('Categories');
const multer = require('multer');
const fs = require('fs');
const path = require("path");
const hasher = require('./hasher');
const passport = require('passport');
const jwt_decode = require('jwt-decode');

function register(req, res) {
    try {
        var email1 = req.body.email1up;
        var email2 = req.body.email2up;
        var pass1 = req.body.password1up;
        var pass2 = req.body.password2up;

        var regex = new RegExp("^([a-zA-Z])+$");
        var regex2 = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
        const firstName = regex.test(req.body.nameup);
        const lastName = regex.test(req.body.surnameup);
        const password = regex2.test(req.body.password1up);

        if (firstName && lastName && email1 === email2 && pass1 == pass2 && password) {
            var urlCode = smtp.generateCode(64);
            var confirmationCode = smtp.generateCode(64);

            let promise = new Promise(function(res, err) {
                var basicCategories;
                Categories.find({ 'basic': 'true' }, function(error, categories) {
                    if (error) {
                        console.log(error);
                    } else {
                        basicCategories = categories;
                        res(basicCategories);
                    }
                });
            });

            promise.then(function(basicCategories) {
                var hash = hasher.hashPassword(pass1);

                let user = new User({
                    firstname: req.body.nameup,
                    lastname: req.body.surnameup,
                    email: email1,
                    password: hash.password,
                    passwordSalt: hash.passwordSalt,
                    confirmationUrl: urlCode,
                    confirmationCode: confirmationCode,
                    isPremium: false,
                    language: "English",
                    categories: basicCategories
                });
                user.save(function callback(err) {
                    if (err) {
                        if (err.code === 11000) {
                            var response = {"reson": "Account already exists!"}
                            res.status(409).json(response);
                            return;
                        }
                        else {
                            var response = {"reson": "Server error!"}
                            res.status(500).json(response);
                            return;
                        }
                    } else {
                        var response = {
                            urlCode: urlCode
                        }
                        smtp.sendCode(email1, req.body.nameup, req.body.surnameup, urlCode, confirmationCode, req.headers.host);
                        res.status(200).json(response);
                    }
                });
            });

        } else {
            var response = {"reson": "Bad request!"}
            res.status(400).json(response);
        }
    } catch (ex) {
        console.log(ex);
        var response = {"reson": "Server error!"}
        res.status(500).json(response);
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
                    var hash = hasher.hashPasswordWitSalt(password, user.passwordSalt);
                    if (user.password === hash.password && user.confirmationUrl == null && user.confirmationCode == null) {
                        user.password = null;
                        user.passwordSalt = null;

                        var response = {
                            token: user.generateJwt()
                        }
                        res.status(200).json(response);
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

function retrieveUser(req, res) {
    try {
        const authorization = req.headers.authorization;
        if (authorization) {
            const token = authorization.split(' ')[1];
            const decodedToken = jwt_decode(token);

            User.findById(decodedToken._id, function(err, user) {
                if (err) {
                    res.sendStatus(500);
                } else {
                    if (user) {
                        user.password = null;
                        user.passwordSalt = null;
                        res.status(200).json(user);
                    } else {
                        res.sendStatus(404);
                    }
                }
            });
        }
        else {
            const response = {
                status: 'Unauthorized'
            }
            res.status(401).json(response);
        }
    } catch (ex) {
        res.sendStatus(500);
    }
}

function retrieveUserEmail(requestBody, res, session) {
    try {
        var email = requestBody.email;
        if (email === session.user.email) {
            res.status(404).json("cannot add yourself!");
        }
        
        User.findOne({ 'email': email }, function(err, user) {
            if (err) {
                res.sendStatus(500);
            } else {
                if (user) {
                    user.password = null;
                    user.passwordSalt = null;
                    res.sendStatus(200);
                } else {
                    res.status(404).json("no user!");
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
            if (err) {
                var response = {
                    status: 'server error'
                }
                res.status(500).json(response);
            }
            else if (err || user == null) {
                var response = {
                    status: 'not found'
                }
                res.status(404).json(response);
            } else {
                user.confirmationUrl = null;
                user.confirmationCode = null;
                user.save();

                var response = {
                    status: 'success'
                }
                res.status(200).json(response);
            }
        });
    } catch (ex) {
        var response = {
            status: 'server error'
        }
        res.status(500).json(response);
    }
}

function changeIncome(req, res) {
    try {
        const authorization = req.headers.authorization;
        if (authorization) {
            const token = authorization.split(' ')[1];
            const decodedToken = jwt_decode(token);

            var day = req.body.date;
            var paycheck = req.body.amount;

            var regex = new RegExp("^[0-9]+(\.[0-9]{1,2})?$");
            var income = regex.test(paycheck);

            if (income && day > 0 && day < 29) {
                User.findById(decodedToken._id, function name(err, user) {
                    if (err || user == null) {
                        const response = {
                            status: 'Not found'
                        }
                        res.status(404).json(response);
                    } else {
                        user.paycheck = paycheck,
                        user.paycheckDate = day
                        user.save();

                        const response = {
                            status: 'Success'
                        }
                        res.status(200).json(response);
                    }
                });
            } else {
                const response = {
                    status: 'Bad request'
                }
                res.status(400).json(response);
            }
        }
        else {
            const response = {
                status: 'Unauthorized'
            }
            res.status(401).json(response);
        }
    } catch (ex) {
        const response = {
            status: 'Server error'
        }
        res.status(500).json(response);
    }
}

function updateUser(req, res) {
    try {
        var regex = new RegExp("^([a-zA-Z])+$");
        var regex2 = new RegExp("^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})");
        const firstName = req.body.firstName ? regex.test(req.body.firstName) : true;
        const lastName = req.body.lastName ? regex.test(req.body.lastName) : true;
        const password = req.body.password ? regex2.test(req.body.password) : true;

        const authorization = req.headers.authorization;
        if (authorization) {
            const token = authorization.split(' ')[1];
            const decodedToken = jwt_decode(token);

            if (firstName && lastName && password) {
                User.findById(decodedToken._id, function(err, user) {
                    if (err) {
                        console.log(err);
                    } else {
                        if (user) {

                            user.firstname = req.body.firstName ? req.body.firstName : user.firstname;
                            user.lastname = req.body.lastName ? req.body.lastName : user.lastname;
                            user.email = req.body.email ? req.body.email : user.email;
                            user.password = req.body.password ? req.body.password : user.password;
                            user.language = req.body.language ? req.body.language : user.language;
                            user.defaultCurrency = req.body.defaultCurrency ? req.body.defaultCurrency : user.defaultCurrency;

                            user.save();
                            res.status(200).json(user);
                        } else {
                            res.sendStatus(404);
                        }
                    }
                });
            } else {
                res.sendStatus(404);
            }
        } else {
            const response = {
                status: 'Unauthorized'
            }
            res.status(401).json(response);
        }
    } catch (ex) {
        res.sendStatus(500);
    }
}

function setCurrency(req, res) {
    try {
        const authorization = req.headers.authorization;
        if (authorization) {
            const token = authorization.split(' ')[1];
            const decodedToken = jwt_decode(token);
            User.findById(decodedToken._id, function (err, user) {
                if (err) {
                    console.log(err);
                } else {
                    if (user) {
                        user.defaultCurrency = req.body.currency ;
                        user.save();
                        res.status(200).json(user);
                    } else {
                        res.sendStatus(404);
                    }
                }
            });
        } else {
            const response = {
                status: 'Unauthorized'
            }
            res.status(401).json(response);
        }
    } catch (ex) {
        res.sendStatus(500);
    }
}

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads');
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const uploadImg = multer({ storage: storage }).single('image');

function postImg(req, res) {
    try {
        const authorization = req.headers.authorization;
        if (authorization) {
            const token = authorization.split(' ')[1];
            const decodedToken = jwt_decode(token);
            User.findById(decodedToken._id, function(err, user) {
                if (err) {
                    console.log(err);
                } else {
                    if (user) {
                        if (user.profilePic) {
                            fs.unlink(user.profilePic, (err) => {
                                if (err) {
                                    console.log('File: ' + user.profilePic + " does not exist!");
                                } else {
                                    console.log('File: ' + user.profilePic + " was deleted");
                                }
                            });
                        }
                        if (req.file) {
                            user.profilePic = req.file.path;
                            user.save();
                            res.status(200).json(req.file.path);
                        } else {
                            res.sendStatus(500);
                        }
                    } else {
                        res.sendStatus(404);
                    }
                }
            });
        } else {
            const response = {
                status: 'Unauthorized'
            }
            res.status(401).json(response);
        }
    } catch (ex) {
        res.sendStatus(500);
    }
}

function getPfp(req, res) {
    try {
        const authorization = req.headers.authorization;
        if (authorization) {
            const token = authorization.split(' ')[1];
            const decodedToken = jwt_decode(token);
            User.findById(decodedToken._id, function(err, user) {
                if (err) {
                    console.log(err);
                } else {
                    if (user) {
                        if (user.profilePic == null) {
                            res.status(200).sendFile(path.resolve("public/images/Default_pfp.png"));
                        } else {
                            res.status(200).sendFile(path.resolve(user.profilePic));
                        }
                    } else {
                        res.status(404).sendFile(path.resolve("public/images/Default_pfp.png"));
                    }
                }
            });
        } else {
            const response = {
                status: 'Unauthorized'
            }
            res.status(401).json(response);
        }
    } catch (ex) {
        res.sendStatus(500);
    }
}

function requestResetPassword(req, res) {
    try {
        const email = req.body.email;

        User.findOne({ email: email }, function(err, user) {
            if (err) {
                res.sendStatus(500);
            } else {
                if (user) {
                    var resetPasswordCode = smtp.generateCode(64);
                    user.resetPasswordCode = resetPasswordCode;
                    user.save(function(err) {
                        if (err) {
                            res.sendStatus(500);
                        } else {
                            smtp.sendResetPassword(email, user.firstname, user.lastname, resetPasswordCode, req.headers.host);
                            res.sendStatus(200);
                        }
                    });
                } else {
                    res.sendStatus(404);
                }
            }
        });
    } catch (ex) {
        res.sendStatus(500);
    }
}

function resetPassword(req, res) {
    try {
        var code = req.body.code;
        var password = req.body.password;
        if (password) {
            User.findOne({ resetPasswordCode: code }, function(err, user) {
                if (err) {
                    res.sendStatus(500);
                } else {
                    if (user) {
                        var hash = hasher.hashPassword(password);

                        user.password = hash.password;
                        user.passwordSalt = hash.passwordSalt
                        user.resetPasswordCode = null;
                        user.save();
                        res.sendStatus(200);
                    } else {
                        res.sendStatus(404);
                    }
                }
            });
        } else {
            res.sendStatus(400);
        }
    } catch (ex) {
        res.sendStatus(500);
    }
}

function changePassword(req, res) {
    try {
        var oldPassword = req.body.oldPassword;
        var newPassword1 = req.body.newPassword1;
        var newPassword2 = req.body.newPassword2;

        const authorization = req.headers.authorization;
        if (authorization) {
            const token = authorization.split(' ')[1];
            const decodedToken = jwt_decode(token);

            if (newPassword1 === newPassword2) {
                User.findById(decodedToken._id, function(err, user) {
                    if (err) {
                        res.sendStatus(500);
                    }
                    else {
                        var hash = hasher.hashPasswordWitSalt(oldPassword, user.passwordSalt);
                        if (user.password === hash.password) {
                            hash = hasher.hashPassword(newPassword1);

                            user.password = hash.password;
                            user.passwordSalt = hash.passwordSalt;    
                            user.save(function callback(err) {
                                user.password = null;
                                user.passwordSalt = null;
                                res.status(200).json(user);
                            });
                        }
                        else {
                            res.sendStatus(401);
                        }
                    }
                });
            }
            else {
                res.sendStatus(400);
            }
        } else {
            const response = {
                status: 'Unauthorized'
            }
            res.status(401).json(response);
        }
    } catch (ex) {
        res.sendStatus(500);
    }
}

function handlePaychecks() {
    User.find(function(err, users) {
        if (err) {
            console.log(err);
        } else {
            if (users.length > 0) {
                for (var user of users) {
                    handlePaycheck(user);
                    user.save();
                }
            } else {
                console.log('There are no users to take care of');
            }
        }
    });
}

function handlePaycheck(user) {
    const day = new Date().getDate();
    if (user.paycheckDate === day) {
        user.paycheckLastMonth = user.paycheck;
    }
}

function deleteUser(req, res) {
    try {
        const authorization = req.headers.authorization;
        if (authorization) {
            const token = authorization.split(' ')[1];
            const decodedToken = jwt_decode(token);

            User.findById(decodedToken._id, function(err, user) {
                if (err) {
                    res.sendStatus(404);
                }
                else {
  
                    user.deleteOne(function callback(err) {
                        res.status(204).json("deleted");
                    });
                }
            });
        } else {
            const response = {
                status: 'Unauthorized'
            }
            res.status(401).json(response);
        }
    } catch (ex) {
        res.sendStatus(500);
    }
}

function createAdminAccount() {
    if (User.findOne({ 'email': "admin@smaug.com" }, function(err, result) {
        if (err || !result) {
            let adminUser = new User({
                firstname: "Admin",
                lastname: "User",
                email: "admin@smaug.com",
                password: "$2a$10$L0ZgurAiFhmaH1KGg6UYdOpuNJTU4X0TMBSMNIYAo2NE5/QEK0tSG",
                passwordSalt: "$2a$10$L0ZgurAiFhmaH1KGg6UYdO",
                paycheck: 1500,
                paycheckLastMonth: 1500,
                paycheckDate: 18,
                accessLevel: 3,
                language: "English",
                categories: [],
                envelopes: [],
                expense: [],
                bills: [],
                goals: [],
                friendgroups: []
                //connections: connectionArray
            });
            adminUser.save();
        }
    }));
}

module.exports = {
    register: function(req, res) {
        register(req, res);
    },
    login: function(req, res) {
        login(req.body, res);
    },
    requestResetPassword: function(req, res) {
        requestResetPassword(req, res);
    },
    resetPassword: function(req, res) {
        resetPassword(req, res);
    },
    changePassword: function(req, res) {
        changePassword(req, res);
    },
    retrieveUser: function(req, res) {
        retrieveUser(req, res, req.session);
    },
    retrieveUserEmail: function(req, res) {
        retrieveUserEmail(req.body, res, req.session);
    },
    confirm: function(req, res) {
        confirm(req, res);
    },
    changeIncome: function(req, res) {
        changeIncome(req, res);
    },
    postImg,
    uploadImg,
    getPfp: function(req, res) {
        getPfp(req, res);
    },
    updateUser: function(req, res) {
        updateUser(req, res);
    },
    setCurrency: function(req, res) {
        setCurrency(req, res);
    },
    handlePaychecks: function() {
        handlePaychecks();
    },
    deleteUser: function(req, res) {
        deleteUser(req, res);
    },
    createAdminAccount: function() {
        createAdminAccount();
    }
}