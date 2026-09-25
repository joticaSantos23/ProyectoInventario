import mongoose from "mongoose";

import Prestamo from "./prestamo.model.js";
import Producto from "../productos/producto.model.js";
import Usuario from "../auth/usuario.model.js";
import Movimiento from "../movimientos/movimiento.model.js";

// ============================================================================
// CREAR PRÉSTAMO
// ============================================================================

const crearPrestamo = async (datos, usuarioId) => {
  const {
    nombreSolicitante,
    identificacion,
    areaPrograma,
    correo,
    telefono,
    ubicacion,
    lugarEntrega,
    productos,
    observaciones
  } = datos;

  // ==========================================================================
  // VALIDAR USUARIO
  // ==========================================================================

  if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
    throw new Error("El ID del usuario no es válido");
  }

  const usuario = await Usuario.findById(usuarioId);

  if (!usuario) {
    throw new Error("Usuario solicitante no encontrado");
  }

  if (usuario.rol !== "aprendiz") {
    throw new Error(
      "Solo los aprendices pueden realizar solicitudes de préstamo"
    );
  }

  // ==========================================================================
  // VALIDAR DATOS DEL SOLICITANTE
  // ==========================================================================

  if (!nombreSolicitante || !nombreSolicitante.trim()) {
    throw new Error("El nombre del solicitante es obligatorio");
  }

  if (!identificacion || !identificacion.trim()) {
    throw new Error("La identificación es obligatoria");
  }

  if (!areaPrograma || !areaPrograma.trim()) {
    throw new Error("El área o programa es obligatorio");
  }

  if (!correo || !correo.trim()) {
    throw new Error("El correo es obligatorio");
  }

  if (!telefono || !telefono.trim()) {
    throw new Error("El teléfono es obligatorio");
  }

  // ==========================================================================
  // UBICACIÓN
  // ==========================================================================

  const ubicacionFinal = lugarEntrega || ubicacion;

  if (!ubicacionFinal || !ubicacionFinal.trim()) {
    throw new Error("El lugar de entrega o ubicación es obligatorio");
  }

  // ==========================================================================
  // VALIDAR PRODUCTOS
  // ==========================================================================

  if (!Array.isArray(productos) || productos.length === 0) {
    throw new Error("Debe solicitar al menos un producto");
  }

  const productosProcesados = [];

  for (const item of productos) {
    if (!item.producto) {
      throw new Error("Cada producto solicitado es obligatorio");
    }

    if (!mongoose.Types.ObjectId.isValid(item.producto)) {
      throw new Error(
        "Uno de los productos solicitados no tiene un ID válido"
      );
    }

    const cantidad = Number(item.cantidad);

    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      throw new Error(
        "La cantidad de cada producto debe ser un número entero mayor que cero"
      );
    }

    const producto = await Producto.findById(item.producto);

    if (!producto) {
      throw new Error(
        "Uno de los productos solicitados no existe"
      );
    }

    if (!producto.activo) {
      throw new Error(
        `El producto ${producto.codigo} no está activo`
      );
    }

    if (producto.estado === "Retirado") {
      throw new Error(
        `El producto ${producto.codigo} está retirado`
      );
    }

    if (producto.stock < cantidad) {
      throw new Error(
        `No hay suficiente stock disponible para el producto ${producto.codigo}`
      );
    }

    productosProcesados.push({
      producto: producto._id,
      cantidad
    });
  }

  // ==========================================================================
  // CREAR PRÉSTAMO
  // ==========================================================================

  const prestamo = await Prestamo.create({
    solicitante: usuario._id,

    nombreSolicitante: nombreSolicitante.trim(),

    identificacion: identificacion.trim(),

    areaPrograma: areaPrograma.trim(),

    correo: correo.toLowerCase().trim(),

    telefono: telefono.trim(),

    lugarEntrega: ubicacionFinal.trim(),

    productos: productosProcesados,

    observaciones: observaciones?.trim() || "",

    estado: "Pendiente"

    // fechaSolicitud NO se envía.
    // El modelo de Mongoose debe establecerla automáticamente.
  });

  return await prestamo.populate([
    {
      path: "solicitante",
      select: "nombre identificacion correo rol"
    },
    {
      path: "productos.producto",
      select:
        "codigo nombre descripcion marca modelo precio stock stockMinimo estado activo"
    }
  ]);
};

