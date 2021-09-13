const express = require("express");
const path = require("path");
const { sequelize } = require("./models");
const cookieParser = require("cookie-parser");

const cors = require("cors");
const { auth } = require("./middlewares/Auth");

const multer = require("multer");

const upload = multer({ dest: "uploads/" });

require("dotenv").config();

const app = express();

const buildPath = path.join(__dirname, "..", "build");
app.use(express.static(buildPath));

var corsOptions = {
  credentials: true,
};

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT;

// Auth
const authentication = require("./controllers/authentication");

app.post(
  "/api/token/refresh",
  async (req, res) => await authentication.refreshAccessToken(req, res)
);

app.get("/api/protected", auth, (req, res) => {
  return res.json({ message: "Protected content" });
});

// User
const user = require("./controllers/user");

app.post("/api/login", async (req, res) => await user.login(req, res));
app.post("/api/register", async (req, res) => await user.register(req, res));
app.post("/api/logout", async (req, res) => await user.logout(req, res));

app.get("/api/user", auth, async (req, res) => user.getUser(req, res));
app.put("/api/user/update/city", auth, async (req, res) =>
  user.updateCity(req, res)
);
app.put("/api/user/update/email", auth, async (req, res) =>
  user.updateEmail(req, res)
);
app.put("/api/user/update/password", auth, async (req, res) =>
  user.updatePassword(req, res)
);
app.delete("/api/user/delete", auth, async (req, res) =>
  user.deleteUser(req, res)
);

//association

const association = require("./controllers/association");

app.post("/api/associations/create", auth, async (req, res) =>
  association.register(req, res)
);

app.post("/api/association/create/check/siret", auth, async (req, res) =>
  association.checkSiret(req, res)
);
app.post(
  "/api/association/create/check/association-number",
  auth,
  async (req, res) => association.checkAssoNumber(req, res)
);

app.get("/api/association", auth, async (req, res) =>
  association.getData(req, res)
);
app.get("/api/associations/owner", auth, async (req, res) =>
  association.getOwner(req, res)
);

app.put("/api/associations/update/owner", auth, async (req, res) =>
  association.updateOwner(req, res)
);
app.put("/api/associations/update/association", auth, async (req, res) =>
  association.updateAssociation(req, res)
);

app.get("/api/associations/public/:id", async (req, res) =>
  association.getPublicData(req, res)
);
app.get("/api/associations/public/", async (req, res) =>
  association.getPublicData(req, res)
);
app.put(
  "/api/associations/edit/",
  upload.single("image"),
  auth,
  async (req, res) => association.setInfos(req, res)
);
app.delete("/api/association/delete/", auth, async (req, res) =>
  association.deleteAssociation(req, res)
);

// Listing
const listing = require("./controllers/listing");
app.post(
  "/api/create-listing",
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
app.get("/api/listing/:id", async (req, res) => listing.getListing(req, res));
app.get("/api/listings/", async (req, res) => listing.getAllListings(req, res));
app.get("/api/listings/:category", async (req, res) =>
  listing.getListingsByCategory(req, res)
);
app.get("/api/association/:id/listings", async (req, res) =>
  association.getListings(req, res)
);
app.put(
  "/api/associations/listings/update/listing=:listingId",
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
  "/api/associations/listings/delete/listing=:listingId",
  auth,
  async (req, res) => listing.deleteListing(req, res)
);

// search

app.get("/api/search/query=:query&category=:category", async (req, res) =>
  listing.search(req, res)
);

app.use(express.static(path.join(__dirname, "build")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Start Server

app.listen({ port: 8080 }, async () => {
  await sequelize.authenticate();
});
