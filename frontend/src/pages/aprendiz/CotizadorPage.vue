<template>
  <div class="cotizador-page">

    <!-- ENCABEZADO -->
    <div class="page-header">
      <div>
        <span class="eyebrow">APRENDIZ</span>
        <h1>Cotizador</h1>
        <p>
          Consulta el valor estimado de los elementos que necesitas.
        </p>
      </div>

      <button
        v-if="cotizacion.length > 0"
        class="btn-limpiar"
        @click="limpiarCotizacion"
      >
        <span>🗑</span>
        Limpiar cotización
      </button>
    </div>

    <!-- MENSAJES -->
    <div v-if="cargando" class="mensaje estado-cargando">
      <div class="spinner"></div>
      <span>Cargando productos...</span>
    </div>

    <div v-else-if="error" class="mensaje estado-error">
      <span class="mensaje-icono">⚠</span>

      <div>
        <strong>No fue posible cargar los productos</strong>
        <p>{{ error }}</p>
      </div>

      <button @click="cargarProductos">
        Reintentar
      </button>
    </div>

    <div v-else class="contenido">

      <!-- ============================== -->
      <!-- PRODUCTOS -->
      <!-- ============================== -->

      <section class="productos-section">

        <div class="section-title">
          <div>
            <h2>Productos disponibles</h2>
            <p>
              Selecciona los elementos que deseas cotizar.
            </p>
          </div>

          <div class="contador-productos">
            {{ productosFiltrados.length }} productos
          </div>
        </div>

        <!-- BUSCADOR -->

        <div class="buscador">

          <span class="buscador-icono">⌕</span>

          <input
            v-model="busqueda"
            type="text"
            placeholder="Buscar por código, nombre o descripción..."
          />

          <button
            v-if="busqueda"
            class="limpiar-busqueda"
            @click="busqueda = ''"
          >
            ×
          </button>

        </div>

        <!-- LISTADO -->

        <div
          v-if="productosFiltrados.length > 0"
          class="productos-grid"
        >

          <article
            v-for="producto in productosFiltrados"
            :key="producto._id || producto.id || producto.codigo"
            class="producto-card"
          >

            <!-- IMAGEN -->

            <div class="producto-imagen">

              <img
                v-if="obtenerImagen(producto)"
                :src="obtenerImagen(producto)"
                :alt="producto.nombre"
                @error="imagenError"
              />

              <div
                v-else
                class="sin-imagen"
              >
                <span>📦</span>
              </div>

              <span
                class="estado-producto"
                :class="claseEstado(producto)"
              >
                {{ textoEstado(producto) }}
              </span>

            </div>

            <!-- INFORMACIÓN -->

            <div class="producto-info">

              <span class="producto-codigo">
                {{ producto.codigo || 'Sin código' }}
              </span>

              <h3>
                {{ producto.nombre }}
              </h3>

              <p
                v-if="producto.descripcion"
                class="producto-descripcion"
              >
                {{ producto.descripcion }}
              </p>

              <div class="producto-datos">

                <div>
                  <span>Precio unitario</span>

                  <strong>
                    {{ formatoMoneda(producto.precio) }}
                  </strong>
                </div>

                <div>
                  <span>Disponible</span>

                  <strong>
                    {{ producto.stock ?? 0 }}
                  </strong>
                </div>

              </div>

              <!-- CANTIDAD -->

              <div
                v-if="productoDisponible(producto)"
                class="producto-acciones"
              >

                <div class="cantidad-control">

                  <button
                    type="button"
                    @click="disminuirCantidad(producto)"
                    :disabled="obtenerCantidad(producto) <= 1"
                  >
                    −
                  </button>

                  <span>
                    {{ obtenerCantidad(producto) }}
                  </span>

                  <button
                    type="button"
                    @click="aumentarCantidad(producto)"
                    :disabled="
                      obtenerCantidad(producto) >= Number(producto.stock)
                    "
                  >
                    +
                  </button>

                </div>

                <button
                  class="btn-agregar"
                  type="button"
                  @click="agregarCotizacion(producto)"
                >
                  {{
                    estaEnCotizacion(producto)
                      ? 'Actualizar'
                      : 'Agregar'
                  }}
                </button>

              </div>

              <div
                v-else
                class="sin-stock"
              >
                Sin stock disponible
              </div>

            </div>

          </article>

        </div>

        <!-- SIN RESULTADOS -->

        <div
          v-else
          class="sin-resultados"
        >

          <div class="sin-resultados-icono">
            🔎
          </div>

          <h3>
            No encontramos productos
          </h3>

          <p>
            Intenta cambiar el término de búsqueda.
          </p>

        </div>

      </section>

      <!-- ============================== -->
      <!-- RESUMEN -->
      <!-- ============================== -->

      <aside class="resumen-section">

        <!-- CABECERA -->

        <div class="resumen-header">

          <div>
            <span class="eyebrow">
              RESUMEN
            </span>

            <h2>
              Mi cotización
            </h2>
          </div>

          <div class="contador-carrito">
            {{ totalUnidades }}
            {{ totalUnidades === 1 ? 'unidad' : 'unidades' }}
          </div>

        </div>

        <!-- COTIZACIÓN VACÍA -->

        <div
          v-if="cotizacion.length === 0"
          class="cotizacion-vacia"
        >

          <div class="vacio-icono">
            🧾
          </div>

          <h3>
            Tu cotización está vacía
          </h3>

          <p>
            Agrega productos desde el listado para calcular
            el valor estimado.
          </p>

        </div>

        <!-- COTIZACIÓN CON PRODUCTOS -->

        <div
          v-else
          class="cotizacion-contenido"
        >

          <!-- ============================== -->
          <!-- ZONA CON SCROLL -->
          <!-- ============================== -->

          <div class="cotizacion-scroll">

            <div class="cotizacion-lista">

              <article
                v-for="item in cotizacion"
                :key="item.id"
                class="cotizacion-item"
              >

                <div class="item-imagen">

                  <img
                    v-if="item.imagen"
                    :src="item.imagen"
                    :alt="item.nombre"
                    @error="imagenError"
                  />

                  <span v-else>
                    📦
                  </span>

                </div>

                <div class="item-info">

                  <strong>
                    {{ item.nombre }}
                  </strong>

                  <span>
                    {{ item.codigo || 'Sin código' }}
                  </span>

                  <small>
                    {{ formatoMoneda(item.precio) }} ×
                    {{ item.cantidad }}
                  </small>

                </div>

                <div class="item-total">
                  {{ formatoMoneda(item.subtotal) }}
                </div>

                <div class="item-controles">

                  <button
                    type="button"
                    @click="disminuirItem(item)"
                    :disabled="item.cantidad <= 1"
                  >
                    −
                  </button>

                  <span>
                    {{ item.cantidad }}
                  </span>

                  <button
                    type="button"
                    @click="aumentarItem(item)"
                    :disabled="item.cantidad >= item.stock"
                  >
                    +
                  </button>

                  <button
                    type="button"
                    class="btn-eliminar"
                    title="Eliminar"
                    @click="eliminarItem(item.id)"
                  >
                    ×
                  </button>

                </div>

              </article>

            </div>

          </div>

          <!-- ============================== -->
          <!-- PARTE FIJA -->
          <!-- ============================== -->

          <div class="resumen-fijo">

            <!-- TOTALES -->

            <div class="totales">

              <div class="total-linea">
                <span>Productos</span>

                <strong>
                  {{ cotizacion.length }}
                </strong>
              </div>

              <div class="total-linea">
                <span>Total de unidades</span>

                <strong>
                  {{ totalUnidades }}
                </strong>
              </div>

              <div class="separador"></div>

              <div class="total-linea">
                <span>Subtotal</span>

                <strong>
                  {{ formatoMoneda(subtotal) }}
                </strong>
              </div>

              <div class="total-linea">
                <span>IVA</span>

                <strong>
                  {{ formatoMoneda(iva) }}
                </strong>
              </div>

              <div class="separador"></div>

              <div class="total-final">
                <span>
                  Total estimado
                </span>

                <strong>
                  {{ formatoMoneda(total) }}
                </strong>
              </div>

            </div>

            <!-- ACCIONES -->

            <div class="resumen-acciones">

              <button
                type="button"
                class="btn-solicitar"
                @click="pasarAPrestamo"
              >
                <span>📋</span>
                Solicitar estos elementos
              </button>

              <button
                type="button"
                class="btn-secundario"
                @click="limpiarCotizacion"
              >
                Vaciar cotización
              </button>

            </div>

            <!-- NOTA -->

            <div class="nota">

              <span>ⓘ</span>

              <p>
                Esta cotización es un valor estimado.
                El precio final está sujeto a la disponibilidad
                y condiciones del inventario.
              </p>

            </div>

          </div>

        </div>

      </aside>

    </div>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'

