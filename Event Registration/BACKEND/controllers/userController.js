import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export async function registerNewUser(req, res) {
  const { username, password } = req.body;

  try {
    const existingUser = await User.find({
      username: username,
    });
    if (existingUser.length > 0) {
      res.status(409).json({ message: "Username is already in use!" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.json(newUser);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
}

export async function loginUser(req, res) {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  if (!user) {
    return res.status(404).json({ err: "user not found" });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.password);

  if (isPasswordCorrect) {
    const secretKey = process.env.SECRET_KEY;

    const token = jwt.sign(
      { id: user._id, username: user.username },
      secretKey,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } else {
    res.status(400).json({ message: "password is incorrect" });
  }
}

export async function getUsers(req, res) {
  const users = await User.find();

  res.json(users);
}
