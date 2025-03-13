const express = require("express");
const multer = require("multer");
const fs = require("fs");
const tf = require("@tensorflow/tfjs-node");
const bodyPix = require("@tensorflow-models/body-pix");
const { createCanvas, loadImage } = require("canvas");

const app = express();
const upload = multer({ dest: "uploads/" });

// TensorFlow Model Load
let net;
async function loadModel() {
  net = await bodyPix.load();
}
loadModel();

// Image Background Removal Function
async function removeBackground(imagePath) {
  const image = await loadImage(imagePath);
  const canvas = createCanvas(image.width, image.height);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(image, 0, 0);
  const segmentation = await net.segmentPerson(image);
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pixels = imageData.data;

  for (let i = 0; i < pixels.length; i += 4) {
    if (segmentation.data[i / 4] === 0) {
      pixels[i + 3] = 0; // Alpha (Transparent)
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toBuffer();
}

// API for Image Upload and Background Removal
app.post("/remove-bg", upload.single("image"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");
  
  const processedImage = await removeBackground(req.file.path);
  
  fs.unlinkSync(req.file.path); // Delete original image
  res.setHeader("Content-Type", "image/png");
  res.send(processedImage);
});

// Serve Frontend Directly
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AI Background Remover</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; margin: 20px; }
          img { max-width: 500px; display: none; margin-top: 20px; }
        </style>
    </head>
    <body>
        <h2>Upload Image for Background Removal</h2>
        <input type="file" id="fileInput">
        <button onclick="uploadImage()">Upload</button>
        <br><br>
        <img id="outputImage">
        
        <script>
            async function uploadImage() {
                const fileInput = document.getElementById("fileInput");
                if (!fileInput.files.length) return alert("Please select an image!");

                let formData = new FormData();
                formData.append("image", fileInput.files[0]);

                let response = await fetch("/remove-bg", {
                    method: "POST",
                    body: formData
                });

                let blob = await response.blob();
                let imgUrl = URL.createObjectURL(blob);
                document.getElementById("outputImage").src = imgUrl;
                document.getElementById("outputImage").style.display = "block";
            }
        </script>
    </body>
    </html>
  `);
});

// Start Server
app.listen(3000, () => console.log("Server running on port 3000"));
