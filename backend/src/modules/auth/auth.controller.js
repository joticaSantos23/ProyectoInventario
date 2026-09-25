import authService from "./auth.service.js";

const registrar = async (req, res) => {
  try {
    const usuario = await authService.registrarUsuario(req.body);

    const usuarioRespuesta = usuario.toObject();

    delete usuarioRespuesta.password;

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: usuarioRespuesta
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    if (!correo || !password) {
      return res.status(400).json({
        mensaje: "El correo y la contraseña son obligatorios"
      });
    }

    const resultado = await authService.iniciarSesion(
      correo,
      password
    );

    res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      ...resultado
    });
  } catch (error) {
    res.status(401).json({
      mensaje: error.message
    });
  }
};

export default {
  registrar,
  login
};