// ============================================================================
// OBTENER TODOS LOS PRÉSTAMOS
// ============================================================================

const obtenerPrestamos = async () => {
  return await Prestamo.find()
    .populate(
      "solicitante",
      "nombre identificacion areaPrograma correo telefono rol"
    )
    .populate(
      "productos.producto",
      "codigo nombre descripcion marca modelo precio stock stockMinimo estado activo"
    )
    .populate(
      "aprobadoPor",
      "nombre correo rol"
    )
    .sort({ createdAt: -1 });
};

// ============================================================================
// OBTENER PRÉSTAMOS DEL APRENDIZ
// ============================================================================

const obtenerPrestamosPorUsuario = async (usuarioId) => {
  if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
    throw new Error("El ID del usuario no es válido");
  }

  return await Prestamo.find({
    solicitante: usuarioId
  })
    .populate(
      "productos.producto",
      "codigo nombre descripcion marca modelo precio stock stockMinimo estado activo"
    )
    .populate(
      "aprobadoPor",
      "nombre correo rol"
    )
    .sort({ createdAt: -1 });
};

// ============================================================================
// OBTENER UN PRÉSTAMO POR ID
// ============================================================================

const obtenerPrestamoPorId = async (id, usuarioId) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("El ID del préstamo no es válido");
  }

  if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
    throw new Error("El ID del usuario no es válido");
  }

  const usuario = await Usuario.findById(usuarioId).select("rol");

  if (!usuario) {
    throw new Error("Usuario no encontrado");
  }

  let prestamo;

  if (usuario.rol === "admin") {
    prestamo = await Prestamo.findById(id);
  } else if (usuario.rol === "aprendiz") {
    prestamo = await Prestamo.findOne({
      _id: id,
      solicitante: usuarioId
    });
  } else {
    throw new Error(
      "No tienes permisos para consultar este préstamo"
    );
  }

  if (!prestamo) {
    throw new Error("Préstamo no encontrado");
  }

  return await prestamo.populate([
    {
      path: "solicitante",
      select:
        "nombre identificacion areaPrograma correo telefono rol"
    },
    {
      path: "productos.producto",
      select:
        "codigo nombre descripcion marca modelo precio stock stockMinimo estado activo"
    },
    {
      path: "aprobadoPor",
      select: "nombre correo rol"
    }
  ]);
};

// ============================================================================
// APROBAR PRÉSTAMO
// ============================================================================

const aprobarPrestamo = async (prestamoId, usuarioId) => {
  if (!mongoose.Types.ObjectId.isValid(prestamoId)) {
    throw new Error("El ID del préstamo no es válido");
  }

  if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
    throw new Error("El ID del usuario no es válido");
  }

  const prestamo = await Prestamo.findById(prestamoId);

  if (!prestamo) {
    throw new Error("Préstamo no encontrado");
  }

  if (prestamo.estado !== "Pendiente") {
    throw new Error(
      "Solo se pueden aprobar préstamos que estén pendientes"
    );
  }

  const usuario = await Usuario.findById(usuarioId);

  if (!usuario) {
    throw new Error("Usuario aprobador no encontrado");
  }

  if (usuario.rol !== "admin") {
    throw new Error(
      "Solo un administrador puede aprobar préstamos"
    );
  }

  // ==========================================================================
  // VALIDAR STOCK NUEVAMENTE
  // ==========================================================================

  for (const item of prestamo.productos) {
    const producto = await Producto.findById(item.producto);

    if (!producto) {
      throw new Error(
        "Uno de los productos del préstamo no existe"
      );
    }

    if (!producto.activo) {
      throw new Error(
        `El producto ${producto.codigo} no está activo`
      );
    }

    if (producto.estado === "Retirado") {
      throw new Error(
        `El producto ${producto.codigo} está retirado`
      );
    }

    if (producto.stock < item.cantidad) {
      throw new Error(
        `No hay suficiente stock disponible para el producto ${producto.codigo}`
      );
    }
  }

  prestamo.estado = "Aprobado";
  prestamo.aprobadoPor = usuarioId;
  prestamo.fechaAprobacion = new Date();

  await prestamo.save();

  return await prestamo.populate([
    {
      path: "solicitante",
      select:
        "nombre identificacion areaPrograma correo telefono rol"
    },
    {
      path: "productos.producto",
      select:
        "codigo nombre descripcion marca modelo precio stock stockMinimo estado activo"
    },
    {
      path: "aprobadoPor",
      select: "nombre correo rol"
    }
  ]);
};

