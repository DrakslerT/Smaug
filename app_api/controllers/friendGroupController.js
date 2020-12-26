const { request } = require('express');
const mongoose = require('mongoose');
const friend = require('../models/friend');
const user = require('../models/user');
const { use } = require('../routers/apiRouter');
const FriendGroup = mongoose.model('FriendGroup');
const Friend = mongoose.model('Friend');
const User = mongoose.model('User');
const jwt_decode = require('jwt-decode');

function addFriendGroup(req, res){
    try {
        const authorization = req.headers.authorization;
        if (authorization) {
            const token = authorization.split(' ')[1];
            const decodedToken = jwt_decode(token);

            var name = req.body.name;
            var friends = JSON.parse(req.body.friends);

            var check = true;
            for (var i = 0; i < friends.length; i++) {
                const nameTest = checkName(name);
                if (!nameTest) {
                    check = false; 
                    break;
                }
            }

            if(check){
                User.findById(decodedToken._id, function(error, user) {
                    if (error) {
                        console.log(error);
                        res.sendStatus(500);
                    } else {
                        let friendGroup = new FriendGroup({
                            name: name,
                            balance: 0,
                            friends: []
                        });
                        for(var i = 0; i < friends.length; i++){
                            let newFriend = new Friend({
                                name: friends[i],
                                balance: 0
                            });
                            newFriend.save();
                            friendGroup.friends.push(newFriend);
                        }

                        friendGroup.save(function callback(err) {
                            if (err) {
                                console.log(err);
                                res.sendStatus(500);
                            } else {
                                user.friendgroups.push(friendGroup);
                                user.save();
                                res.status(200).json(friendGroup);
                            }
                        });
                    }
                });
            } else {
                res.sendStatus(400);
            }
        }
        else {
            const response = {
                status: 'Unauthorized'
            }
            res.status(401).json(response);
        }
    }
    catch (ex) {
        console.log(ex);
        res.sendStatus(500);
    }
}

function calculateBalances(requestBody, res){
    try {
        var group_id = requestBody.group_id;
        var user_id = requestBody.user_id;
        var friends = JSON.parse(requestBody.friends);

        var check = true;
        var sumPrice = 0;
        var sumPaid = 0;
        for(var i = 0; i < friends.length; i++){
            for(var j = 0; j < 2; j++){
                const valueTest = checkValues(friends[i][j]);
                if(j == 0)
                    sumPrice += parseInt(friends[i][j]); 
                else
                    sumPaid += parseInt(friends[i][j]); 
                if(!valueTest){
                    check = false;
                }
            }
        }

       if(check && sumPrice == sumPaid){
           User.findById(user_id, function(error, user) {
                if (error) {
                    console.log(error);
                    res.sendStatus(500);
                } else {
                    FriendGroup.findById(group_id, function(error, group){
                        if (error) {
                            console.log(error);
                            res.sendStatus(500);
                        } else {
                            for(var i = 0; i < group.friends.length; i++){
                                var newBalance = group.friends[i].balance + (friends[i + 1][1] - friends[i + 1][0]);
                                group.friends[i].balance = newBalance;
                            }
                            var myBalance = group.balance + (friends[0][1] - friends[0][0]);
                            group.balance = myBalance;
                            group.save();
                            for(var i = 0; i < user.friendgroups.length; i++){
                                if(user.friendgroups[i]._id == group_id){
                                    user.friendgroups[i] = group;
                                    user.save();
                                    break;
                                }
                            }
                            res.status(200).json(user);
                        }
                    });
                }
            });
        } else {
            res.sendStatus(400);
        }
    }
    catch (ex) {
        console.log(ex);
        res.sendStatus(500);
    }
}

function deleteFriendGroup(requestBody, res){
    try {
        var group_id = requestBody.group_id;
        var user_id = requestBody.user_id;

        if(group_id != undefined) {
            FriendGroup.findByIdAndDelete(group_id, function(err, group) {
                if (err) {
                    console.log(err);
                } else {}
            });

            User.findById(user_id, function(err, user) {
                if (err) {
                    console.log(err);
                } else {
                    user.friendgroups.pull(group_id);
                    user.save();
                    res.status(200).json(user);
                    return;
                }
                res.status(304);
                 return;
            });
        } else {
            res.sendStatus(400);
        }
    } catch (ex) {
        console.log(ex);
        res.sendStatus(500);
    }


}


function checkName(title) {
    var regexTitle = new RegExp("^[A-Za-z0-9 ]{1,20}$");
    const titleTest = regexTitle.test(title);

    return titleTest;
}

function checkValues(value) {
    var regexValue = new RegExp("^[0-9]+(\.[0-9]{1,2})?$");
    const valueTest = regexValue.test(value);

    return valueTest;
}


module.exports = {
    addFriendGroup: function(req, res) {
        addFriendGroup(req, res);
    },
    calculateBalances: function(req, res) {
        calculateBalances(req.body, res);
    },
    deleteFriendGroup: function(req, res) {
        deleteFriendGroup(req.body, res);
    }
}