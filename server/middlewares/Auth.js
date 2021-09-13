const { verify } = require("jsonwebtoken");

function auth(req, res, next) {
  const accessToken = req.headers["x-access-token"].split(" ")[1];

  if (!accessToken) {
    return res.status(400).json({ message: "User not authenticated" });
  }

  verify(accessToken, process.env.JWT_KEY, (err, user) => {
    if (err) {
      console.log(err);
      res.status(401).json({ message: err });
    } else {
      req.user = user;
      next();
    }
  });
}

module.exports = { auth };
