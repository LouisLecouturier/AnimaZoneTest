const { uploadFile } = require("./s3");
const fs = require("fs");
const util = require("util");

const unlinkFile = util.promisify(fs.unlink);

const uploadReq = async (req, res) => {
  const files = req.files;

  await files.forEach(async (file) => {
    console.log(file);
    const result = await uploadFile(file);
    console.log(result);
  });
};

const uploadFiles = async (files) => {
  var results = [];
  await files.forEach(async (file) => {
    
    await uploadFile(file).then((result) => results.push(result));
  });

  return results;
};

module.exports = { uploadReq, uploadFiles };
