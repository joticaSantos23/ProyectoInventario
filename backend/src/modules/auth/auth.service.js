import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Usuario from "./usuario.model.js";

const registrarUsuario = async (datos) => {
  const {
    nombre,
    identificacion,
    areaPrograma,
    correo,
    telefono,
    password,
    rol
  } = datos;

  const correoExistente = await Usuario.findOne({
    correo: correo.toLowerCase().trim()
  });

  if (correoExistente) {
    throw new Error("El correo ya está registrado");
  }

  const identificacionExistente = await Usuario.findOne({
    identificacion: identificacion.trim()
  });

  if (identificacionExistente) {
    throw new Error("La identificación ya está registrada");
  }

  const passwordEncriptada = await bcrypt.hash(password, 10);

  const usuario = await Usuario.create({
    nombre,
    identificacion,
    areaPrograma,
    correo: correo.toLowerCase().trim(),
    telefono,
    password: passwordEncriptada,
    rol: rol || "aprendiz"
  });

  return usuario;
};

const iniciarSesion = async (correo, password) => {
  const usuario = await Usuario.findOne({
    correo: correo.toLowerCase().trim()
  });

  if (!usuario) {
    throw new Error("Correo o contraseña incorrectos");
  }

  if (!usuario.activo) {
    throw new Error("El usuario está inactivo");
  }

  const passwordCorrecta = await bcrypt.compare(
    password,
    usuario.password
  );

  if (!passwordCorrecta) {
    throw new Error("Correo o contraseña incorrectos");
  }

  const token = jwt.sign(
    {
      id: usuario._id,
      rol: usuario.rol
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );

  return {
    token,
    usuario: {
      id: usuario._id,
      nombre: usuario.nombre,
      identificacion: usuario.identificacion,
      areaPrograma: usuario.areaPrograma,
      correo: usuario.correo,
      telefono: usuario.telefono,
      rol: usuario.rol,
      activo: usuario.activo
    }
  };
};

export default {
  registrarUsuario,
  iniciarSesion
};