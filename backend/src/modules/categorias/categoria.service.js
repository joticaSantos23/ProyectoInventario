import Categoria from "./categoria.model.js";

const crearCategoria = async (datos) => {
  const { nombre, descripcion } = datos;

  if (!nombre || !nombre.trim()) {
    throw new Error("El nombre de la categoría es obligatorio");
  }

  const nombreNormalizado = nombre.trim();

  const categoriaExistente = await Categoria.findOne({
    nombre: nombreNormalizado
  });

  if (categoriaExistente) {
    throw new Error("La categoría ya está registrada");
  }

  const categoria = await Categoria.create({
    nombre: nombreNormalizado,
    descripcion: descripcion?.trim() || ""
  });

  return categoria;
};

const obtenerCategorias = async () => {
  return await Categoria.find({
    activo: true
  }).sort({ nombre: 1 });
};

const actualizarCategoria = async (id, datos) => {
  const { nombre, descripcion, activo } = datos;

  if (!nombre || !nombre.trim()) {
    throw new Error("El nombre de la categoría es obligatorio");
  }

  const nombreNormalizado = nombre.trim();

  const categoriaExistente = await Categoria.findOne({
    nombre: nombreNormalizado,
    _id: { $ne: id }
  });

  if (categoriaExistente) {
    throw new Error("La categoría ya está registrada");
  }

  const categoria = await Categoria.findByIdAndUpdate(
    id,
    {
      nombre: nombreNormalizado,
      descripcion: descripcion?.trim() || "",
      activo: activo !== undefined ? activo : true
    },
    {
      new: true,
      runValidators: true
    }
  );

  if (!categoria) {
    throw new Error("Categoría no encontrada");
  }

  return categoria;
};

export default {
  crearCategoria,
  obtenerCategorias,
  actualizarCategoria
};