// ============================================================================
// RECHAZAR PRÉSTAMO
// ============================================================================

const rechazarPrestamo = async (
  prestamoId,
  usuarioId,
  motivoRechazo
) => {
  if (!mongoose.Types.ObjectId.isValid(prestamoId)) {
    throw new Error("El ID del préstamo no es válido");
  }

  if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
    throw new Error("El ID del usuario no es válido");
  }

  if (!motivoRechazo || !motivoRechazo.trim()) {
    throw new Error("El motivo del rechazo es obligatorio");
  }

  const prestamo = await Prestamo.findById(prestamoId);

  if (!prestamo) {
    throw new Error("Préstamo no encontrado");
  }

  if (prestamo.estado !== "Pendiente") {
    throw new Error(
      "Solo se pueden rechazar préstamos que estén pendientes"
    );
  }

  const usuario = await Usuario.findById(usuarioId);

  if (!usuario) {
    throw new Error("Usuario responsable no encontrado");
  }

  if (usuario.rol !== "admin") {
    throw new Error(
      "Solo un administrador puede rechazar préstamos"
    );
  }

  prestamo.estado = "Rechazado";
  prestamo.aprobadoPor = usuarioId;
  prestamo.fechaAprobacion = new Date();
  prestamo.motivoRechazo = motivoRechazo.trim();

  await prestamo.save();

  return await prestamo.populate([
    {
      path: "solicitante",
      select:
        "nombre identificacion areaPrograma correo telefono rol"
    },
    {
      path: "productos.producto",
      select:
        "codigo nombre descripcion marca modelo precio stock stockMinimo estado activo"
    },
    {
      path: "aprobadoPor",
      select: "nombre correo rol"
    }
  ]);
};

// ============================================================================
// ENTREGAR PRÉSTAMO
// ============================================================================

const entregarPrestamo = async (prestamoId, usuarioId) => {
  if (!mongoose.Types.ObjectId.isValid(prestamoId)) {
    throw new Error("El ID del préstamo no es válido");
  }

  if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
    throw new Error("El ID del usuario no es válido");
  }

  const prestamo = await Prestamo.findById(prestamoId);

  if (!prestamo) {
    throw new Error("Préstamo no encontrado");
  }

  if (prestamo.estado !== "Aprobado") {
    throw new Error(
      "Solo se pueden entregar préstamos que estén aprobados"
    );
  }

  const usuario = await Usuario.findById(usuarioId);

  if (!usuario) {
    throw new Error("Usuario responsable no encontrado");
  }

  if (usuario.rol !== "admin") {
    throw new Error(
      "Solo un administrador puede registrar la entrega"
    );
  }

  // ==========================================================================
  // VALIDAR STOCK
  // ==========================================================================

  for (const item of prestamo.productos) {
    const producto = await Producto.findById(item.producto);

    if (!producto) {
      throw new Error(
        "Uno de los productos del préstamo no existe"
      );
    }

    if (!producto.activo) {
      throw new Error(
        `El producto ${producto.codigo} no está activo`
      );
    }

    if (producto.estado === "Retirado") {
      throw new Error(
        `El producto ${producto.codigo} está retirado`
      );
    }

    if (producto.stock < item.cantidad) {
      throw new Error(
        `No hay suficiente stock para entregar el producto ${producto.codigo}`
      );
    }
  }

  // ==========================================================================
  // DESCONTAR STOCK
  // ==========================================================================

  for (const item of prestamo.productos) {
    const producto = await Producto.findById(item.producto);

    producto.stock -= item.cantidad;

    if (producto.stock === 0) {
      producto.estado = "Prestado";
    } else {
      producto.estado = "Disponible";
    }

    await producto.save();

    await Movimiento.create({
      producto: producto._id,
      tipo: "Salida",
      cantidad: item.cantidad,
      usuarioResponsable: usuarioId,
      observacion: `Entrega del préstamo ${prestamo._id}`
    });
  }

  prestamo.estado = "Entregado";
  prestamo.fechaEntrega = new Date();

  await prestamo.save();

  return await prestamo.populate([
    {
      path: "solicitante",
      select:
        "nombre identificacion areaPrograma correo telefono rol"
    },
    {
      path: "productos.producto",
      select:
        "codigo nombre descripcion marca modelo precio stock stockMinimo estado activo"
    },
    {
      path: "aprobadoPor",
      select: "nombre correo rol"
    }
  ]);
};

