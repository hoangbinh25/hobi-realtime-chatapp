export const authMe = async (req, res) => {
  try {
    const user = req.user; // get to authMiddleware
    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error('Error when call authMe', error);
    return res.status(500).json({ message: 'System error' });
  }
};

export const test = async (req, res) => {
  return res.sendStatus(204);
};