const router = useRouter()

// ==============================
// ESTADO
// ==============================

const productos = ref([])
const cotizacion = ref([])
const cantidades = ref({})
const busqueda = ref('')
const cargando = ref(false)
const error = ref('')

// ==============================
// IVA
// ==============================

const PORCENTAJE_IVA = 0.19

// ==============================
// CARGAR PRODUCTOS
// ==============================

const cargarProductos = async () => {
  cargando.value = true
  error.value = ''

  try {
    const respuesta = await api.obtenerProductos()

    productos.value = Array.isArray(respuesta)
      ? respuesta
      : []

  } catch (err) {
    console.error(err)

    error.value =
      err?.message ||
      'Ocurrió un error al cargar los productos.'
  } finally {
    cargando.value = false
  }
}

// ==============================
// FILTRO
// ==============================

const productosFiltrados = computed(() => {
  const termino = busqueda.value.trim().toLowerCase()

  if (!termino) {
    return productos.value
  }

  return productos.value.filter((producto) => {
    const codigo = String(
      producto.codigo || '',
    ).toLowerCase()

    const nombre = String(
      producto.nombre || '',
    ).toLowerCase()

    const descripcion = String(
      producto.descripcion || '',
    ).toLowerCase()

    return (
      codigo.includes(termino) ||
      nombre.includes(termino) ||
      descripcion.includes(termino)
    )
  })
})

