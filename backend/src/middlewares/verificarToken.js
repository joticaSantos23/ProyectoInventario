import jwt from "jsonwebtoken";

const verificarToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        mensaje: "Token de autenticación requerido"
      });
    }

    const partes = authHeader.split(" ");

    if (partes.length !== 2 || partes[0] !== "Bearer") {
      return res.status(401).json({
        mensaje: "Formato de token inválido"
      });
    }

    const token = partes[1];

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.usuario = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      mensaje: "Token inválido o expirado"
    });
  }
};

export default verificarToken;