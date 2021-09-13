const { Op } = require("sequelize");
const { Listing, Association } = require("../models");

const { uploadFile, deleteFile } = require("../services/s3");
const jwt = require("jsonwebtoken");

const createListing = async (req, res) => {
  const accessToken = req.headers["x-access-token"].split(" ")[1];

  if (!accessToken) {
    return res.status(400).json({ auth: false });
  }
  const decoded = jwt.decode(accessToken, process.env.JWT_KEY);

  if (!decoded) {
    return res.status(401).json("invalid token");
  }

  let asso_id = decoded.association_id;

  const data = req.body;
  console.log(data);

  const association = await Association.findOne({
    where: { id: asso_id },
  });

  if (association) {
    try {
      let files = [req.files.image1, req.files.image2, req.files.image3];

      let uploadedFiles = await files.map(async (file) => {
        let uploadedFile = await uploadFile(file);
        return uploadedFile;
      });

      Promise.all(uploadedFiles).then(async (files) => {
        const listing = await Listing.create({
          ...data,
          sterilized: data.sterilized === "true" ? true : false,
          identified: data.identified === "true" ? true : false,
          dewormed: data.dewormed === "true" ? true : false,
          rage_vaccinated: data.rage_vaccinated === "true" ? true : false,
          // Chats
          typhus_vaccinated: data.typhus_vaccinated === "true" ? true : false,
          coryza_vaccinated: data.coryza_vaccinated === "true" ? true : false,
          felv_test: data.felv_test === "true" ? true : false,
          fiv_test: data.fiv_test === "true" ? true : false,
          felv_vaccinated: data.felv_vaccinated === "true" ? true : false,
          // Lapin
          myxomatosis_vaccinated:
            data.myxomatosis_vaccinated === "true" ? true : false,
          rh_vaccinated: data.rh_vaccinated === "true" ? true : false,
          // Chiens
          square_disease_vaccinated:
            data.square_disease_vaccinated === "true" ? true : false,
          parvovirose_vaccinated:
            data.parvovirose_vaccinated === "true" ? true : false,
          hepatitis_vaccinated:
            data.hepatitis_vaccinated === "true" ? true : false,
          leptospirosis_vaccinated:
            data.leptospirosis_vaccinated === "true" ? true : false,
          association_id: asso_id,
          city: data.city.toLowerCase(),
          image1: files[0],
          image2: files[1],
          image3: files[2],
        });
        return res.json(listing);
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json(err);
    }
  } else {
    return res.status(401).json("Something went wrong");
  }
};

const updateListing = async (req, res) => {
  const accessToken = req.headers["x-access-token"].split(" ")[1];

  if (!accessToken) {
    return res.status(400).json({ auth: false });
  }
  const decoded = jwt.decode(accessToken, process.env.JWT_KEY);

  if (!decoded) {
    return res.status(401).json("invalid token");
  }

  let listing_id = req.params.listingId;
  let asso_id = decoded.association_id;

  let data = req.body;
  let files = [req.files.image1, req.files.image2, req.files.image3];

  let listing = await Listing.findOne({
    where: {
      [Op.and]: [{ id: listing_id }, { association_id: asso_id }],
    },
  }).then(async (listing) => {
    await files.map(async (file, index) => {});
    if (files[0] !== undefined) {
      await deleteFile(listing.image1);
    }
    if (files[1] !== undefined) {
      await deleteFile(listing.image2);
    }
    if (files[2] !== undefined) {
      await deleteFile(listing.image3);
    }

    return listing;
  });

  let uploadedFiles = await files.map(async (file, index) => {
    if (files[index] !== undefined) {
      let uploadedFile = await uploadFile(file);
      return uploadedFile;
    } else {
      return null;
    }
  });

  Promise.all(uploadedFiles).then(async (files) => {
    delete data.id;
    delete data.associationUuid;

    await Listing.update(
      {
        ...data,
        image1: files[0] ? files[0] : listing.image1,
        image2: files[1] ? files[1] : listing.image2,
        image3: files[2] ? files[2] : listing.image3,
      },
      {
        where: {
          [Op.and]: [{ id: listing_id }, { association_id: asso_id }],
        },
      }
    ).then(() => {
      return res.status(200).json("Listing updated");
    });
  });
};

const getListing = async (req, res) => {
  const id = req.params.id;

  try {
    const listing = await Listing.findOne({
      where: { id },
    });
    return res.json(listing);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

const getAllListings = async (req, res) => {
  try {
    const listings = await Listing.findAll();
    return res.json(listings);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

const getListingsByCategory = async (req, res) => {
  let category = req.params.category;
  try {
    const listings = await Listing.findAll({ where: { category: category } });
    return res.json(listings);
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

const deleteListing = async (req, res) => {
  const accessToken = req.headers["x-access-token"].split(" ")[1];

  if (!accessToken) {
    return res.status(400).json({ auth: false });
  }
  const decoded = jwt.decode(accessToken, process.env.JWT_KEY);

  if (!decoded) {
    return res.status(401).json("invalid token");
  }

  let listing_id = req.params.listingId;
  let asso_id = decoded.association_id;

  try {
    await Listing.findOne({
      where: {
        [Op.and]: [{ id: listing_id }, { association_id: asso_id }],
      },
    })
      .then(async (listing) => {
        await deleteFile(listing.image1);
        await deleteFile(listing.image2);
        await deleteFile(listing.image3);

        return listing;
      })
      .then((listing) => listing.destroy());
    return res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json(err);
  }
};

const search = async (req, res) => {
  let query = req.params.query;
  let category = req.params.category;
  try {
    if (category === "all") {
      await Listing.findAll({
        where: {
          [Op.and]: [
            { category },
            {
              [Op.or]: [
                { name: { [Op.like]: "%" + query + "%" } },
                { city: { [Op.like]: "%" + query.toLowerCase() + "%" } },
                { about1: { [Op.like]: "%" + query + "%" } },
                { about2: { [Op.like]: "%" + query + "%" } },
                { about3: { [Op.like]: "%" + query + "%" } },
              ],
            },
          ],
        },
      }).then((results) => res.status(200).json(results));
    } else {
      await Listing.findAll({
        where: {
          [Op.or]: [
            { name: { [Op.like]: "%" + query + "%" } },
            { category: { [Op.like]: "%" + query.toLowerCase() + "%" } },
            { city: { [Op.like]: "%" + query.toLowerCase() + "%" } },
            { about1: { [Op.like]: "%" + query + "%" } },
            { about2: { [Op.like]: "%" + query + "%" } },
            { about3: { [Op.like]: "%" + query + "%" } },
          ],
        },
      }).then((results) => res.status(200).json(results));
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json("Something went wrong");
  }
};

module.exports = {
  createListing,
  updateListing,
  getListing,
  getAllListings,
  getListingsByCategory,
  deleteListing,
  search,
};