// ==============================
// PRODUCTO DISPONIBLE
// ==============================

const productoDisponible = (producto) => {
  const stock = Number(producto.stock || 0)

  if (stock <= 0) {
    return false
  }

  if (producto.activo === false) {
    return false
  }

  if (producto.estado === 'Retirado') {
    return false
  }

  return true
}

// ==============================
// ESTADO PRODUCTO
// ==============================

const textoEstado = (producto) => {
  const stock = Number(producto.stock || 0)

  if (!producto.activo) {
    return 'Inactivo'
  }

  if (producto.estado === 'Retirado') {
    return 'Retirado'
  }

  if (stock <= 0) {
    return 'Sin stock'
  }

  if (
    stock <= Number(producto.stockMinimo || 0)
  ) {
    return 'Stock bajo'
  }

  return 'Disponible'
}

const claseEstado = (producto) => {
  const estado = textoEstado(producto)

  return {
    'estado-disponible': estado === 'Disponible',
    'estado-bajo': estado === 'Stock bajo',
    'estado-sin-stock': estado === 'Sin stock',
    'estado-retirado': estado === 'Retirado',
    'estado-inactivo': estado === 'Inactivo',
  }
}

// ==============================
// IMAGEN
// ==============================

const obtenerImagen = (producto) => {
  return (
    producto.imagen ||
    producto.imagenUrl ||
    producto.urlImagen ||
    producto.image ||
    producto.foto ||
    ''
  )
}

const imagenError = (evento) => {
  evento.target.style.display = 'none'
}

// ==============================
// CANTIDADES
// ==============================

