const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.static("./uploads"));

app.get("/", (req, res) => {
  return res.json({ message: "Hello world 🔥🇵🇹" });
});

app.post("/", upload.single("picture"), async (req, res) => {
  fs.access("./uploads", (error) => {
    if (error) {
      fs.mkdirSync("./uploads");
    }
  });
  const { buffer, originalname } = req.file;

  const timestamp = Date.now();

  const ref = `${timestamp}-${originalname.replace(/\s/g, "_")}.png`; // Replace spaces with underscores

  // Resize the image to 50x50 and save it as a PNG file
  await sharp(buffer)
    .resize(50, 50)
    .png({ quality: 20 })
    .toFile("./uploads/" + ref);

  const link = `http://localhost:3000/${ref}`;
  return res.json({ link });
});

app.listen(3000, () => {
  console.log("Running on port 3000.");
});

// Export the Express API
module.exports = app;
