var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../db/schemas/user.schema');

router.post('/signup', function (req, res) {
	var newUser = new User(getNewUserBody(req));
	User.totalUserCount(function (err, totalUsers) {
		if (totalUsers == 0) {
			newUser['user_id'] = 1;
		} else if (totalUsers == 1) {
			newUser['user_id'] = 2;
		} else {
			newUser['user_id'] = totalUsers++;
		}
	});
	User.createUser(newUser, function (err, user) {
		if (err) throw err;
		if (!user) {
			return res.json({ error: false });
		}
		return res.json({ success: true, userdata: user });
	});
});

var getNewUserBody = function (req) {
	if (req) {
		var userObj = {
			firstname: req.body.firstname,
			lastname: req.body.lastname,
			email: req.body.email,
			mobile_no: req.body.mobile_no,
			address: req.body.address,
			password: req.body.password,
			confirm_password: req.body.confirm_password
		}
		if (req.body.role != 'admin') {
			userObj['role'] = "user";
		} else {
			userObj['role'] = "admin";
		}
	}
	return userObj;
}

passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, function (username, password, done) {
	console.log("USERNAME =", username);
	console.log("PASSWORD =", password);
	User.getUserByEmail(username, function (err, user) {
		if (err) throw err;
		if (!user) {
			return done(null, false, { message: 'Unknown User' });
		}

		User.comparePassword(password, user.password, function (err, isMatch) {
			if (err) throw err;
			if (isMatch) {
				return done(null, user);
			} else {
				return done(null, false, { message: 'Invalid password' });
			}
		});
	});
}));

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.getUserById(id, function (err, user) {
		done(err, user);
	});
});

router.post('/login', passport.authenticate('local', { successRedirect: '/users/welcome', failureRedirect: '/users/fail', failureFlash: true, session: false }), function (req, res) {
	//res.redirect('/users/auth');
});

router.get('/welcome', ensureAuthenticated, function (req, res) {
	console.log("Login Success");
	res.json({ success: true });
	//res.end("Welcome To Dashboard");	
});

function ensureAuthenticated(req, res, next) {
	console.log("req = ", req.isAuthenticated());
	if (req.isAuthenticated()) {
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/fail');
	}
}

router.get('/fail', function (req, res) {
	console.log("Login Fail");
	res.json({ error: false });
	//res.end('LOGIN PAGE');
});

router.get('/error', function (req, res) {
	res.end("TESTING API Error");
});

router.get('/logout', function (req, res) {
	console.log("Inside Server Side Logout");
	req.logout();
	res.json({ success: true });
	//req.flash('success_msg', 'You are logged out');
	//res.redirect('/users/login');
});

router.post('/question_answer', function (req, res) {
	var user_id = req.body.user_id;
	var question_id = req.body.question_answer[0].question_id;
	var answer_id = req.body.question_answer[0].answer_id;
	User.isUserPresent(user_id, function (err, isPresent) {
		if (err) throw err;
		if (isPresent.length > 0) {
			User.isQuestionIdPresent(question_id, function (err, isQuestionPresent) {
				if (err) throw err;
				var obj = {
					user_id: user_id,
					question_id: question_id,
					answer_id: answer_id
				}
				if (isQuestionPresent.length > 0) {
					User.updateAnswer(obj, function (err, updatedAnswer) {
						if (err) throw err;
					});
				} else {
					User.createQuestionAndAnswer(obj, function (err, createdQuestionAndAnswer) {
						if (err) throw err;
					});
				}
			});
		} else {
			console.log("User Not Present");
		}
	});
});

module.exports = router;






// var questionAnswerBody = new User({
	// 	user_id: req.body.user_id,
	// 	question_id: req.body.question_answer[0].question_id,
	// 	answer_id: req.body.question_answer[0].answer_id
	// });














































