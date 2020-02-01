var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var UserSchema = mongoose.Schema({
    user_id: {
        type: Number
    },
    firstname: {
        type: String
    },
    lastname: {
        type: String
    },
    email: {
        type: String
    },
    mobile_no: {
        type: Number
    },
    address: {
        type: String
    },
    password: {
        type: String
    },
    confirm_password: {
        type: String
    },
    created_at: {
        type: Date
    },
    username: {
        type: String
    },
    role: {
        type: String
    },
    active: {
        type: Boolean
    },
    is_login: {
        type: Boolean
    },
    question_answer: [
        {
            question_id: Number,
            answer_id: Number
        }
    ]
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}

module.exports.getUserByEmail = function (username, callback) {
    var query = { email: username };
    User.findOne(query, callback);
}

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
}

module.exports.totalUserCount = function (callback) {
    User.countDocuments({}, callback);
}

module.exports.isQuestionIdPresent = function (qId, callback) {
    User.find({ question_answer: { $all: [{ "$elemMatch": { question_id: qId } }] } }, callback)
}

module.exports.isUserPresent = function (uId, callback) {
    User.find({ user_id: uId }, callback);
}

module.exports.createQuestionAndAnswer = function (data, callback) {
    User.update({ user_id: data.user_id }, { $push: { question_answer: { $each: [{ question_id: data.question_id, answer_id: data.answer_id }] } } }, { _id: 0 }, callback)
}

module.exports.updateAnswer = function (data, callback) {
    User.update({ user_id: data.user_id, "question_answer.question_id": data.question_id }, { $set: { "question_answer.$.answer_id": data.answer_id } }, callback);
}


