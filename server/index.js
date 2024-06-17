const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/users");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb://127.0.0.1:27017/shutterOn");

const fs = require("fs");

const uploadDir = "./uploads";

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuration
cloudinary.config({
  cloud_name: "dqkb2musv",
  api_key: "672357665626387",
  api_secret: "w90RFy3YHM-MuvDEyRObiNVhdic",
});


app.post("/update-gallery", (req, res) => {
  const { userId, functionID, imageUrl } = req.body;

  UserModel.findOneAndUpdate(
    { userId, "events.functionID": functionID },
    { $push: { "events.$.gallery": imageUrl } },
    { new: true, useFindAndModify: false }
  )
    .then(() => {
      res.json({ message: "Gallery updated successfully" });
    })
    .catch((error) => {
      console.error("Error updating gallery in MongoDB:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

// Multer configuration for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Specify the directory where uploaded files will be stored
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Generate a unique filename for the uploaded file
  },
});

const upload = multer({ storage: storage });

app.post("/upload", upload.single("photo"), (req, res) => {
  const file = req.file;

  // Upload image to Cloudinary
  cloudinary.uploader.upload(file.path, (error, result) => {
    if (error) {
      console.error("Error uploading photo to Cloudinary:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
    
    // Return Cloudinary URL of the uploaded image
    res.json({ imageUrl: result.secure_url });
  });
});



app.delete("/delete-photo/:userId/:functionID/:photoUrl", (req, res) => {
  const { userId, functionID, photoUrl } = req.params;

  // Delete image from Cloudinary
  cloudinary.uploader.destroy(photoUrl, (error, result) => {
    if (error) {
      console.error("Error deleting photo from Cloudinary:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Delete image URL from the gallery in the database
    UserModel.findOneAndUpdate(
      { userId, "events.functionID": functionID },
      { $pull: { "events.$.gallery": photoUrl } },
      { new: true, useFindAndModify: false }
    )
      .then(() => {
        res.json({ message: "Photo deleted successfully" });
      })
      .catch((error) => {
        console.error("Error deleting photo from database:", error);
        res.status(500).json({ error: "Internal server error" });
      });
  });
});


app.post("/login", (req, res) => {
  const { email, password } = req.body;

  UserModel.findOne({ email }).then((user) => {
    if (user) {
      if (user.password === password) {
        res.json({
          success: true,
          userId: user.userId, // Use userId instead of _id
          name: user.name,
          email: user.email,
          phone: user.phone,
          events: user.events, // Include events in the response
        });
      } else {
        res.status(401).json("The Password is incorrect");
      }
    } else {
      res.status(404).json("Oops! No Account exists with this email");
    }
  });
});

app.post("/users", (req, res) => {
  const { email } = req.body;

  UserModel.findOne({ email }).then((user) => {
    if (user) {
      res.status(400).json({ error: "Email already exists. Please Login." });
    } else {
      UserModel.create(req.body)
        .then((user) => res.json(user))
        .catch((err) => res.status(500).json(err));
    }
  });
});

// for admin page

app.get("/users", (req, res) => {
  UserModel.find({})
    .then((users) => {
      res.json(users);
    })
    .catch((error) => {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

app.post("/users/:userId/events", (req, res) => {
  const userId = req.params.userId;
  const newEvent = req.body;

  // Check if the function ID already exists in the database
  UserModel.findOne({ "events.functionID": newEvent.functionID })
    .then((user) => {
      if (user) {
        return res.status(400).json({ error: "Function ID already exists." });
      }

      // If the function ID does not exist, proceed to add the event
      UserModel.findOneAndUpdate(
        { userId },
        { $push: { events: newEvent } },
        { new: true, useFindAndModify: false }
      )
        .then((user) => {
          if (!user) {
            return res.status(404).json({ error: "User not found" });
          }
          res.json(newEvent); // Return the newly added event with its unique function ID
        })
        .catch((error) => {
          console.error("Error adding event:", error);
          res.status(500).json({ error: "Internal server error" });
        });
    })
    .catch((error) => {
      console.error("Error checking function ID:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

app.get("/user/:id", (req, res) => {
  const userId = req.params.id;

  UserModel.findOne({ userId }) // Use findOne with userId
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    })
    .catch((error) => {
      console.error("Error fetching user data:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});



app.get("/hosts/:id", (req, res) => {
  const functionID = req.params.id;

  UserModel.findOne({ "events.functionID": functionID })
    .then((functionData) => {
      if (!functionData) {
        return res.status(404).json({ error: "Function not found" });
      }
      res.json(functionData.events.find(event => event.functionID === functionID));
    })
    .catch((error) => {
      console.error("Error fetching function data:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});



app.get("/events/check-function-id/:functionID", (req, res) => {
  const { functionID } = req.params;

  UserModel.findOne({ "events.functionID": functionID })
    .then((user) => {
      if (user) {
        return res.status(400).json({ error: "Function ID already exists." });
      }
      res.json({ message: "Function ID is available." });
    })
    .catch((error) => {
      console.error("Error checking function ID:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

app.get("/host/:userId/:functionID", (req, res) => {
  const { userId, functionID } = req.params;

  UserModel.findOne({ userId })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const event = user.events.find(
        (event) => event.functionID === functionID
      );
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      res.json(event);
    })
    .catch((error) => {
      console.error("Error fetching function data:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // Specify the directory where uploaded files will be stored
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + "-" + file.originalname); // Generate a unique filename for the uploaded file
//   },
// });
// const upload = multer({ storage: storage });

// app.get("/host/:userId/:functionID", (req, res) => {
//   const { userId, functionID } = req.params;

//   UserModel.findOne({ userId })
//     .then((user) => {
//       if (!user) {
//         return res.status(404).json({ error: "User not found" });
//       }
//       const event = user.events.find(
//         (event) => event.functionID === functionID
//       );
//       if (!event) {
//         return res.status(404).json({ error: "Event not found" });
//       }
//       res.json(event);
//     })
//     .catch((error) => {
//       console.error("Error fetching function data:", error);
//       res.status(500).json({ error: "Internal server error" });
//     });
// });

app.listen(3001, () => {
  console.log("server is running");
});
