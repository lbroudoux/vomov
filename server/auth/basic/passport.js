exports.setup = function (User, config) {
  var passport = require('passport');
  var BasicStrategy = require('passport-http').BasicStrategy;
  
  passport.use(new BasicStrategy(
    function(apiKeyId, apiKeySecret, done) {
      // Connect to database and query against id / secret.
      User.findOne({ 'apiKey.id': apiKeyId, 'apiKey.secret': apiKeySecret }, 
                function(err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'This API key pair is unknown.'} );
        }
        return done(null, user);
      });
    }));
};