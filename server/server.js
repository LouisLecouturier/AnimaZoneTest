const express = require("express");
const path = require("path");
const { sequelize } = require("./models");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { auth } = require("./middlewares/Auth");

const multer = require("multer");

const upload = multer({ dest: "uploads/" });

require("dotenv").config();

const app = express();

var corsOptions = {
  credentials: true,
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;

app.use(express.static(path.join(__dirname, "build")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Auth
const authentication = require("./controllers/authentication");

app.post(
  "/token/refresh",
  async (req, res) => await authentication.refreshAccessToken(req, res)
);

app.get("/protected", auth, (req, res) => {
  return res.json({ message: "Protected content" });
});

// User
const user = require("./controllers/user");

app.post("/login", async (req, res) => await user.login(req, res));
app.post("/register", async (req, res) => await user.register(req, res));
app.post("/logout", async (req, res) => await user.logout(req, res));

app.get("/user", auth, async (req, res) => user.getUser(req, res));
app.put("/user/update/city", auth, async (req, res) =>
  user.updateCity(req, res)
);
app.put("/user/update/email", auth, async (req, res) =>
  user.updateEmail(req, res)
);
app.put("/user/update/password", auth, async (req, res) =>
  user.updatePassword(req, res)
);
app.delete("/user/delete", auth, async (req, res) => user.deleteUser(req, res));

//association

const association = require("./controllers/association");

app.post("/associations/create", auth, async (req, res) =>
  association.register(req, res)
);

app.post("/association/create/check/siret", auth, async (req, res) =>
  association.checkSiret(req, res)
);
app.post(
  "/association/create/check/association-number",
  auth,
  async (req, res) => association.checkAssoNumber(req, res)
);

app.get("/association", auth, async (req, res) =>
  association.getData(req, res)
);
app.get("/associations/owner", auth, async (req, res) =>
  association.getOwner(req, res)
);

app.put("/associations/update/owner", auth, async (req, res) =>
  association.updateOwner(req, res)
);
app.put("/associations/update/association", auth, async (req, res) =>
  association.updateAssociation(req, res)
);

app.get("/associations/public/:id", async (req, res) =>
  association.getPublicData(req, res)
);
app.get("/associations/public/", async (req, res) =>
  association.getPublicData(req, res)
);
app.put("/associations/edit/", upload.single("image"), auth, async (req, res) =>
  association.setInfos(req, res)
);
app.delete("/association/delete/", auth, async (req, res) =>
  association.deleteAssociation(req, res)
);

// Listing
const listing = require("./controllers/listing");
app.post(
  "/create-listing",
  upload.fields([
    {
      name: "image1",
      maxCount: 1,
    },
    {
      name: "image2",
      maxCount: 1,
    },
    {
      name: "image3",
      maxCount: 1,
    },
  ]),
  auth,
  async (req, res) => {
    listing.createListing(req, res);
  }
);
app.get("/listing/:id", async (req, res) => listing.getListing(req, res));
app.get("/listings/", async (req, res) => listing.getAllListings(req, res));
app.get("/listings/:category", async (req, res) =>
  listing.getListingsByCategory(req, res)
);
app.get("/association/:id/listings", async (req, res) =>
  association.getListings(req, res)
);
app.put(
  "/associations/listings/update/listing=:listingId",
  upload.fields([
    {
      name: "image1",
      maxCount: 1,
    },
    {
      name: "image2",
      maxCount: 1,
    },
    {
      name: "image3",
      maxCount: 1,
    },
  ]),
  auth,
  async (req, res) => listing.updateListing(req, res)
);
app.delete(
  "/associations/listings/delete/listing=:listingId",
  auth,
  async (req, res) => listing.deleteListing(req, res)
);

// search

app.get("/search/query=:query&category=:category", async (req, res) =>
  listing.search(req, res)
);

// Start Server

app.listen({ port: PORT }, async () => {
  console.log("server up on http://localhost:8080");
  await sequelize.authenticate();
  console.log("DB Connected !");
});