// ============================================================================
// DEVOLVER PRÉSTAMO
// ============================================================================

const devolverPrestamo = async (prestamoId, usuarioId) => {
  if (!mongoose.Types.ObjectId.isValid(prestamoId)) {
    throw new Error("El ID del préstamo no es válido");
  }

  if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
    throw new Error("El ID del usuario no es válido");
  }

  const prestamo = await Prestamo.findById(prestamoId);

  if (!prestamo) {
    throw new Error("Préstamo no encontrado");
  }

  if (prestamo.estado !== "Entregado") {
    throw new Error(
      "Solo se pueden devolver préstamos que estén entregados"
    );
  }

  const usuario = await Usuario.findById(usuarioId);

  if (!usuario) {
    throw new Error("Usuario responsable no encontrado");
  }

  if (usuario.rol !== "admin") {
    throw new Error(
      "Solo un administrador puede registrar la devolución"
    );
  }

  // ==========================================================================
  // VALIDAR PRODUCTOS
  // ==========================================================================

  for (const item of prestamo.productos) {
    const producto = await Producto.findById(item.producto);

    if (!producto) {
      throw new Error(
        "Uno de los productos del préstamo no existe"
      );
    }
  }

  // ==========================================================================
  // DEVOLVER STOCK
  // ==========================================================================

  for (const item of prestamo.productos) {
    const producto = await Producto.findById(item.producto);

    if (producto.estado === "Retirado") {
      throw new Error(
        `El producto ${producto.codigo} está retirado`
      );
    }

    producto.stock += item.cantidad;
    producto.estado = "Disponible";

    await producto.save();

    await Movimiento.create({
      producto: producto._id,
      tipo: "Devolución",
      cantidad: item.cantidad,
      usuarioResponsable: usuarioId,
      observacion: `Devolución del préstamo ${prestamo._id}`
    });
  }

  prestamo.estado = "Devuelto";
  prestamo.fechaDevolucionReal = new Date();

  await prestamo.save();

  return await prestamo.populate([
    {
      path: "solicitante",
      select:
        "nombre identificacion areaPrograma correo telefono rol"
    },
    {
      path: "productos.producto",
      select:
        "codigo nombre descripcion marca modelo precio stock stockMinimo estado activo"
    },
    {
      path: "aprobadoPor",
      select: "nombre correo rol"
    }
  ]);
};

// ============================================================================
// ELIMINAR PRÉSTAMO
// ============================================================================

const eliminarPrestamo = async (prestamoId, usuarioId) => {
  if (!mongoose.Types.ObjectId.isValid(prestamoId)) {
    throw new Error("El ID del préstamo no es válido");
  }

  if (!mongoose.Types.ObjectId.isValid(usuarioId)) {
    throw new Error("El ID del usuario no es válido");
  }

  const usuario = await Usuario.findById(usuarioId).select("rol");

  if (!usuario) {
    throw new Error("Usuario responsable no encontrado");
  }

  if (usuario.rol !== "admin") {
    throw new Error(
      "Solo un administrador puede eliminar préstamos"
    );
  }

  const prestamo = await Prestamo.findById(prestamoId);

  if (!prestamo) {
    throw new Error("Préstamo no encontrado");
  }

  const estadosPermitidos = [
    "Rechazado",
    "Devuelto"
  ];

  if (!estadosPermitidos.includes(prestamo.estado)) {
    throw new Error(
      `No se puede eliminar un préstamo en estado "${prestamo.estado}". Solo se pueden eliminar préstamos rechazados o devueltos.`
    );
  }

  await Prestamo.findByIdAndDelete(prestamoId);

  return {
    id: prestamoId,
    estado: prestamo.estado
  };
};

// ============================================================================
// EXPORTAR SERVICIO
// ============================================================================

export default {
  crearPrestamo,
  obtenerPrestamos,
  obtenerPrestamosPorUsuario,
  obtenerPrestamoPorId,
  aprobarPrestamo,
  rechazarPrestamo,
  entregarPrestamo,
  devolverPrestamo,
  eliminarPrestamo
};