const obtenerIdProducto = (producto) => {
  return String(
    producto._id ||
      producto.id ||
      producto.codigo,
  )
}

const obtenerCantidad = (producto) => {
  const id = obtenerIdProducto(producto)

  return cantidades.value[id] || 1
}

const aumentarCantidad = (producto) => {
  const id = obtenerIdProducto(producto)
  const stock = Number(producto.stock || 0)
  const actual = obtenerCantidad(producto)

  if (actual >= stock) {
    return
  }

  cantidades.value[id] = actual + 1
}

const disminuirCantidad = (producto) => {
  const id = obtenerIdProducto(producto)
  const actual = obtenerCantidad(producto)

  if (actual <= 1) {
    return
  }

  cantidades.value[id] = actual - 1
}

// ==============================
// COTIZACIÓN
// ==============================

const estaEnCotizacion = (producto) => {
  const id = obtenerIdProducto(producto)

  return cotizacion.value.some(
    (item) => item.id === id,
  )
}

const agregarCotizacion = (producto) => {
  const id = obtenerIdProducto(producto)

  const stock = Number(
    producto.stock || 0,
  )

  let cantidad = Number(
    cantidades.value[id] || 1,
  )

  if (cantidad < 1) {
    cantidad = 1
  }

  if (cantidad > stock) {
    cantidad = stock
  }

  const indice = cotizacion.value.findIndex(
    (item) => item.id === id,
  )

  const precio = Number(
    producto.precio || 0,
  )

  const item = {
    id,

    producto:
      producto._id ||
      producto.id,

    codigo:
      producto.codigo || '',

    nombre:
      producto.nombre ||
      'Producto',

    precio,

    cantidad,

    stock,

    imagen:
      obtenerImagen(producto),

    subtotal:
      precio * cantidad,
  }

  if (indice >= 0) {
    cotizacion.value[indice] = item
  } else {
    cotizacion.value.push(item)
  }

  guardarCotizacion()
}

const aumentarItem = (item) => {
  if (
    item.cantidad >=
    item.stock
  ) {
    return
  }

  item.cantidad += 1

  item.subtotal =
    item.precio *
    item.cantidad

  guardarCotizacion()
}

const disminuirItem = (item) => {
  if (item.cantidad <= 1) {
    return
  }

  item.cantidad -= 1

  item.subtotal =
    item.precio *
    item.cantidad

  guardarCotizacion()
}

const eliminarItem = (id) => {
  cotizacion.value =
    cotizacion.value.filter(
      (item) => item.id !== id,
    )

  guardarCotizacion()
}

const limpiarCotizacion = () => {
  cotizacion.value = []
  cantidades.value = {}

  sessionStorage.removeItem(
    'cotizacionCarrito',
  )
}

// ==============================
// TOTALES
// ==============================

const totalUnidades = computed(() => {
  return cotizacion.value.reduce(
    (total, item) =>
      total +
      Number(
        item.cantidad || 0,
      ),
    0,
  )
})

const subtotal = computed(() => {
  return cotizacion.value.reduce(
    (total, item) =>
      total +
      Number(
        item.subtotal || 0,
      ),
    0,
  )
})

const iva = computed(() => {
  return (
    subtotal.value *
    PORCENTAJE_IVA
  )
})

const total = computed(() => {
  return (
    subtotal.value +
    iva.value
  )
})

// ==============================
// FORMATO MONEDA
// ==============================

const formatoMoneda = (valor) => {
  return new Intl.NumberFormat(
    'es-CO',
    {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    },
  ).format(
    Number(valor || 0),
  )
}

// ==============================
// LOCAL STORAGE
// ==============================

const guardarCotizacion = () => {
  sessionStorage.setItem(
    'cotizacionCarrito',
    JSON.stringify(
      cotizacion.value,
    ),
  )
}

