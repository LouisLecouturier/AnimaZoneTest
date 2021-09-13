const { User, Association } = require("./../models");

const { sign, verify } = require("jsonwebtoken");

const generateAccessToken = (user, association) => {
  return sign(
    { uuid: user.uuid, association_id: association ? association.id : null },
    process.env.JWT_KEY,
    {
      expiresIn: "15m",
    }
  );
};

const generateRefreshToken = (user, association) => {
  return sign(
    { uuid: user.uuid, association_id: association ? association.id : null },
    process.env.JWT_KEY,
    {
      expiresIn: "15d",
    }
  );
};

const refreshAccessToken = (req, res) => {
  const refreshToken = req.body.token;
  if (!refreshToken) {
    return res.status(401).json({ error: "User not authenticated" });
  }

  verify(refreshToken, process.env.JWT_KEY, async (err, jwt_user) => {
    if (!err) {
      const user = await User.findOne({
        where: { uuid: jwt_user.uuid },
      });

      const association = await Association.findOne({
        where: { user_id: user.id },
      });

      if (!user.refreshToken || user.refreshToken != refreshToken) {
        return res.status(400).json({ error: "User not authenticated" });
      }

      const accessToken = generateAccessToken(user, association);
      const newRefreshToken = generateRefreshToken(user, association);

      user.update({ refreshToken: newRefreshToken });

      return res.status(201).json({
        success: true,
        accessToken,
        refreshToken: newRefreshToken,
      });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "User is not authenticated" });
    }
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  refreshAccessToken,
};
