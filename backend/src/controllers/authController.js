import bcrypt from 'bcrypt';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import Session from '../models/Session.js';

const ACCESS_TOKEN_TTL = '30m';
const REFRESH_TOKEN_TTL = 14 * 24 * 60 * 60 * 1000; // 14 day

export const signUp = async (req, res) => {
  try {
    const { username, password, email, firstName, lastName } = req.body;
    if (!username || !password || !email || !firstName || !lastName) {
      return res
        .status(400)
        .json({ message: 'Must be not missing username, password, email, firstName, lastName' });
    }

    // Check if the username already exists
    const duplicate = await User.findOne({ username });

    if (duplicate) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    // bcrypt password
    const hashedPassword = await bcrypt.hash(password, 10); // salt = 10
    // create a new user
    await User.create({
      username,
      hashedPassword,
      email,
      displayName: `${firstName} ${lastName}`,
    });
    // return
    return res.sendStatus(204);
  } catch (error) {
    console.error('Error when signup', error);
    return res.status(500).json({ message: 'System error' });
  }
};

export const signIn = async (req, res) => {
  try {
    // get inputs
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json(400).json({ message: 'Missing username or password' });
    }

    // get hashedPassword in db compare with password input
    const user = await User.findOne({ username });

    if (!user) {
      return res.json(401).json({ message: 'username or password not correct' });
    }

    // check password
    const passwordCorrect = await bcrypt.compare(password, user.hashedPassword);

    if (!passwordCorrect) {
      return res.status(401).json({ message: 'username or password not correct' });
    }

    // if match, create accessToken with JWT
    const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_TTL,
    });

    // create refreshToken
    const refreshToken = crypto.randomBytes(64).toString('hex');

    // create new session to save refresh token
    await Session.create({
      userId: user._id,
      refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });

    // return refresh token in cookie
    (res.cookie('refreshToken', refreshToken),
      {
        httpOnly: true,
        secure: true,
        sameSite: 'none', // backend, frontend deploy
        maxAge: REFRESH_TOKEN_TTL,
      });

    // return access token in res
    return res.status(200).json({ message: `User ${user.displayName} logged in!`, accessToken }); 
  } catch (error) {
    console.error('Error when signIn', error);
    return res.status(500).json({ message: 'System error' });
  }
};

export const logout = async (req, res) => {
  try {
    // get refresh token from cookie
    const token = req.cookies?.refreshToken;

    if (!token) {
      return res.status(400).json({ message: 'Refresh token not found' });
    }
    if(token) {
      // delete refresh token in Session
      await Session.deleteOne({ refreshToken: token });
    }

    // delete cookie 
    res.clearCookie('refreshToken');
    return res.sendStatus(204);
    
  } catch (error) {
    
  }
}