const express = require("express");
const router = express.Router();
const Posted = require("../models/post");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userLayout = "../views/layouts/user";
const jwtSecret = process.env.jwtSecret;

/**checking the identiy when we refresh (based on the token ) to stay logged in */

const authMiddleware = (req, res, next) => {
  const token = req.cookies.token;
  module.exports = { token };

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

/**get the dashboard page */

router.get("/user/dashboard", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Dashboard",
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    };
    const passedData = req.userId;
    const user =await User.findById(passedData);
    const username=user.username;
    console.log(user)
    const data = await Posted.find({ auther: username });
    console.log(data);
    //console.log(data);
    res.render("user/dashboard", {
      username,
      data,
      layout: userLayout,
    });
  } catch (error) {
    console.log(error);
  }
});
/**
 * GET /
 * Admin - Create New Post
 */
router.get("/add-post", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Add Post",
      description: "Simple Blog created with NodeJs, Express & MongoDb.",
    };
    const passedData = req.userId;
    const user =await User.findById(passedData);
    const username=user.username;
    const data = await Posted.find({ username:username });
    res.render("user/add-post", {
    username,
    data,
    layout: userLayout,
    });
  } catch (error) {
    console.log(error);
  }
});
/**
 * POST /
 * Admin - Create New Post
 */
router.post("/add-post", authMiddleware, async (req, res) => {
  try {
    const passedData = req.userId;
    const user =await User.findById(passedData);
    const username=user.username;
    try {
      const newPost = new Posted({
        title: req.body.title,
        body: req.body.body,
        auther: username,
      });
      await Posted.create(newPost);
      res.redirect("/add-post")
    } catch (error) {
      console.log(error);
      console.log("hey");
    }
  } catch (error) {
    console.log(error);
  }
});
/**
 * GET /
 * Admin - Create New Post
 */
router.get("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    const locals = {
      title: "Edit Post",
      description: "Free NodeJs User Management System",
    };
    const passedData = req.userId;
    const user =await User.findById(passedData);
    const username=user.username;
    const data = await Posted.findOne({ _id: req.params.id });
    res.render("user/edit-post", {
      username,
      data,
      layout: userLayout,
    });
  } catch (error) {
    console.log(error);
  }
});
/**
 * PUT /
 * Admin - Create New Post
 */
router.put("/edit-post/:id", authMiddleware, async (req, res) => {
  try {
    await Posted.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      body: req.body.body,
      updatedAt: Date.now(),
    });

    res.redirect(`/edit-post/${req.params.id}`);
  } catch (error) {
    console.log(error);
  }
});
/**
 * DELETE /
 * Admin - Delete Post
 */
router.delete("/delete-post/:id", authMiddleware, async (req, res) => {
  try {
    await Posted.deleteOne({ _id: req.params.id });
    res.redirect("/user/dashboard");
  } catch (error) {
    console.log(error);
  }
});
/**Get
 * Admin -logout
 */
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  //res.json({ message: 'Logout successful.'});
  res.redirect("/");
});
/**Get the dashboard which is the home page (inside the admin folder in views) */
module.exports = router;