const cargarCotizacion = () => {
  try {
    const guardado =
      sessionStorage.getItem(
        'cotizacionCarrito',
      )

    if (!guardado) {
      return
    }

    const datos =
      JSON.parse(guardado)

    if (!Array.isArray(datos)) {
      return
    }

    cotizacion.value =
      datos.map((item) => ({
        ...item,

        cantidad:
          Number(
            item.cantidad || 1,
          ),

        precio:
          Number(
            item.precio || 0,
          ),

        subtotal:
          Number(
            item.precio || 0,
          ) *
          Number(
            item.cantidad || 1,
          ),
      }))

  } catch (err) {
    console.error(
      'No fue posible cargar la cotización:',
      err,
    )

    sessionStorage.removeItem(
      'cotizacionCarrito',
    )
  }
}

// ==============================
// PASAR A PRÉSTAMO
// ==============================

const pasarAPrestamo = () => {
  if (
    cotizacion.value.length === 0
  ) {
    return
  }

  const productosParaPrestamo =
    cotizacion.value.map(
      (item) => ({
        producto:
          item.producto ||
          item.id,

        cantidad:
          Number(
            item.cantidad,
          ),
      }),
    )

  sessionStorage.setItem(
    'carritoPrestamo',
    JSON.stringify(
      productosParaPrestamo,
    ),
  )

  router.push(
    '/aprendiz/prestamos/solicitar',
  )
}

// ==============================
// INICIO
// ==============================

onMounted(() => {
  cargarProductos()
  cargarCotizacion()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

/* ============================== */
/* PÁGINA */
/* ============================== */

.cotizador-page {
  min-height: 100%;
  padding: 28px;
  background: #f5f7fb;
  color: #172033;
}

/* ============================== */
/* HEADER */
/* ============================== */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 28px;
}

.eyebrow {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
  color: #3157a6;
}

.page-header h1 {
  margin: 0;
  font-size: 30px;
  font-weight: 800;
  color: #16213a;
}

.page-header p {
  margin: 7px 0 0;
  color: #68748a;
  font-size: 14px;
}

.btn-limpiar {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #dce2ec;
  border-radius: 10px;
  background: #fff;
  color: #596579;
  padding: 11px 15px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
}

.btn-limpiar:hover {
  background: #f9fafc;
  border-color: #c7cfdd;
}

/* ============================== */
/* MENSAJES */
/* ============================== */

.mensaje {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.estado-cargando {
  background: #fff;
  border: 1px solid #e2e7ef;
  color: #536075;
}

.estado-error {
  background: #fff4f4;
  border: 1px solid #f2caca;
  color: #8e3333;
}

.mensaje-icono {
  font-size: 22px;
}

.estado-error div {
  flex: 1;
}

.estado-error strong {
  display: block;
}

.estado-error p {
  margin: 4px 0 0;
  font-size: 13px;
}

.estado-error button {
  border: 0;
  background: #8e3333;
  color: white;
  border-radius: 8px;
  padding: 9px 14px;
  cursor: pointer;
  font-weight: 700;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #dbe2ee;
  border-top-color: #3157a6;
  border-radius: 50%;
  animation: girar 0.8s linear infinite;
}

@keyframes girar {
  to {
    transform: rotate(360deg);
  }
}

/* ============================== */
/* CONTENIDO */
/* ============================== */

.contenido {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 410px;
  gap: 24px;
  align-items: start;
}

.productos-section,
.resumen-section {
  background: #fff;
  border: 1px solid #e3e8f0;
  border-radius: 16px;
  box-shadow: 0 4px 18px rgba(31, 45, 73, 0.04);
}

.productos-section {
  padding: 22px;
}

/* ============================== */
/* RESUMEN */
/* ============================== */

.resumen-section {
  position: sticky;
  top: 20px;

  /*
   * El resumen completo tiene una altura controlada.
   * La lista de productos tendrá su propio scroll.
   */
  height: min(
    calc(100vh - 48px),
    760px
  );

  display: flex;
  flex-direction: column;

  overflow: hidden;
}

/* ============================== */
/* SECTION TITLE */
/* ============================== */

.section-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 18px;
}

.section-title h2,
.resumen-header h2 {
  margin: 0;
  font-size: 19px;
  font-weight: 800;
  color: #17233d;
}

.section-title p {
  margin: 5px 0 0;
  font-size: 13px;
  color: #788398;
}

.contador-productos,
.contador-carrito {
  background: #eef3ff;
  color: #3157a6;
  border-radius: 20px;
  padding: 7px 11px;
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;
}

/* ============================== */
/* BUSCADOR */
/* ============================== */

.buscador {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.buscador-icono {
  position: absolute;
  left: 14px;
  color: #8a95a8;
  font-size: 23px;
  transform: rotate(-20deg);
}

.buscador input {
  width: 100%;
  height: 45px;
  padding: 0 42px;
  border: 1px solid #dce2eb;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  color: #1b263d;
  background: #fafbfc;
}

.buscador input:focus {
  border-color: #7390c9;
  background: #fff;
}

.limpiar-busqueda {
  position: absolute;
  right: 11px;
  border: 0;
  background: transparent;
  color: #8490a2;
  font-size: 20px;
  cursor: pointer;
}

/* ============================== */
/* PRODUCTOS GRID */
/* ============================== */

.productos-grid {
  display: grid;
  grid-template-columns: repeat(
    2,
    minmax(0, 1fr)
  );
  gap: 16px;
}

.producto-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #e2e7ef;
  border-radius: 13px;
  background: #fff;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    border-color 0.2s;
}

.producto-card:hover {
  transform: translateY(-2px);
  border-color: #ccd5e4;
  box-shadow: 0 8px 22px rgba(34, 52, 83, 0.07);
}

/* ============================== */
/* IMAGEN PRODUCTO */
/* ============================== */

.producto-imagen {
  position: relative;
  height: 155px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f6fa;
  overflow: hidden;
}

.producto-imagen img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 12px;
}

