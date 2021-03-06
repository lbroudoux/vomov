var Token = require('./token')
var UnauthorizedError = require('./errors/UnauthorizedError');

module.exports = function(options) {
  
  return function(req, res, next) {
    var token;
    
    // Check headers and extract token.
    if (req.headers && req.headers.authorization) {
      var parts = req.headers.authorization.split(' ');
      if (parts.length == 2) {
        var scheme = parts[0], credentials = parts[1];
          
        if (/^Bearer$/i.test(scheme)) {
          token = credentials;
        }
      } else {
        return next(new UnauthorizedError('credentials_bad_format', { message: 'Format is Authorization: Bearer [token]' }));
      }
    } else {
      return next(new UnauthorizedError('credentials_required', { message: 'No Authorization header was found' }));
    }
    
    // We've got a token to check
    Token.findOne({ 'token': token }, function(err, token) {
      if (err) {
        console.log('Error while querying for token ' + token);
      }
      if (token) {
        req.user = {_id: token.userid};
      } else {
        next(new UnauthorizedError('invalid_token', { message : 'No Tokan was found' }));
      }
      next();
    });
  }
};