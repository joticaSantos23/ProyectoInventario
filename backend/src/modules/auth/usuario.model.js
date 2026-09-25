import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true
    },

    identificacion: {
      type: String,
      required: [true, "La identificación es obligatoria"],
      trim: true,
      unique: true
    },

    areaPrograma: {
      type: String,
      required: [true, "El área o programa es obligatorio"],
      trim: true
    },

    correo: {
      type: String,
      required: [true, "El correo es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true
    },

    telefono: {
      type: String,
      required: [true, "El teléfono es obligatorio"],
      trim: true
    },

    password: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
      minlength: [6, "La contraseña debe tener mínimo 6 caracteres"]
    },

    rol: {
      type: String,
      enum: {
        values: ["admin", "aprendiz"],
        message: "El rol debe ser admin o aprendiz"
      },
      default: "aprendiz"
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

const Usuario = mongoose.model("Usuario", usuarioSchema);

export default Usuario;