.sin-imagen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #9aa5b6;
  font-size: 42px;
}

.estado-producto {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 8px;
  border-radius: 7px;
  font-size: 10px;
  font-weight: 800;
  background: #fff;
}

.estado-disponible {
  color: #28734d;
  background: #e8f7ef;
}

.estado-bajo {
  color: #8a6715;
  background: #fff5d8;
}

.estado-sin-stock,
.estado-retirado,
.estado-inactivo {
  color: #963f3f;
  background: #fdeaea;
}

/* ============================== */
/* INFO PRODUCTO */
/* ============================== */

.producto-info {
  padding: 15px;
}

.producto-codigo {
  display: block;
  margin-bottom: 4px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.7px;
  color: #7a879b;
  text-transform: uppercase;
}

.producto-info h3 {
  margin: 0;
  font-size: 15px;
  color: #18243c;
}

.producto-descripcion {
  min-height: 34px;
  margin: 6px 0 12px;
  color: #7b879a;
  font-size: 12px;
  line-height: 1.45;
}

.producto-datos {
  display: flex;
  justify-content: space-between;
  gap: 15px;
  padding: 11px 0;
  border-top: 1px solid #edf0f4;
  border-bottom: 1px solid #edf0f4;
}

.producto-datos div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.producto-datos span {
  color: #8a95a7;
  font-size: 10px;
}

.producto-datos strong {
  color: #25324b;
  font-size: 13px;
}

/* ============================== */
/* ACCIONES PRODUCTO */
/* ============================== */

