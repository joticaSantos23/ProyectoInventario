import mongoose from "mongoose";

const productoSchema = new mongoose.Schema(
  {
    codigo: {
      type: String,
      required: [true, "El código es obligatorio"],
      unique: true,
      trim: true,
      uppercase: true
    },

    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true
    },

    descripcion: {
      type: String,
      trim: true,
      default: ""
    },

    categoria: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Categoria",
      required: [true, "La categoría es obligatoria"]
    },

    marca: {
      type: String,
      trim: true,
      default: ""
    },

    modelo: {
      type: String,
      trim: true,
      default: ""
    },

    precio: {
      type: Number,
      required: [true, "El precio es obligatorio"],
      min: [0, "El precio no puede ser negativo"]
    },

    stock: {
      type: Number,
      required: [true, "El stock es obligatorio"],
      min: [0, "El stock no puede ser negativo"],
      default: 0
    },

    stockMinimo: {
      type: Number,
      required: [true, "El stock mínimo es obligatorio"],
      min: [0, "El stock mínimo no puede ser negativo"],
      default: 0
    },

    estado: {
      type: String,
      enum: {
        values: [
          "Disponible",
          "Prestado",
          "Mantenimiento",
          "Dañado",
          "Retirado"
        ],
        message: "El estado del producto no es válido"
      },
      default: "Disponible"
    },

    imagenUrl: {
      type: String,
      trim: true,
      default: ""
    },

    // ==============================
    // DATOS DEL INVENTARIO DEL LABORATORIO
    // ==============================

    placa: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },

    serial: {
      type: String,
      trim: true,
      default: ""
    },

    fechaAdquisicion: {
      type: Date,
      default: null
    },

    centro: {
      type: String,
      trim: true,
      default: ""
    },

    consecutivo: {
      type: String,
      trim: true,
      default: ""
    },

    tipoInventario: {
      type: String,
      trim: true,
      default: ""
    },

    modalidadInventario: {
      type: String,
      trim: true,
      default: ""
    },

    atributos: {
      type: String,
      trim: true,
      default: ""
    },

    activo: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

const Producto = mongoose.model("Producto", productoSchema);

export default Producto;