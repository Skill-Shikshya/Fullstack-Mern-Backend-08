import express from "express";
import multer from "multer";

const app = express();

// Configure storage destination & filename
const upload = multer({ dest: "uploads/" });
app.get("/", (req, res) => {
  // console.log("Request received at:", req);
  console.log("Request received at:", req.params);
  console.log("Request received at:", req.body);

  res.send("hi there");
});

// 'avatar' matches the input field name: <input type="file" name="avatar" />
app.post("/upload", upload.single("avatar"), (req, res) => {
  // Access text fields
  console.log("Text fields:", req.body);

  // Access uploaded file metadata
  console.log("Uploaded file:", req.file);

  res.send({
    message: "File uploaded successfully",
    filename: req.file.filename,
    textData: req.body,
  });
});

app.listen(3000);