.producto-acciones {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.cantidad-control {
  display: flex;
  align-items: center;
  height: 38px;
  border: 1px solid #dce2ea;
  border-radius: 9px;
  overflow: hidden;
  background: #fff;
}

.cantidad-control button {
  width: 32px;
  height: 100%;
  border: 0;
  background: #f7f8fa;
  color: #42506a;
  font-size: 17px;
  cursor: pointer;
}

.cantidad-control button:hover:not(:disabled) {
  background: #edf1f6;
}

.cantidad-control button:disabled {
  color: #c6ccd5;
  cursor: not-allowed;
}

.cantidad-control span {
  min-width: 31px;
  text-align: center;
  font-size: 12px;
  font-weight: 800;
  color: #26334c;
}

.btn-agregar {
  flex: 1;
  height: 38px;
  border: 0;
  border-radius: 9px;
  background: #3157a6;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s;
}

.btn-agregar:hover {
  background: #28498c;
}

.sin-stock {
  margin-top: 12px;
  padding: 9px;
  border-radius: 8px;
  background: #fdf1f1;
  color: #963f3f;
  text-align: center;
  font-size: 11px;
  font-weight: 800;
}

/* ============================== */
/* SIN RESULTADOS */
/* ============================== */

.sin-resultados {
  padding: 55px 20px;
  text-align: center;
}

.sin-resultados-icono {
  margin-bottom: 10px;
  font-size: 36px;
}

.sin-resultados h3 {
  margin: 0;
  font-size: 16px;
}

.sin-resultados p {
  margin: 7px 0 0;
  color: #7b879a;
  font-size: 13px;
}

/* ============================== */
/* CABECERA RESUMEN */
/* ============================== */

.resumen-header {
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;

  padding: 20px;

  border-bottom: 1px solid #e8ecf2;
}

.resumen-header .eyebrow {
  margin-bottom: 4px;
}

/* ============================== */
/* COTIZACIÓN VACÍA */
/* ============================== */

.cotizacion-vacia {
  flex: 1;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 40px 25px;

  text-align: center;
}

.vacio-icono {
  margin-bottom: 12px;
  font-size: 40px;
}

.cotizacion-vacia h3 {
  margin: 0;
  font-size: 16px;
  color: #26334d;
}

.cotizacion-vacia p {
  margin: 8px auto 0;
  max-width: 260px;
  color: #7d889a;
  font-size: 12px;
  line-height: 1.5;
}

/* ============================== */
/* CONTENIDO COTIZACIÓN */
/* ============================== */

.cotizacion-contenido {
  min-height: 0;
  flex: 1;

  display: flex;
  flex-direction: column;

  padding: 16px;
}

/* ============================== */
/* ZONA SCROLL */
/* ============================== */

.cotizacion-scroll {
  min-height: 0;
  flex: 1;

  overflow: hidden;
}

.cotizacion-lista {
  height: 100%;

  display: flex;
  flex-direction: column;
  gap: 10px;

  overflow-y: auto;

  padding-right: 5px;
  padding-bottom: 4px;

  /*
   * Scroll suave.
   */
  scroll-behavior: smooth;

  /*
   * Barra de desplazamiento.
   */
  scrollbar-width: thin;
  scrollbar-color: #cbd3df transparent;
}

.cotizacion-lista::-webkit-scrollbar {
  width: 6px;
}

.cotizacion-lista::-webkit-scrollbar-track {
  background: transparent;
}

.cotizacion-lista::-webkit-scrollbar-thumb {
  background: #cbd3df;
  border-radius: 10px;
}

.cotizacion-lista::-webkit-scrollbar-thumb:hover {
  background: #aeb8c7;
}

/* ============================== */
/* ITEM COTIZACIÓN */
/* ============================== */

.cotizacion-item {
  flex-shrink: 0;

  display: grid;

  grid-template-columns:
    46px
    minmax(0, 1fr);

  gap: 10px;

  padding: 10px;

  border: 1px solid #e4e8ee;
  border-radius: 10px;

  background: #fafbfd;
}

.item-imagen {
  width: 46px;
  height: 46px;

  display: flex;
  align-items: center;
  justify-content: center;

  overflow: hidden;

  border-radius: 8px;

  background: #eef2f6;

  color: #8c98aa;
}

.item-imagen img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.item-info {
  min-width: 0;

  display: flex;
  flex-direction: column;
  gap: 2px;
}

.item-info strong {
  overflow: hidden;

  color: #26334c;
  font-size: 12px;

  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-info span {
  color: #8a95a6;
  font-size: 9px;
}

.item-info small {
  color: #59667c;
  font-size: 10px;
}

.item-total {
  grid-column: 2;

  color: #1d2d4a;

  font-size: 13px;
  font-weight: 800;
}

.item-controles {
  grid-column: 2;

  display: flex;
  align-items: center;
  gap: 5px;
}

.item-controles button {
  width: 26px;
  height: 26px;

  border: 1px solid #dce2ea;
  border-radius: 6px;

  background: #fff;
  color: #4c5970;

  cursor: pointer;
  font-weight: 700;
}

.item-controles button:disabled {
  color: #c6ccd4;
  cursor: not-allowed;
}

.item-controles span {
  min-width: 25px;

  text-align: center;

  color: #27344d;

  font-size: 11px;
  font-weight: 800;
}

.item-controles .btn-eliminar {
  margin-left: auto;

  border: 0;

  color: #a64b4b;
  background: #fbeeee;

  font-size: 17px;
}

/* ============================== */
/* PARTE FIJA DEL RESUMEN */
/* ============================== */

.resumen-fijo {
  flex-shrink: 0;

  background: #fff;
}

/* ============================== */
/* TOTALES */
/* ============================== */

.totales {
  margin-top: 0;
  padding-top: 15px;

  border-top: 1px solid #e5e9ef;
}

.total-linea {
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 9px;

  color: #758195;

  font-size: 12px;
}

.total-linea strong {
  color: #354159;
}

.separador {
  height: 1px;

  margin: 13px 0;

  background: #e5e9ef;
}

.total-final {
  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 15px;
}

.total-final span {
  color: #26334c;

  font-size: 14px;
  font-weight: 800;
}

.total-final strong {
  color: #203c75;

  font-size: 21px;
  font-weight: 900;
}

/* ============================== */
/* BOTONES RESUMEN */
/* ============================== */

.resumen-acciones {
  display: flex;
  flex-direction: column;

  gap: 8px;

  margin-top: 20px;
}

.btn-solicitar {
  width: 100%;
  height: 43px;

  border: 0;
  border-radius: 9px;

  background: #3157a6;
  color: #fff;

  font-size: 12px;
  font-weight: 800;

  cursor: pointer;
}

.btn-solicitar:hover {
  background: #28498c;
}

.btn-secundario {
  width: 100%;
  height: 38px;

  border: 1px solid #dce2e9;
  border-radius: 9px;

  background: #fff;
  color: #657186;

  font-size: 11px;
  font-weight: 700;

  cursor: pointer;
}

.btn-secundario:hover {
  background: #f7f8fa;
}

/* ============================== */
/* NOTA */
/* ============================== */

.nota {
  display: flex;
  gap: 8px;

  margin-top: 15px;
  padding: 10px;

  border-radius: 8px;

  background: #f4f7fb;
  color: #718096;
}

.nota span {
  flex-shrink: 0;
  font-size: 13px;
}

.nota p {
  margin: 0;

  font-size: 10px;
  line-height: 1.5;
}

/* ============================== */
/* RESPONSIVE */
/* ============================== */

@media (max-width: 1200px) {

  .contenido {
    grid-template-columns:
      minmax(0, 1fr)
      360px;
  }

  .productos-grid {
    grid-template-columns: 1fr;
  }

}

@media (max-width: 950px) {

  .contenido {
    grid-template-columns: 1fr;
  }

  .resumen-section {
    position: static;

    height: auto;
    max-height: none;
  }

  .productos-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .cotizacion-lista {
    max-height: 420px;
  }

}

@media (max-width: 650px) {

  .cotizador-page {
    padding: 16px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .productos-grid {
    grid-template-columns: 1fr;
  }

  .section-title {
    align-items: flex-start;
    flex-direction: column;
  }

  .producto-acciones {
    flex-wrap: wrap;
  }

  .cantidad-control {
    flex: 0 0 auto;
  }

  .btn-agregar {
    min-width: 120px;
  }

}
</style>