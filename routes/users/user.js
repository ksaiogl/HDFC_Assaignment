var TAG = '-- clientOnboarding.js --';
var dbConfig = require('../../Environment/mongoDatabase')
var crypto = require("crypto");
var request = require('request');
var timezoneConversions = require('../../Environment/timezoneConversions');
var inputSchemas = require('../util/validations')
var V = require('jsonschema').Validator;
var validator = new V();
var models = require('../util/models');
var _ = require('underscore');

exports.register = (req) => {
    global.logger.logger_client.info(`${TAG} Inside register function,input: ${JSON.stringify(req.body)}`);
    return validateRegistrationInput(req)
        .then(checkUserDataUniqueness)
        .then(generateUserId)
        .then(insertUserDataIntoDB)
        .catch(err => Promise.reject(err));
};

exports.login = (req) => {
    global.logger.logger_client.info(`${TAG} Inside login function,input: ${JSON.stringify(req.body)}`);
    return validateLoginRequest(req)
        .then(checkDetailsInDB)
        .then(updateSessionInRedis)
        .catch(err => Promise.reject(err))
};

exports.isloggedIn = (req) => {
    global.logger.logger_client.info(`${TAG} Inside isloggedIn function`);
    return new Promise((resolve, reject) => {
        if (req.session.user) {
            global.logger.logger_client.info(`${TAG} User Already logged In`);
            resolve(global.outputResult(req.session.user));
        } else {
            global.logger.logger_client.error(`${TAG} User Not logged In`);
            reject(global.makeResult('401', 'No session found'))
        }
    });
};

exports.logout = (req) => {
    global.logger.logger_client.info(`${TAG} Inside logout function`);
    return new Promise((resolve, reject) => {
        delete req.session.user;
        global.logger.logger_client.info(`${TAG} Client logged out successfully.`);
        resolve(global.outputResult("Client logged out successfully."));
    });
};

exports.getPlaceDetails = (req) => {
    return new Promise((resolve, reject) => {
        global.logger.logger_client.info(`${TAG} Inside getPlaceDetails function`)
        if (typeof req.query.placeId == 'string' && req.query.placeId.length > 0) {
            return getPlacesDetailsFromGoogleApi(req)
                .then(updatePlacesViewedInDB)
                .then(res => resolve(res))
                .catch(err => {
                    global.logger.logger_client.info(`${TAG} Error in getPlaceDetails,err:${err.stack}`)
                    reject(global.internalServerError(err));
                });
        } else {
            global.logger.logger_client.error(`Error updating Client Password in DB,err: ${err.stack}`);
            reject(global.internalServerError(err));
        }
    });
}

exports.placeSearch = (req) => {
    return new Promise((resolve, reject) => {
        var db = dbConfig.mongoDbConn;
        global.logger.logger_client.info(`Inside placeSearch Function,input: ${req.query}`);
        if (typeof req.query.quertText == 'string' && req.query.quertText.length > 0) {
            var url = 'https://maps.googleapis.com/maps/api/place/textsearch/json?query=' + req.query.quertText + (req.query.type ? '&type=' + req.query.type : '') + '&key=AIzaSyDv6hU1ifnAo0POd92dkoyS-GkTz8Q22m8'
            request({
                url: url,
                method: "GET"
            }, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    db.collection('client').updateOne({ 'userId': req.session.user.userId },
                        {
                            $push: {
                                "searchedPlaces": {
                                    $each: [{ place: req.query.quertText, timeStamp: new Date() }],
                                    $sort: {
                                        "timeStamp": -1
                                    }
                                }
                            }
                        }) 
                        .then(res => {
                            global.logger.logger_client.info(`Succesfully Updated Place Search Request in Db`);
                            resolve(global.outputResult(JSON.parse(body)));
                        })
                        .catch(err => {
                            global.logger.logger_client.error(`Error updating Place Search Request in DB,err: ${err.stack}`);
                            reject(global.internalServerError(err));
                        })
                } else {
                    global.logger.logger_client.error("Error fetching Place Search Data: ", error);
                    reject(global.internalServerError());
                }
            });
        } else {
            reject(global.makeResult('400', 'Input Query text is Mandatory'))
        }
    });
};

