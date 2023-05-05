const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const { authorization } = req.headers;
  if (authorization) {
    jwt.verify(authorization, process.env.SECRET, function (err, decoded) {
      if (err) {
        res.status(401).json({ message: err.message });
      }
      if (decoded) {
        //return payload => decode
        req.email = decoded.email;
        req.userId = decoded.userId;
        next();
      } else {
        res.status(401).end("unauthorized");
      }
    });
  } else {
    res.status(401).end("You have to Login first");
  }
}

module.exports = { auth };
