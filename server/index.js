require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserModel = require("./models/users");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const paymentRoutes = require("../server/payment");
const app = express();

app.use(express.json());
app.use(cors());

const dbURI = process.env.MONGO_URI;
const port = process.env.PORT || 3001;

// Ensure environment variables are set
if (!dbURI) {
  console.error("Missing MONGO_URI environment variable");
  process.exit(1);
}

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // Increase timeout to 10 seconds
    socketTimeoutMS: 60000, // Close sockets after 45 seconds of inactivity
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log("MongoDB connection error:", err));

const fs = require("fs");

const uploadDir = "./uploads";

// Create the uploads directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add a basic route to test if the server is running
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Your existing routes...

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

// upload photos
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
      console.error("Error updating gallery:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

// Delete photo endpoint
app.delete("/delete-photo/:userId/:functionID/:photoUrl", (req, res) => {
  const { userId, functionID, photoUrl } = req.params;

  // Decode the photo URL
  const decodedPhotoUrl = decodeURIComponent(photoUrl);

  // Extract the public_id from the photo URL for Cloudinary
  const publicId = decodedPhotoUrl.split("/").pop().split(".")[0];

  // Delete image from Cloudinary
  cloudinary.uploader.destroy(publicId, (error, result) => {
    if (error) {
      console.error("Error deleting photo from Cloudinary:", error);
      return res.status(500).json({ error: "Internal server error" });
    }

    // Delete image URL from the gallery in the database
    UserModel.findOneAndUpdate(
      { userId, "events.functionID": functionID },
      { $pull: { "events.$.gallery": decodedPhotoUrl } },
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

// user login
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  UserModel.findOne({ email }).then((user) => {
    if (user) {
      if (user.password === password) {
        res.json({
          success: true,
          userId: user.userId,
          name: user.name,
          email: user.email,
          phone: user.phone,
          events: user.events,
        });
      } else {
        res.status(401).json("The Password is incorrect");
      }
    } else {
      res.status(404).json("Oops! No Account exists with this email");
    }
  });
});

// user email verification
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

// add events
app.post("/users/:userId/events", (req, res) => {
  const userId = req.params.userId;
  const newEvent = {
    ...req.body,
    paymentStatus: false,
    eventPin: req.body.eventPin || "",
  };

  UserModel.findOne({ "events.functionID": newEvent.functionID })
    .then((user) => {
      if (user) {
        return res.status(400).json({ error: "Function ID already exists." });
      }

      UserModel.findOneAndUpdate(
        { userId },
        { $push: { events: newEvent } },
        { new: true, useFindAndModify: false }
      )
        .then((user) => {
          if (!user) {
            return res.status(404).json({ error: "User not found" });
          }
          res.json(newEvent);
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

// find the user by the userId
app.get("/user/:id", (req, res) => {
  const userId = req.params.id;

  UserModel.findOne({ userId })
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

// host event
app.get("/hosts/:id", (req, res) => {
  const functionID = req.params.id;

  UserModel.findOne({ "events.functionID": functionID })
    .then((functionData) => {
      if (!functionData) {
        return res.status(404).json({ error: "Function not found" });
      }
      res.json(
        functionData.events.find((event) => event.functionID === functionID)
      );
    })
    .catch((error) => {
      console.error("Error fetching function data:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

// checking functionId if it's available or not
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

// Fetch event details by functionID (for admin page)
app.get("/get-event/:functionID", (req, res) => {
  const { functionID } = req.params;

  UserModel.findOne({ "events.functionID": functionID })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "Event not found" });
      }
      const event = user.events.find(
        (event) => event.functionID === functionID
      );
      res.json(event);
    })
    .catch((error) => {
      console.error("Error fetching event:", error);
      res.status(500).json({ error: "Internal server error" });
    });
});

// freeze users (admin)
app.post("/users/:userId/toggleFreeze", (req, res) => {
  const { userId } = req.params;

  UserModel.findOne({ userId }) // Use findOne with userId if userId is a unique field
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      user.frozen = !user.frozen;

      return user.save(); // Save the user model with the new frozen state
    })
    .then((updatedUser) => {
      // console.log(`User ${userId} freeze state: ${updatedUser.frozen}`);
      res.json({ frozen: updatedUser.frozen });
    })
    .catch((error) => {
      console.error("Error toggling freeze state:", error);
      res.status(500).json({ error: "Error toggling freeze state" });
    });
});

// for fetching details of frozen in account
app.get("/users/:userId", (req, res) => {
  const { userId } = req.params;
  UserModel.findOne({ userId })
    .then((user) => {
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json({ frozen: user.frozen });
    })
    .catch((error) =>
      res.status(500).json({ error: "Error fetching user data" })
    );
});

// verify pin
app.post("/verify-pin", async (req, res) => {
  const { functionID, pin } = req.body;

  try {
    const user = await UserModel.findOne({ "events.functionID": functionID });
    if (!user) {
      return res.status(404).json({ error: "Function ID not found" });
    }

    const event = user.events.find((event) => event.functionID === functionID);
    if (event && event.eventPin === pin) {
      res.json({ valid: true });
    } else {
      res.json({ valid: false });
    }
  } catch (error) {
    console.error("Error verifying PIN:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use("/api/payment", paymentRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
