const {
  Association,
  Association_info,
  User,
  Owner,
  Listing,
} = require("../models");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../controllers/authentication");

const { uploadFile, deleteFile } = require("../services/s3");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const logout = async (req, res) => {
  const accessToken = req.headers["x-access-token"].split(" ")[1];

  if (!accessToken) {
    return res.status(401).json({ auth: false });
  }
  const decoded = jwt.decode(accessToken, process.env.JWT_KEY);
  const uuid = decoded.uuid;
  try {
    const user = await User.findOne({
      where: { uuid },
    });
    user.refreshToken = "";
    await user.save();
    return res.status(200).json({ message: "You've been disconnected" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const register = async (req, res) => {
  const { firstname, lastname, email, password } = req.body;
  const user = await User.findOne({ where: { email: email } });

  if (user) {
    return res
      .status(400)
      .json({ error: "Cette adresse mail est déjà utilisée" });
  }
  bcrypt
    .hash(password, 12)
    .then((hash) => {
      User.create({
        firstname: firstname,
        lastname: lastname,
        email: email,
        password: hash,
      });
    })
    .then(() => {
      return res.json({ success: true });
    })
    .catch((error) => {
      if (error) {
        console.log(error);
        return res.status(500).json(error);
      }
    });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email: email } });

  if (!user) {
    res.status(400).json({ error: "Cet utilisateur n'existe pas" });
  }
  const dbPassword = user.password;
  bcrypt.compare(password, dbPassword).then(async (match) => {
    if (!match) {
      return res.status(404).json({ error: "Email ou mot de passe incorrect" });
    } else {
      const association = await Association.findOne({
        where: { user_id: user.id },
      });
      //Generate access token
      const accessToken = generateAccessToken(user, association);
      const refreshToken = generateRefreshToken(user, association);

      await user.update({ refreshToken });

      if (association) {
        return res.json({
          auth: true,
          hasAssociation: true,
          association_uuid: association.uuid,
          association_id: association.id,
          accessToken,
          refreshToken,
        });
      } else {
        return res.json({
          auth: true,
          hasAssociation: false,
          association_uuid: null,
          association_id: null,
          accessToken,
          refreshToken,
        });
      }
    }
  });
};

const getUser = async (req, res) => {
  const accessToken = req.headers["x-access-token"].split(" ")[1];

  if (!accessToken) {
    return res.status(400).json({ auth: false });
  }
  const decoded = jwt.decode(accessToken, process.env.JWT_KEY);
  const uuid = decoded.uuid;
  try {
    const user = await User.findOne({
      where: { uuid },
    });
    return res.json(user);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const updateCity = async (req, res) => {
  const accessToken = req.headers["x-access-token"].split(" ")[1];

  if (!accessToken) {
    return res.status(400).json({ auth: false });
  }
  let { city } = req.body;

  const decoded = jwt.decode(accessToken, process.env.JWT_KEY);
  const uuid = decoded.uuid;

  try {
    User.update(
      {
        city: city.toLowerCase(),
      },
      {
        where: { uuid },
      }
    );
    return res.status(200).json("updated");
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const updateEmail = async (req, res) => {
  const accessToken = req.headers["x-access-token"].split(" ")[1];

  if (!accessToken) {
    return res.status(400).json({ auth: false });
  }

  let { email } = req.body;

  const decoded = jwt.decode(accessToken, process.env.JWT_KEY);
  const uuid = decoded.uuid;

  User.findOne({ where: { email } }).then((user) => {
    if (!user) {
      try {
        User.update(
          {
            email,
          },
          {
            where: { uuid },
          }
        );
        return res.status(200).json("updated");
      } catch (err) {
        console.log(err);
        return res.status(500).json({ error: "Something went wrong" });
      }
    } else {
      return res.status(400).json({ error: "Email déjà utilisé" });
    }
  });
};

const updatePassword = async (req, res) => {
  const { password, newPassword } = req.body;

  const accessToken = req.headers["x-access-token"].split(" ")[1];

  if (!accessToken) {
    return res.status(400).json({ auth: false });
  }

  const decoded = jwt.decode(accessToken, process.env.JWT_KEY);
  const uuid = decoded.uuid;

  User.findOne({ where: { uuid } }).then((user) => {
    let dbPassword = user.password;
    bcrypt.compare(password, dbPassword).then(async (match) => {
      if (!match) {
        return res.status(404).json({ error: "Mot de passe incorrect" });
      } else {
        if (user) {
          try {
            bcrypt
              .hash(newPassword, 12)
              .then((hash) => {
                User.update(
                  {
                    password: hash,
                  },
                  { where: { uuid } }
                );
              })
              .then(() => {
                return res.status(200).json("updated");
              });
          } catch (err) {
            console.log(err);
            return res.status(500).json({ error: "Something went wrong" });
          }
        } else {
          return res.status(400).json({ error: "Something went wrong" });
        }
      }
    });
  });
};

const deleteUser = async (req, res) => {
  const accessToken = req.headers["x-access-token"].split(" ")[1];

  if (!accessToken) {
    return res.status(400).json({ auth: false });
  }

  const decoded = jwt.decode(accessToken, process.env.JWT_KEY);
  const uuid = decoded.uuid;

  try {
    let retrieveUser = new Promise(async (resolve) => {
      await User.findOne({ where: { uuid } }).then((user) => {
        resolve(user);
      });
    });

    let retrieveAsso = new Promise(async (resolve) => {
      await User.findOne({ where: { uuid } }).then(async (user) => {
        let association = await Association.findOne({
          where: { user_id: user.id },
        });
        resolve(association);
      });
    });

    let retrieveAssoInfo = new Promise(async (resolve) => {
      await User.findOne({ where: { uuid } }).then(async (user) => {
        await Association.findOne({
          where: { user_id: user.id },
        }).then(async (association) => {
          if (association) {
            let associationInfo = await Association_info.findOne({
              where: { association_id: association.id },
            });
            resolve(associationInfo);
          } else {
            resolve(null);
          }
        });
      });
    });
    let retrieveOwner = new Promise(async (resolve) => {
      await User.findOne({ where: { uuid } }).then(async (user) => {
        await Association.findOne({
          where: { user_id: user.id },
        }).then(async (association) => {
          if (association) {
            let owner = await Owner.findOne({
              where: { association_id: association.id },
            });
            resolve(owner);
          } else {
            resolve(null);
          }
        });
      });
    });

    //
    // await deleteFile(listing.image1);
    //         await deleteFile(listing.image2);
    //         await deleteFile(listing.image3);

    let retrieveListings = new Promise(async (resolve) => {
      await User.findOne({ where: { uuid } }).then(async (user) => {
        await Association.findOne({
          where: { user_id: user.id },
        }).then(async (association) => {
          if (association) {
            let listings = await Listing.findAll({
              where: { association_id: association.id },
            });
            listings.forEach(async (listing) => {
              await deleteFile(listing.image1);
              await deleteFile(listing.image2);
              await deleteFile(listing.image3);
              await listing.destroy();
            });
            resolve(null);
          }
          resolve(null);
        });
      });
    });

    await Promise.all([
      retrieveUser,
      retrieveAsso,
      retrieveOwner,
      retrieveAssoInfo,
      retrieveListings,
    ])
      .then((results) => {
        results.forEach((result, index) => {
          if (result && index !== 4) result.destroy();
        });
      })
      .then(() => {
        return res.status(200).json({ ok: true });
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  register,
  login,
  logout,
  getUser,
  updateEmail,
  updateCity,
  updatePassword,
  deleteUser,
};
