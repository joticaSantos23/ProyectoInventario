import prestamoService from "./prestamo.service.js";

// ============================================================================
// CREAR PRÉSTAMO
// ============================================================================

const crear = async (req, res) => {
  try {
    const prestamo = await prestamoService.crearPrestamo(
      req.body,
      req.usuario.id
    );

    res.status(201).json({
      mensaje: "Solicitud de préstamo creada correctamente",
      prestamo
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// OBTENER TODOS LOS PRÉSTAMOS
// ============================================================================

const obtenerTodos = async (req, res) => {
  try {
    const prestamos = await prestamoService.obtenerPrestamos();

    res.status(200).json({
      prestamos
    });
  } catch (error) {
    res.status(500).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// OBTENER MIS PRÉSTAMOS
// ============================================================================

const obtenerMisPrestamos = async (req, res) => {
  try {
    const prestamos =
      await prestamoService.obtenerPrestamosPorUsuario(
        req.usuario.id
      );

    res.status(200).json({
      prestamos
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// OBTENER PRÉSTAMO POR ID
// ============================================================================

const obtenerPorId = async (req, res) => {
  try {
    const prestamo =
      await prestamoService.obtenerPrestamoPorId(
        req.params.id,
        req.usuario.id
      );

    res.status(200).json({
      prestamo
    });
  } catch (error) {
    res.status(404).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// APROBAR PRÉSTAMO
// ============================================================================

const aprobar = async (req, res) => {
  try {
    const prestamo =
      await prestamoService.aprobarPrestamo(
        req.params.id,
        req.usuario.id
      );

    res.status(200).json({
      mensaje: "Préstamo aprobado correctamente",
      prestamo
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// RECHAZAR PRÉSTAMO
// ============================================================================

const rechazar = async (req, res) => {
  try {
    const prestamo =
      await prestamoService.rechazarPrestamo(
        req.params.id,
        req.usuario.id,
        req.body.motivoRechazo
      );

    res.status(200).json({
      mensaje: "Préstamo rechazado correctamente",
      prestamo
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// ENTREGAR PRÉSTAMO
// ============================================================================

const entregar = async (req, res) => {
  try {
    const prestamo =
      await prestamoService.entregarPrestamo(
        req.params.id,
        req.usuario.id
      );

    res.status(200).json({
      mensaje: "Préstamo entregado correctamente",
      prestamo
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// DEVOLVER PRÉSTAMO
// ============================================================================

const devolver = async (req, res) => {
  try {
    const prestamo =
      await prestamoService.devolverPrestamo(
        req.params.id,
        req.usuario.id
      );

    res.status(200).json({
      mensaje: "Préstamo devuelto correctamente",
      prestamo
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// ELIMINAR PRÉSTAMO
// ============================================================================

const eliminar = async (req, res) => {
  try {
    const resultado =
      await prestamoService.eliminarPrestamo(
        req.params.id,
        req.usuario.id
      );

    res.status(200).json({
      mensaje: "Préstamo eliminado correctamente",
      prestamo: resultado
    });
  } catch (error) {
    res.status(400).json({
      mensaje: error.message
    });
  }
};

// ============================================================================
// EXPORTAR CONTROLLER
// ============================================================================

export default {
  crear,
  obtenerTodos,
  obtenerMisPrestamos,
  obtenerPorId,
  aprobar,
  rechazar,
  entregar,
  devolver,
  eliminar
};