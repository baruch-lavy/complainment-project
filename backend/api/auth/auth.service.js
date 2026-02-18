import Cryptr from "cryptr";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";

dotenv.config();

import { logger } from "../../services/logger.service.js";

const cryptr = new Cryptr(process.env.SECRET || "Secret-Puk-1234");

export const authService = {
  login,
  getLoginToken,
  validateToken,
};

async function login(password) {
  logger.debug(`auth.service - login with password: ${password}`);
  const adminPassword = process.env.ADMIN_PASS;
  if (password !== adminPassword) return false;

  return true;
}

function getLoginToken(password) {
	console.log(password);
  const token =  jwt.sign(
    {
      exp: Math.floor(Date.now() / 1000) + (60 * 0.1),
      data: password,
    },
    process.env.JWT_SECRET,
  );
  console.log(token);
  return token
}

function validateToken(loginToken) {
  try {
    const loggedinUser = jwt.verify(loginToken, process.env.JWT_SECRET);
	console.log(loggedinUser);
    return loggedinUser;
  } catch (err) {
    console.log("Invalid login token");
  }
  return null;
}
