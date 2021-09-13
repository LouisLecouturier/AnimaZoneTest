const yee = (req, res) => {
  console.log("yee executed");
  return res.status(200).json("yee");
};

exports.yee = yee;
