const {
  Association,
  Association_info,
  Listing,
  User,
  Owner,
} = require("../models");
const fs = require("fs");

const util = require("util");

const unlinkFile = util.promisify(fs.unlink);
const { Op } = require("sequelize");

const { uploadFile, deleteFile } = require("../services/s3");

const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../controllers/authentication");

const register = async (req, res) => {
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

    const {
      civilite,
      lastname,
      firstname,
      email,
      phone,
      address,
      city,
      postCode,
      assoName,
      assoObject,
      assoAddress,
      assoCity,
      assoPostCode,
      assoSiretNumber,
      assoNumber,
    } = req.body;

    let isAssociation = await Association.findOne({
      where: {
        [Op.and]: [
          { siret: assoSiretNumber },
          { association_number: assoNumber },
        ],
      },
    });

    if (isAssociation) {
      return res
        .status(400)
        .json({ error: "N° de SIRET ou n° d'association déjà utilisés" });
    } else {
      await Association.create({
        user_id: user.id,
        name: assoName,
        object: assoObject,
        address: assoAddress,
        city: assoCity,
        post_code: assoPostCode,
        siret: assoSiretNumber,
        association_number: assoNumber,
      });
    }

    const association = await Association.findOne({
      where: { user_id: user.id },
    });
    //Generate access token
    const accessToken = generateAccessToken(user, association);
    const refreshToken = generateRefreshToken(user, association);

    await user.update({ refreshToken });

    const isOwner = await Owner.findOne({
      where: { association_id: association.id },
    });

    if (!isOwner) {
      await Owner.create({
        association_id: association.id,
        firstname,
        lastname,
        gender: civilite,
        email,
        phone,
        address,
        city,
        post_code: postCode,
      });
    }

    return res.status(200).json({
      hasAssociation: true,
      accessToken,
      refreshToken,
      association_uuid: association.uuid,
      association_id: association.id,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const checkSiret = async (req, res) => {
  const accessToken = req.headers["x-access-token"].split(" ")[1];

  if (!accessToken) {
    return res.status(400).json({ auth: false });
  }
  const decoded = jwt.decode(accessToken, process.env.JWT_KEY);

  if (!decoded) {
    return res.status(401).json("invalid token");
  }

  let data = req.body.data;
  console.log(data);

  let isAsso = await Association.findOne({
    where: { siret: data },
  });

  if (isAsso) {
    return res.json({ exists: true });
  } else {
    return res.status(200).json({ exists: false });
  }
};
const checkAssoNumber = async (req, res) => {
  const accessToken = req.headers["x-access-token"].split(" ")[1];

  if (!accessToken) {
    return res.status(400).json({ auth: false });
  }
  const decoded = jwt.decode(accessToken, process.env.JWT_KEY);

  if (!decoded) {
    return res.status(401).json("invalid token");
  }

  let data = req.body.data;

  let isAsso = await Association.findOne({
    where: { association_number: data },
  });

  if (isAsso) {
    return res.json({ exists: true });
  } else {
    return res.status(200).json({ exists: false });
  }
};

const getData = async (req, res) => {
  const accessToken = req.headers["x-access-token"].split(" ")[1];

  if (!accessToken) {
    return res.status(400).json({ auth: false });
  }
  const decoded = jwt.decode(accessToken, process.env.JWT_KEY);
  console.log(decoded);

  if (!decoded) {
    return res.status(401).json("invalid token");
  }

  let asso_id = decoded.association_id;
  try {
    const association = await Association.findOne({
      where: { id: asso_id },
    });
    return res.json(association);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const getPublicData = async (req, res) => {
  let id = req.params.id;
  const accessToken = req.headers["x-access-token"].split(" ")[1];

  try {
    if (!id) {
      const decoded = jwt.decode(accessToken, process.env.JWT_KEY);

      if (!decoded) {
        return res.status(401).json("Invalid token");
      }

      let associationInfo = await Association_info.findOne({
        where: { association_id: id ? id : decoded.association_id },
      });
      if (!associationInfo) {
        associationInfo = false;
      }

      return res.status(200).json(associationInfo);
    } else {
      let associationInfo = await Association_info.findOne({
        where: { association_id: id },
      });
      if (!associationInfo) {
        associationInfo = false;
      }

      return res.status(200).json(associationInfo);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const getOwner = async (req, res) => {
  const accessToken = req.headers["x-access-token"].split(" ")[1];

  if (!accessToken) {
    return res.status(400).json({ auth: false });
  }
  const decoded = jwt.decode(accessToken, process.env.JWT_KEY);

  if (!decoded) {
    return res.status(401).json("invalid token");
  }

  let asso_id = decoded.association_id;
  try {
    const owner = await Owner.findOne({
      where: { association_id: asso_id },
    });
    return res.json(owner);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const updateOwner = async (req, res) => {
  const accessToken = req.headers["x-access-token"].split(" ")[1];
  let data = req.data;

  if (!accessToken) {
    return res.status(400).json({ auth: false });
  }
  const decoded = jwt.decode(accessToken, process.env.JWT_KEY);

  if (!decoded) {
    return res.status(401).json("invalid token");
  }

  let asso_id = decoded.association_id;
  try {
    const owner = await Owner.update(
      { ...data },
      {
        where: { association_id: asso_id },
      }
    );
    return res.json(owner);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};
const updateAssociation = async (req, res) => {
  const accessToken = req.headers["x-access-token"].split(" ")[1];

  let data = req.body;

  if (!accessToken) {
    return res.status(400).json({ auth: false });
  }
  const decoded = jwt.decode(accessToken, process.env.JWT_KEY);

  if (!decoded) {
    return res.status(401).json("invalid token");
  }

  let asso_id = decoded.association_id;
  try {
    const association = await Association.update(
      { ...data },
      {
        where: { id: asso_id },
      }
    );
    return res.status(200).json(association);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

const getListings = async (req, res) => {
  let association_id = req.params.id;

  const listings = await Listing.findAll({
    where: { association_id: association_id },
  });

  return res.status(200).json({ listings: listings });
};

const setInfos = async (req, res) => {
  const accessToken = req.headers["x-access-token"].split(" ")[1];

  if (!accessToken) {
    return res.status(400).json({ auth: false });
  }
  const decoded = jwt.decode(accessToken, process.env.JWT_KEY);

  if (!decoded) {
    return res.status(401).json("invalid token");
  }
  let asso_id = decoded.association_id;

  let data = req.body;

  const associationInfo = await Association_info.findOne({
    where: { association_id: asso_id },
  });

  if (associationInfo) {
    try {
      if (req.file && req.file !== undefined) {
        var change_image = await deleteFile(associationInfo.image)
          .then(async () => {
            let req_file = [req.file];
            let file = await uploadFile(req_file);
            return file;
          })
          .then((file) => {
            associationInfo.update(
              { ...data, isComplete: true, image: file },
              {
                where: {
                  association_id: asso_id,
                },
              }
            );
          })
          .then(() => {
            return res.status(200).json("Profile updated");
          });
      } else {
        associationInfo.update(
          { ...data, isComplete: true, image: associationInfo.image },
          {
            where: {
              association_id: asso_id,
            },
          }
        );
      }
      return res.status(200).json("Profile updated");
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  } else {
    try {
      let file = [req.file];
      await uploadFile(file)
        .then((image) => {
          Association_info.create({
            ...data,
            association_id: asso_id,
            isComplete: true,
            image: image,
          });
        })
        .then(() => {
          return res.status(200).json("Profile created");
        });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  }
};

const deleteAssociation = async (req, res) => {
  const accessToken = req.headers["x-access-token"].split(" ")[1];

  if (!accessToken) {
    return res.status(400).json({ auth: false });
  }
  const decoded = jwt.decode(accessToken, process.env.JWT_KEY);

  if (!decoded) {
    return res.status(401).json("invalid token");
  }

  let asso_id = decoded.association_id;
  try {
    await Association.destroy({
      where: { id: asso_id },
    });
    await Listing.destroy({
      where: { association_id: asso_id },
    });
    await Owner.destroy({
      where: { association_id: asso_id },
    });
    await Association_info.destroy({
      where: { association_id: asso_id },
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Something went wrong" });
  }
};

module.exports = {
  register,
  checkSiret,
  checkAssoNumber,
  setInfos,
  getData,
  getPublicData,
  getOwner,
  updateOwner,
  updateAssociation,
  getListings,
  deleteAssociation,
};
