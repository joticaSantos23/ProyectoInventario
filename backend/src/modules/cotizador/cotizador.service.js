import mongoose from "mongoose";
import Producto from "../productos/producto.model.js";

const calcularCotizacion = async (productos, incluirIVA = false) => {
  if (!Array.isArray(productos) || productos.length === 0) {
    throw new Error("Debe seleccionar al menos un producto");
  }

  const productosCotizados = [];

  for (const item of productos) {
    const { producto: productoId, cantidad } = item;

    if (!mongoose.Types.ObjectId.isValid(productoId)) {
      throw new Error(`El ID del producto no es válido: ${productoId}`);
    }

    if (
      !Number.isInteger(cantidad) ||
      cantidad <= 0
    ) {
      throw new Error(
        "La cantidad de cada producto debe ser un número entero mayor que cero"
      );
    }

    const producto = await Producto.findById(productoId);

    if (!producto) {
      throw new Error(
        `El producto ${productoId} no existe`
      );
    }

    if (!producto.activo) {
      throw new Error(
        `El producto ${producto.nombre} está inactivo`
      );
    }

    if (producto.estado === "Retirado") {
      throw new Error(
        `El producto ${producto.nombre} está retirado`
      );
    }

    if (cantidad > producto.stock) {
      throw new Error(
        `La cantidad solicitada de ${producto.nombre} supera el stock disponible`
      );
    }

    const subtotalProducto = producto.precio * cantidad;

    productosCotizados.push({
      producto: producto._id,
      codigo: producto.codigo,
      nombre: producto.nombre,
      precioUnitario: producto.precio,
      cantidad,
      subtotal: subtotalProducto
    });
  }

  const subtotal = productosCotizados.reduce(
    (total, item) => total + item.subtotal,
    0
  );

  const iva = incluirIVA ? subtotal * 0.19 : 0;

  const total = subtotal + iva;

  return {
    productos: productosCotizados,
    subtotal,
    iva,
    total
  };
};

export default {
  calcularCotizacion
};