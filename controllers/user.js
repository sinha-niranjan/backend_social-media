const { urlencoded } = require("express");
const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    user = await User.create({
      name,
      email,
      password,
      avatar: { public_id: "sample public id", url: "sample url" },
    });

    // res.status(201).json({ success: true, user });

    const token = await user.generateToken();

    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      })
      .json({
        success: true,
        user,
        token,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    const token = await user.generateToken();

    res
      .status(200)
      .cookie("token", token, {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      })
      .json({
        success: true,
        user,
        token,
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    res
      .status(200)
      .cookie("token", null, { expires: new Date(Date.now()), httpOnly: true })
      .json({
        success: true,
        message: "Logged Out !",
      });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);

    const loggedInUser = await User.findById(req.user._id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User Not Found !",
      });
    }

    if (loggedInUser.following.includes(userToFollow._id)) {
      const indexToFollow = loggedInUser.following.indexOf(userToFollow._id);

      const indexOfLoggedIn = userToFollow.followers.indexOf(loggedInUser._id);

      userToFollow.followers.splice(indexOfLoggedIn, 1);

      loggedInUser.following.splice(indexToFollow, 1);

      await loggedInUser.save();
      await userToFollow.save();
      res.status(401).json({
        success: true,
        message: "User is Unfollowed !",
      });
    } else {
      loggedInUser.following.push(userToFollow._id);
      userToFollow.followers.push(loggedInUser._id);

      await loggedInUser.save();
      await userToFollow.save();

      res.status(200).json({
        success: true,
        message: "User Followed !",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("+password");

    const { oldPassword, newPassword } = req.body;

    if(!oldPassword || !newPassword){
      return res.status(400).json({
        success:false,
        message:"Please provide old and new Password ! "
      })
    }

    const isMatch = await user.matchPassword(oldPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Incorrect Old Password !",
      });
    }

    user.password = newPassword;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password is Updated !",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const { name, email } = req.body;

    if (name) {
      user.name = name;
    }

    if (email) {
      user.email = email;
    }

    // User Avatar TODO

    await user.save();
    res.status(200).json({
      success: true,
      message: "Profile is Updated ! ",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