exports.getSearchedPlaces = (req) => {
    return new Promise((resolve, reject) => {
        var db = dbConfig.mongoDbConn;
        var invoiceQuery = [];
        invoiceQuery.push({ $unwind: "$searchedPlaces" });
        if (req.query.fromDate && req.query.toDate) {
            var fromDate = req.query.fromDate;
            var toDate = req.query.toDate;
            var frmDate = new Date(fromDate);
            var toDateQ = new Date(toDate);
            frmDate = timezoneConversions.toIST(frmDate);
            toDateQ = timezoneConversions.toIST(toDateQ);
            frmDate.setHours(0, 0, 0, 0);
            toDateQ.setHours(23, 59, 59, 999);
            frmDate = timezoneConversions.toUTC(frmDate);
            toDateQ = timezoneConversions.toUTC(toDateQ);
            invoiceQuery.push({
                $match: {
                    "searchedPlaces.timeStamp": {
                        "$gte": frmDate,
                        "$lte": toDateQ
                    }
                }
            });
            invoiceQuery.push({
                $group: { "_id": null, "searchedPlaces": { $addToSet: "$searchedPlaces" } }
            });
        }

        invoiceQuery.push({
            $project: {
                "_id": 0,
                "searchedPlaces": 1
            }
        });
        db.collection('client').aggregate(invoiceQuery).toArray()
            .then(res => {
                global.logger.logger_client.info(`Password Reset Succesful`);
                return resolve(global.outputResult(res[0].searchedPlaces));
            })
            .catch(err => {
                console.log("err: ", err.stack);
                global.logger.logger_client.error(`Error updating Client Password in DB,err: ${err.stack}`);
                reject(global.internalServerError(err));
            });
    });
};

exports.getViewedPlaces = (req) => {
    return new Promise((resolve, reject) => {
        var db = dbConfig.mongoDbConn;
        var invoiceQuery = [];
        invoiceQuery.push({ $unwind: "$viewedPlaces" });
        if (req.query.fromDate && req.query.toDate) {
            var fromDate = req.query.fromDate;
            var toDate = req.query.toDate;
            var frmDate = new Date(fromDate);
            var toDateQ = new Date(toDate);
            frmDate = timezoneConversions.toIST(frmDate);
            toDateQ = timezoneConversions.toIST(toDateQ);
            frmDate.setHours(0, 0, 0, 0);
            toDateQ.setHours(23, 59, 59, 999);
            frmDate = timezoneConversions.toUTC(frmDate);
            toDateQ = timezoneConversions.toUTC(toDateQ);
            invoiceQuery.push({
                $match: {
                    "viewedPlaces.timeStamp": {
                        "$gte": frmDate,
                        "$lte": toDateQ
                    }
                }
            });
            invoiceQuery.push({
                $group: { "_id": null, "viewedPlaces": { $addToSet: "$viewedPlaces" } }
            });
        }

        invoiceQuery.push({
            $project: {
                "_id": 0,
                "viewedPlaces": 1
            }
        });
        db.collection('client').aggregate(invoiceQuery).toArray()
            .then(res => {
                global.logger.logger_client.info(`Password Reset Succesful`);
                return resolve(global.outputResult(res[0].viewedPlaces));
            })
            .catch(err => {
                global.logger.logger_client.error(`Error updating Client Password in DB,err: ${err.stack}`);
                reject(global.internalServerError(err));
            });
    });
};

const getPlacesDetailsFromGoogleApi = (req) => {
    return new Promise((resolve, reject) => {
        global.logger.logger_client.info(`${TAG} Inside getPlacesDetailsFromGoogleApi function`)
        var db = dbConfig.mongoDbConn;
        request({
            url: `https://maps.googleapis.com/maps/api/place/details/json?placeid=${req.query.placeId}&key=AIzaSyDv6hU1ifnAo0POd92dkoyS-GkTz8Q22m8`,
            method: "GET"
        }, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                req.query.placeDetails = JSON.parse(body);
                global.logger.logger_client.info(`Fethed data from Googke Api`);
                resolve(req);
            } else {
                console.log("Got an error fetching user data: ", error);
                reject(global.internalServerError());
            }
        });
    });
}

const updatePlacesViewedInDB = (req) => {
    return new Promise((resolve, reject) => {
        var db = dbConfig.mongoDbConn;
        global.logger.logger_client.info(`${TAG} Inside updatePlacesViewedInDB function`)
        db.collection('client').updateOne({ 'userId': req.session.user.userId },
            {
                $push: {
                    "viewedPlaces": {
                        $each: [{ placeName: req.query.placeDetails.result.name, placeId: req.query.placeId, timeStamp: new Date() }],
                        $sort: {
                            "timeStamp": -1
                        }
                    }
                }
            })
            .then(res => {
                global.logger.logger_client.info(`Updated Places viewed in DB`);
                return resolve(global.outputResult(req.query.placeDetails));
            })
            .catch(err => {
                global.logger.logger_client.error(`Error updating Client Places Viewed in DB,err: ${err.stack}`);
                reject(global.internalServerError(err));
            })
    });
}

const validateRegistrationInput = (req) => {
    return new Promise((resolve, reject) => {
        global.logger.logger_client.info(`${TAG} Inside validateRegistrationInput function`)
        var errors = [];

        var validation_result = validator.validate(req.body, inputSchemas.registrationSchema);

        if (validation_result.errors.length > 0) {
            for (var error in validation_result.errors) {
                errors.push(validation_result.errors[error].stack.replace('instance.', ''));
            }
            console.log("errors: ", errors);
            global.logger.logger_client.error(TAG + "Bad or ill-formed request,errors: \n" + JSON.stringify(errors));
            return reject(global.badFormat(errors));
        } else {
            global.logger.logger_client.info(`${TAG} Registration Input validation succesful`)
            resolve(req);
        }
    });
}

