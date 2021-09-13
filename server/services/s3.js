const S3 = require("aws-sdk/clients/s3");
const fs = require("fs");

const util = require("util");

const unlinkFile = util.promisify(fs.unlink);

const bucketName = process.env.AWS_BUCKET_NAME;
const region = process.env.AWS_BUCKET_REGION;
const accessKeyId = process.env.AWS_ACCESS_KEY;
const secretAccessKey = process.env.AWS_SECRET_KEY;

const s3 = new S3({
  region,
  accessKeyId,
  secretAccessKey,
});

// Upload a file to S3
const uploadFile = async (file) => {
  const fileStream = fs.createReadStream(file[0].path);

  const uploadParams = {
    Bucket: bucketName,
    Body: fileStream,
    Key: file[0].filename,
  };

  let url = await s3
    .upload(uploadParams)
    .promise()
    .then((res) => {
      return res.Location;
    });

  console.log(url);

  await unlinkFile(file[0].path);
  return url;
};

const deleteFile = async (file) => {
  let path = file.replace(
    "https://animazone-dev.s3.eu-west-3.amazonaws.com/",
    ""
  );
  console.log(path);
  const params = {
    Bucket: bucketName,
    Key: path,
  };

  await s3.deleteObject(params, (error, data) => {
    if (error) {
      console.log(error);
    }
  });
};

// Downloads a file from S3

module.exports = { uploadFile, deleteFile };
