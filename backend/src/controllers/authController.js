import bcrypt from 'bcrypt';
import User from '../models/User.js';

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