const validateLoginRequest = (req) => {
    return new Promise((resolve, reject) => {
        global.logger.logger_client.info(`${TAG} Inside validateLoginRequest function`)
        if (typeof req.body.userName == 'string' && typeof req.body.password == 'string' && req.body.userName.length > 0 && req.body.password.length > 0) {
            global.logger.logger_client.info(`${TAG} Login Input validation succesful`);
            resolve(req);
        } else {
            global.logger.logger_client.info(`User Name and Password are Mandatory`);
            reject(global.makeResult('400', 'User Name and Password are Mandatory'));
        }
    });
}

const checkDetailsInDB = (req) => {
    return new Promise((resolve, reject) => {
        var db = dbConfig.mongoDbConn;
        global.logger.logger_client.info(`${TAG} Inside checkDetailsInDB function`)

        req.body.password = crypto.createHash('md5').update(req.body.password).digest('hex');

        db.collection('client').findOne({ 'userName': req.body.userName, 'password': req.body.password }, { "_id": 0, "viewedPlaces": 0, "searchedPlaces": 0 })
            .then(res => {
                if (!res) {
                    global.logger.logger_client.error(`User Name or Password Mis-Match`);
                    return reject(global.makeResult('404', `User Name or Password Mis-Match`));
                }
                req.body.clientObj = res;
                global.logger.logger_client.info(`${TAG} User details found in DB.`)
                resolve(req);
            })
            .catch(err => {
                global.logger.logger_client.error(`Error checking User Details against DB,err: ${err.stack}`);
                reject(global.internalServerError(err));
            })
    });
}

const checkUserDataUniqueness = (req) => {
    return new Promise((resolve, reject) => {
        var db = dbConfig.mongoDbConn;
        global.logger.logger_client.info(`${TAG} Inside checkUserDataUniqueness function`)

        db.collection('client').find({ $or: [{ "userName": req.body.userName }, { "emailId": req.body.emailId }, { "mobileNumber": req.body.mobileNumber }] }).toArray()
            .then(res => {
                if (res.length == 0) {
                    global.logger.logger_client.error(`User Entered Data is unqiue`);
                    return resolve(req);
                }
                var uniquenessObj = {
                    'isUserNameUnique': true,
                    'isEmailIdUnique': true,
                    'isMobileNumberUnique': true
                }

                _.map(res, obj => {
                    if (obj.userName == req.body.userName) {
                        uniquenessObj.isUserNameUnique = false;
                    }
                    if (obj.emailId == req.body.emailId) {
                        uniquenessObj.isEmailIdUnique = false;
                    }
                    if (obj.mobileNumber == req.body.mobileNumber) {
                        uniquenessObj.isMobileNumberUnique = false;
                    }
                })
                if (!(uniquenessObj.isUserNameUnique && uniquenessObj.isEmailIdUnique && uniquenessObj.isMobileNumberUnique)) {
                    global.logger.logger_client.error(`User Data not unqiue , ${uniquenessObj}`);
                    return reject(global.makeResult('400', 'User Data not unqiue', uniquenessObj))
                }
                global.logger.logger_client.error(`User Entered Data is unqiue`);
                return resolve(req);
            })
            .catch(err => {
                global.logger.logger_client.error(`Error checking user details against DB,err: ${err.stack}`);
                reject(global.internalServerError(err));
            })
    });
}

const generateUserId = (req) => {
    return new Promise((resolve, reject) => {
        var db = dbConfig.mongoDbConn;
        global.logger.logger_client.info(`${TAG} Inside generateUserId function`)
        db.collection('counters').findAndModify({ _id: 'userId' }, null, { $inc: { seq: 1 } }, { new: true })
            .then(result => {
                req.body.userId = result.value.seq
                global.logger.logger_client.info(`${TAG} Succsefully generated UserId`)
                return resolve(req)
            })
            .catch(err => {
                global.logger.logger_client.error(`Error generating UserId,err: ${err.stack}`);
                return reject(global.internalServerError(err));
            })
    });
}

const insertUserDataIntoDB = (req) => {
    return new Promise((resolve, reject) => {
        var db = dbConfig.mongoDbConn;
        global.logger.logger_client.info(`${TAG} Inside insertUserDataIntoDB function`);
        req.body.password = crypto.createHash('md5').update(req.body.password).digest('hex');

        var userObj = new models.UserObj(req.body);

        db.collection('client').insert(userObj)
            .then(res => {
                global.logger.logger_client.info(`${TAG} Succsefully Created User Document In DB`);
                return resolve(global.outputResult("Succsefully Created User Document In DB"));
            })
            .catch(err => {
                global.logger.logger_client.error(`Error Creating User Document In DB,err: ${err.stack}`);
                return reject(global.internalServerError(err));
            })
    });
}

const updateSessionInRedis = (req) => {
    return new Promise((resolve, reject) => {
        delete req.body.clientObj.password
        req.session.user = req.body.clientObj;
        global.logger.logger_client.info(`Succsefully update session in redis`);
        resolve(global.outputResult(req.body.clientObj));
    });
}
