const express = require("express");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");

const axios = require('axios');

const app = express();
const storage = multer.memoryStorage();
const upload = multer({ storage });


// Middleware to parse JSON and handle CORS if needed
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static("./uploads"));



app.post('/fetch-xml-data', async (req, res) => {
  const apiUrl = "https://api23.sapsf.com/odata/v2/Photo?$filter=userId eq '28459'&photoType=20&$format=json"; // Replace with the actual API URL
  const username = 'CPIADMIN1@nationalagD';
  const password = 'Nttdata@2023';

  try {

    // Make a GET request to the third-party API with Basic Authentication
    const response = await axios.get(apiUrl, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
    });

    let entry = response.data.d.results;
    let base64Data = entry[2].photo;

    let base64String = JSON.stringify(base64Data);
    const stringWithoutLineBreaks = base64String.replace(/\\r\\n/gm, '');

    if (!stringWithoutLineBreaks) {
      return res.status(400).json({ error: 'Base64 image data is required.' });
    }

    // Decode the base64 image to a buffer
    const imageBuffer = Buffer.from(stringWithoutLineBreaks, 'base64');

    // Resize the image to 50x50 and save it as a PNG file
    const resizedImageBuffer = await sharp(imageBuffer)
      .resize(50, 50)
      .png({ quality: 20 })
      .toBuffer();

    // Convert the resized image buffer to a base64-encoded string
    const resizedImageBase64 = resizedImageBuffer.toString('base64');

    return res.json({ base64Image: resizedImageBase64 });


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch data from the third-party API' });
  }
});


































app.get("/", (req, res) => {
  return res.json({ message: "Hello world 🔥🇵🇹" });
});

/*
 @method POST /
 @param {binary image data, Multipart} picture
 @return {string} link
 @desc to compress the uploaded image to a URL string
*/
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

/*
 @method POST /uploads
 @param {binary image data, Multipart} picture
 @return base64-encoded string containing the uploaded file contents and the original file name 
 @desc to compress the uploaded image to a base64-encoded string
*/
app.post("/buffer", upload.single("picture"), async (req, res) => {
  fs.access("./uploads", (error) => {
    if (error) {
      fs.mkdirSync("./uploads");
    }
  });
  const { buffer, originalname } = req.file;

  const timestamp = Date.now();

  const ref = `${timestamp}-${originalname.replace(/\s/g, "_")}.png`; // Replace spaces with underscores

  // Resize the image to 50x50 and save it as a PNG file
  const resizedImageBuffer = await sharp(buffer)
    .resize(50, 50)
    .png({ quality: 20 })
    .toBuffer();

  console.log(resizedImageBuffer);
  // Convert the resized image buffer to a base64-encoded string
  const resizedImageBase64 = resizedImageBuffer.toString("base64");

  return res.json({ base64Image: resizedImageBase64 });
});

app.listen(3000, () => {
  console.log("Running on port 3000.");
});

// Export the Express API
module.exports = app;
