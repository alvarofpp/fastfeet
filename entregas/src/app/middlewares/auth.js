import authService from "../services/authService";


export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided' });
  }

  try {
    const auth = await authService.request(authHeader).get('/sessions');

    req.auth = authHeader;
    req.userId = auth.data.userId;

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid' });
  }
};
