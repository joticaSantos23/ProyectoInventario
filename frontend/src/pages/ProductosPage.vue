```vue
<template>
  <div class="productos-page">

    <!-- ENCABEZADO -->
    <div class="page-header">
      <div>
        <div class="eyebrow">INVENTARIO</div>

        <h1>Productos</h1>

        <p>
          Consulta y gestión de los productos registrados en el inventario.
        </p>
      </div>

      <!-- BOTONES DEL ENCABEZADO -->
      <div class="acciones-header">
        <q-btn
          color="primary"
          icon="add"
          label="Nuevo producto"
          @click="abrirFormularioCrear"
        />

        <q-btn
          color="primary"
          outline
          icon="refresh"
          label="Actualizar"
          :loading="cargando"
          @click="cargarProductos"
        />
      </div>
    </div>

    <!-- FILTROS -->
    <q-card flat bordered class="filtros-card">
      <q-card-section>
        <div class="row q-col-gutter-md">

          <div class="col-12 col-md-6">
            <q-input
              v-model="filtros.buscar"
              outlined
              dense
              clearable
              label="Buscar producto"
              placeholder="Código o nombre"
              @keyup.enter="cargarProductos"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <div class="col-12 col-md-3">
            <q-select
              v-model="filtros.estado"
              outlined
              dense
              clearable
              label="Estado"
              :options="estados"
            />
          </div>

          <div class="col-12 col-md-3">
            <q-btn
              class="full-width"
              color="primary"
              icon="search"
              label="Buscar"
              :loading="cargando"
              @click="cargarProductos"
            />
          </div>

        </div>
      </q-card-section>
    </q-card>

    <!-- TABLA -->
    <q-card flat bordered class="tabla-card">

      <q-card-section class="tabla-header">
        <div>
          <h2>Listado de productos</h2>

          <span>
            {{ productos.length }} producto(s) encontrado(s)
          </span>
        </div>
      </q-card-section>

      <q-separator />

      <q-table
        flat
        :rows="productos"
        :columns="columnas"
        row-key="_id"
        :loading="cargando"
        no-data-label="No hay productos registrados"
        loading-label="Cargando productos..."
      >

        <!-- IMAGEN -->
        <template #body-cell-imagen="props">
          <q-td :props="props">

            <q-img
              v-if="props.row.imagenUrl"
              :src="props.row.imagenUrl"
              width="55px"
              height="55px"
              fit="contain"
              class="imagen-producto"
            />

            <div
              v-else
              class="sin-imagen"
            >
              <q-icon
                name="image_not_supported"
                size="24px"
              />
            </div>

          </q-td>
        </template>

        <!-- CÓDIGO -->
        <template #body-cell-codigo="props">
          <q-td :props="props">
            <strong>
              {{ props.row.codigo || '—' }}
            </strong>
          </q-td>
        </template>

        <!-- NOMBRE -->
        <template #body-cell-nombre="props">
          <q-td :props="props">

            <div class="nombre-producto">
              {{ props.row.nombre || '—' }}
            </div>

            <div class="descripcion-producto">
              {{ props.row.marca || 'Sin marca' }}

              <span v-if="props.row.modelo">
                · {{ props.row.modelo }}
              </span>
            </div>

          </q-td>
        </template>

        <!-- CATEGORÍA -->
        <template #body-cell-categoria="props">
          <q-td :props="props">
            {{ props.row.categoria?.nombre || 'Sin categoría' }}
          </q-td>
        </template>

        <!-- PRECIO -->
        <template #body-cell-precio="props">
          <q-td :props="props">
            {{ formatearPrecio(props.row.precio) }}
          </q-td>
        </template>

        <!-- STOCK -->
        <template #body-cell-stock="props">
          <q-td :props="props">

            <q-badge
              :color="colorStock(props.row)"
              :label="props.row.stock ?? 0"
            />

          </q-td>
        </template>

        <!-- ESTADO -->
        <template #body-cell-estado="props">
          <q-td :props="props">

            <q-badge
              :color="colorEstado(props.row.estado)"
              :label="props.row.estado || 'Sin estado'"
            />

          </q-td>
        </template>

        <!-- ACCIONES -->
        <template #body-cell-acciones="props">
          <q-td
            :props="props"
            class="acciones-producto"
          >

            <!-- EDITAR -->
            <q-btn
              flat
              round
              dense
              color="primary"
              icon="edit"
              :disable="guardandoProducto"
              @click="abrirFormularioEditar(props.row)"
            >
              <q-tooltip>
                Editar producto
              </q-tooltip>
            </q-btn>

            <!-- ELIMINAR -->
            <q-btn
              flat
              round
              dense
              color="negative"
              icon="delete"
              :disable="guardandoProducto || eliminandoProducto"
              @click="eliminarProducto(props.row)"
            >
              <q-tooltip>
                Eliminar producto
              </q-tooltip>
            </q-btn>

          </q-td>
        </template>

      </q-table>
    </q-card>

    <!-- ================================= -->
    <!-- FORMULARIO PRODUCTO -->
    <!-- ================================= -->

    <q-dialog
      v-model="dialogoProducto"
      persistent
      maximized
    >
      <q-card class="formulario-producto">

        <!-- ENCABEZADO DEL FORMULARIO -->
        <q-card-section class="formulario-header">

          <div>
            <div class="eyebrow">
              INVENTARIO
            </div>

            <h2>
              {{ modoEdicion ? 'Editar producto' : 'Nuevo producto' }}
            </h2>

            <p>
              {{
                modoEdicion
                  ? 'Modifica la información del producto y sus datos de inventario.'
                  : 'Registra la información del producto y sus datos de inventario.'
              }}
            </p>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="guardandoProducto"
            @click="cerrarFormulario"
          />

        </q-card-section>

        <q-separator />

        <!-- CONTENIDO -->
        <q-card-section class="formulario-contenido">

          <!-- INFORMACIÓN GENERAL -->
          <div class="seccion-formulario">

            <div class="titulo-seccion">
              Información general
            </div>

            <div class="row q-col-gutter-md">

              <!-- CÓDIGO -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model="nuevoProducto.codigo"
                  outlined
                  label="Código *"
                  maxlength="50"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- NOMBRE -->
              <div class="col-12 col-md-8">
                <q-input
                  v-model="nuevoProducto.nombre"
                  outlined
                  label="Nombre del producto *"
                  maxlength="150"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- DESCRIPCIÓN -->
              <div class="col-12">
                <q-input
                  v-model="nuevoProducto.descripcion"
                  outlined
                  type="textarea"
                  label="Descripción"
                  rows="3"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- CATEGORÍA -->
              <div class="col-12 col-md-4">
                <q-select
                  v-model="nuevoProducto.categoria"
                  outlined
                  label="Categoría *"
                  :options="categorias"
                  option-label="nombre"
                  option-value="_id"
                  emit-value
                  map-options
                  :loading="cargandoCategorias"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- MARCA -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model="nuevoProducto.marca"
                  outlined
                  label="Marca"
                  maxlength="100"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- MODELO -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model="nuevoProducto.modelo"
                  outlined
                  label="Modelo"
                  maxlength="100"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- PRECIO -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="nuevoProducto.precio"
                  outlined
                  type="number"
                  min="0"
                  label="Precio *"
                  prefix="$"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- STOCK -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="nuevoProducto.stock"
                  outlined
                  type="number"
                  min="0"
                  label="Stock *"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- STOCK MÍNIMO -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="nuevoProducto.stockMinimo"
                  outlined
                  type="number"
                  min="0"
                  label="Stock mínimo *"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- ESTADO -->
              <div class="col-12 col-md-4">
                <q-select
                  v-model="nuevoProducto.estado"
                  outlined
                  label="Estado"
                  :options="estados"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- IMAGEN -->
              <div class="col-12 col-md-8">
                <q-input
                  v-model="nuevoProducto.imagenUrl"
                  outlined
                  label="URL de imagen"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  :disable="guardandoProducto"
                >
                  <template #prepend>
                    <q-icon name="image" />
                  </template>
                </q-input>
              </div>

            </div>
          </div>

          <!-- DATOS DE INVENTARIO -->
          <div class="seccion-formulario">

            <div class="titulo-seccion">
              Datos del inventario
            </div>

            <div class="row q-col-gutter-md">

              <!-- PLACA -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model="nuevoProducto.placa"
                  outlined
                  label="Placa"
                  maxlength="100"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- SERIAL -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model="nuevoProducto.serial"
                  outlined
                  label="Serial"
                  maxlength="150"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- FECHA ADQUISICIÓN -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model="nuevoProducto.fechaAdquisicion"
                  outlined
                  type="date"
                  label="Fecha de adquisición"
                  stack-label
                  :disable="guardandoProducto"
                />
              </div>

              <!-- CENTRO -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model="nuevoProducto.centro"
                  outlined
                  label="Centro"
                  maxlength="150"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- CONSECUTIVO -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model="nuevoProducto.consecutivo"
                  outlined
                  label="Consecutivo"
                  maxlength="100"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- TIPO INVENTARIO -->
              <div class="col-12 col-md-4">
                <q-input
                  v-model="nuevoProducto.tipoInventario"
                  outlined
                  label="Tipo de inventario"
                  maxlength="100"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- MODALIDAD -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="nuevoProducto.modalidadInventario"
                  outlined
                  label="Modalidad de inventario"
                  maxlength="100"
                  :disable="guardandoProducto"
                />
              </div>

              <!-- ATRIBUTOS -->
              <div class="col-12 col-md-6">
                <q-input
                  v-model="nuevoProducto.atributos"
                  outlined
                  label="Atributos"
                  maxlength="500"
                  :disable="guardandoProducto"
                />
              </div>

            </div>
          </div>

        </q-card-section>

        <q-separator />

        <!-- BOTONES -->
        <q-card-actions
          align="right"
          class="formulario-acciones"
        >
          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            :disable="guardandoProducto"
            @click="cerrarFormulario"
          />

          <q-btn
            color="primary"
            icon="save"
            :label="modoEdicion ? 'Guardar cambios' : 'Guardar producto'"
            :loading="guardandoProducto"
            @click="guardarProducto"
          />
        </q-card-actions>

      </q-card>
    </q-dialog>

    <!-- ================================= -->
    <!-- CONFIRMAR ELIMINACIÓN -->
    <!-- ================================= -->

    <q-dialog
      v-model="dialogoEliminar"
      persistent
    >
      <q-card class="dialogo-eliminar">

        <!-- ENCABEZADO -->
        <q-card-section class="dialogo-eliminar-header">

          <div class="icono-eliminar">
            <q-icon
              name="delete_outline"
              size="32px"
            />
          </div>

          <div>
            <div class="titulo-eliminar">
              Eliminar producto
            </div>

            <div class="subtitulo-eliminar">
              Esta acción no se puede deshacer.
            </div>
          </div>

        </q-card-section>

        <!-- CONTENIDO -->
        <q-card-section class="dialogo-eliminar-contenido">

          <p>
            ¿Estás seguro de que deseas eliminar este producto?
          </p>

          <div
            v-if="productoAEliminar"
            class="producto-a-eliminar"
          >

            <div class="producto-eliminar-icono">
              <q-icon
                name="inventory_2"
                size="26px"
              />
            </div>

            <div>
              <div class="producto-eliminar-nombre">
                {{ productoAEliminar.nombre }}
              </div>

              <div class="producto-eliminar-codigo">
                Código:
                {{ productoAEliminar.codigo || 'Sin código' }}
              </div>
            </div>

          </div>

        </q-card-section>

        <q-separator />

        <!-- BOTONES -->
        <q-card-actions
          align="right"
          class="dialogo-eliminar-acciones"
        >

          <q-btn
            flat
            label="Cancelar"
            color="grey-7"
            :disable="eliminandoProducto"
            @click="cancelarEliminar"
          />

          <q-btn
            unelevated
            label="Eliminar producto"
            icon="delete"
            color="negative"
            :loading="eliminandoProducto"
            @click="confirmarEliminar"
          />

        </q-card-actions>

      </q-card>
    </q-dialog>

  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api'

const $q = useQuasar()

const productos = ref([])
const cargando = ref(false)

const filtros = reactive({
  buscar: '',
  estado: '',
})

const estados = [
  'Disponible',
  'Prestado',
  'Mantenimiento',
  'Dañado',
  'Retirado',
]

const columnas = [
  {
    name: 'imagen',
    label: 'IMAGEN',
    field: 'imagenUrl',
    align: 'center',
  },
  {
    name: 'codigo',
    label: 'CÓDIGO',
    field: 'codigo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'nombre',
    label: 'PRODUCTO',
    field: 'nombre',
    align: 'left',
    sortable: true,
  },
  {
    name: 'categoria',
    label: 'CATEGORÍA',
    field: row => row.categoria?.nombre || '',
    align: 'left',
    sortable: true,
  },
  {
    name: 'precio',
    label: 'PRECIO',
    field: 'precio',
    align: 'right',
    sortable: true,
  },
  {
    name: 'stock',
    label: 'STOCK',
    field: 'stock',
    align: 'center',
    sortable: true,
  },
  {
    name: 'estado',
    label: 'ESTADO',
    field: 'estado',
    align: 'center',
    sortable: true,
  },
  {
    name: 'acciones',
    label: 'ACCIONES',
    field: '_id',
    align: 'center',
  },
]

// ============================================
// FORMULARIO PRODUCTO
// ============================================

const dialogoProducto = ref(false)
const guardandoProducto = ref(false)
const cargandoCategorias = ref(false)
const categorias = ref([])
const modoEdicion = ref(false)
const productoEditandoId = ref(null)

// ============================================
// ELIMINAR PRODUCTO
// ============================================

const dialogoEliminar = ref(false)
const productoAEliminar = ref(null)
const eliminandoProducto = ref(false)

const crearProductoVacio = () => ({
  codigo: '',
  nombre: '',
  descripcion: '',
  categoria: '',
  marca: '',
  modelo: '',
  precio: 0,
  stock: 0,
  stockMinimo: 0,
  estado: 'Disponible',
  imagenUrl: '',
  placa: '',
  serial: '',
  fechaAdquisicion: '',
  centro: '',
  consecutivo: '',
  tipoInventario: '',
  modalidadInventario: '',
  atributos: '',
})

const nuevoProducto = reactive(crearProductoVacio())

// ============================================
// CATEGORÍAS
// ============================================

const cargarCategorias = async () => {
  cargandoCategorias.value = true

  try {
    categorias.value = await api.obtenerCategorias()
  } catch (error) {
    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        'No fue posible cargar las categorías.',
    })
  } finally {
    cargandoCategorias.value = false
  }
}

// ============================================
// FORMULARIO
// ============================================

const limpiarFormulario = () => {
  Object.assign(
    nuevoProducto,
    crearProductoVacio(),
  )

  productoEditandoId.value = null
  modoEdicion.value = false
}

const abrirFormularioCrear = async () => {
  limpiarFormulario()

  dialogoProducto.value = true

  if (categorias.value.length === 0) {
    await cargarCategorias()
  }
}

const abrirFormularioEditar = async (producto) => {
  limpiarFormulario()

  modoEdicion.value = true
  productoEditandoId.value = producto._id

  nuevoProducto.codigo = producto.codigo || ''
  nuevoProducto.nombre = producto.nombre || ''
  nuevoProducto.descripcion = producto.descripcion || ''

  nuevoProducto.categoria =
    producto.categoria?._id ||
    producto.categoria ||
    ''

  nuevoProducto.marca = producto.marca || ''
  nuevoProducto.modelo = producto.modelo || ''

  nuevoProducto.precio =
    Number(producto.precio || 0)

  nuevoProducto.stock =
    Number(producto.stock || 0)

  nuevoProducto.stockMinimo =
    Number(producto.stockMinimo || 0)

  nuevoProducto.estado =
    producto.estado || 'Disponible'

  nuevoProducto.imagenUrl =
    producto.imagenUrl || ''

  nuevoProducto.placa =
    producto.placa || ''

  nuevoProducto.serial =
    producto.serial || ''

  nuevoProducto.fechaAdquisicion =
    producto.fechaAdquisicion
      ? String(producto.fechaAdquisicion).slice(0, 10)
      : ''

  nuevoProducto.centro =
    producto.centro || ''

  nuevoProducto.consecutivo =
    producto.consecutivo || ''

  nuevoProducto.tipoInventario =
    producto.tipoInventario || ''

  nuevoProducto.modalidadInventario =
    producto.modalidadInventario || ''

  nuevoProducto.atributos =
    producto.atributos || ''

  dialogoProducto.value = true

  if (categorias.value.length === 0) {
    await cargarCategorias()
  }
}

const cerrarFormulario = () => {
  if (guardandoProducto.value) {
    return
  }

  dialogoProducto.value = false
}

const guardarProducto = async () => {

  if (!nuevoProducto.codigo.trim()) {
    $q.notify({
      type: 'warning',
      message: 'El código del producto es obligatorio.',
    })

    return
  }

  if (!nuevoProducto.nombre.trim()) {
    $q.notify({
      type: 'warning',
      message: 'El nombre del producto es obligatorio.',
    })

    return
  }

  if (!nuevoProducto.categoria) {
    $q.notify({
      type: 'warning',
      message: 'Debes seleccionar una categoría.',
    })

    return
  }

  if (
    nuevoProducto.precio === '' ||
    nuevoProducto.precio === null ||
    Number(nuevoProducto.precio) < 0
  ) {
    $q.notify({
      type: 'warning',
      message: 'El precio debe ser un valor válido.',
    })

    return
  }

  if (
    nuevoProducto.stock === '' ||
    nuevoProducto.stock === null ||
    Number(nuevoProducto.stock) < 0
  ) {
    $q.notify({
      type: 'warning',
      message: 'El stock debe ser un valor válido.',
    })

    return
  }

  if (
    nuevoProducto.stockMinimo === '' ||
    nuevoProducto.stockMinimo === null ||
    Number(nuevoProducto.stockMinimo) < 0
  ) {
    $q.notify({
      type: 'warning',
      message: 'El stock mínimo debe ser un valor válido.',
    })

    return
  }

  guardandoProducto.value = true

  const datosProducto = {
    codigo: nuevoProducto.codigo,
    nombre: nuevoProducto.nombre,
    descripcion: nuevoProducto.descripcion,
    categoria: nuevoProducto.categoria,
    marca: nuevoProducto.marca,
    modelo: nuevoProducto.modelo,
    precio: Number(nuevoProducto.precio),
    stock: Number(nuevoProducto.stock),
    stockMinimo: Number(nuevoProducto.stockMinimo),
    estado: nuevoProducto.estado,
    imagenUrl: nuevoProducto.imagenUrl,
    placa: nuevoProducto.placa,
    serial: nuevoProducto.serial,
    fechaAdquisicion:
      nuevoProducto.fechaAdquisicion || null,
    centro: nuevoProducto.centro,
    consecutivo: nuevoProducto.consecutivo,
    tipoInventario: nuevoProducto.tipoInventario,
    modalidadInventario:
      nuevoProducto.modalidadInventario,
    atributos: nuevoProducto.atributos,
  }

  try {

    if (modoEdicion.value) {

      await api.actualizarProducto(
        productoEditandoId.value,
        datosProducto,
      )

      $q.notify({
        type: 'positive',
        message: 'Producto actualizado correctamente.',
      })

    } else {

      await api.crearProducto(datosProducto)

      $q.notify({
        type: 'positive',
        message: 'Producto creado correctamente.',
      })
    }

    dialogoProducto.value = false

    limpiarFormulario()

    await cargarProductos()

  } catch (error) {

    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        (
          modoEdicion.value
            ? 'No fue posible actualizar el producto.'
            : 'No fue posible crear el producto.'
        ),
    })

  } finally {
    guardandoProducto.value = false
  }
}

// ============================================
// PRODUCTOS
// ============================================

const cargarProductos = async () => {
  cargando.value = true

  try {

    productos.value = await api.obtenerProductos({
      buscar: filtros.buscar,
      estado: filtros.estado,
    })

  } catch (error) {

    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        'No fue posible cargar los productos.',
    })

  } finally {
    cargando.value = false
  }
}

// ============================================
// ELIMINACIÓN
// ============================================

const eliminarProducto = (producto) => {
  productoAEliminar.value = producto
  dialogoEliminar.value = true
}

const cancelarEliminar = () => {

  if (eliminandoProducto.value) {
    return
  }

  dialogoEliminar.value = false
  productoAEliminar.value = null
}

const confirmarEliminar = async () => {

  if (!productoAEliminar.value) {
    return
  }

  eliminandoProducto.value = true

  try {

    await api.eliminarProducto(
      productoAEliminar.value._id,
    )

    dialogoEliminar.value = false
    productoAEliminar.value = null

    $q.notify({
      type: 'positive',
      message: 'Producto eliminado correctamente.',
    })

    await cargarProductos()

  } catch (error) {

    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        'No fue posible eliminar el producto.',
    })

  } finally {
    eliminandoProducto.value = false
  }
}

// ============================================
// UTILIDADES
// ============================================

const formatearPrecio = (valor) => {

  const numero = Number(valor || 0)

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(numero)
}

const colorStock = (producto) => {

  const stock = Number(producto.stock || 0)
  const minimo = Number(producto.stockMinimo || 0)

  if (stock === 0) {
    return 'negative'
  }

  if (stock <= minimo) {
    return 'warning'
  }

  return 'positive'
}

const colorEstado = (estado) => {

  switch (estado) {

    case 'Disponible':
      return 'positive'

    case 'Prestado':
      return 'primary'

    case 'Mantenimiento':
      return 'warning'

    case 'Dañado':
      return 'negative'

    case 'Retirado':
      return 'grey'

    default:
      return 'grey'
  }
}

onMounted(() => {
  cargarProductos()
})
</script>

<style scoped>
.productos-page {
  padding: 28px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
}

.acciones-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.5px;
  color: #1976d2;
  margin-bottom: 6px;
}

.page-header h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
}

.page-header p {
  margin: 6px 0 0;
  color: #6b7280;
}

.filtros-card {
  margin-bottom: 24px;
  border-radius: 12px;
}

.tabla-card {
  border-radius: 12px;
  overflow: hidden;
}

.tabla-header {
  padding: 20px;
}

.tabla-header h2 {
  margin: 0 0 4px;
  font-size: 19px;
  font-weight: 700;
}

.tabla-header span {
  color: #6b7280;
  font-size: 14px;
}

.nombre-producto {
  font-weight: 600;
}

.descripcion-producto {
  margin-top: 3px;
  color: #7a7a7a;
  font-size: 12px;
}

.imagen-producto {
  border-radius: 8px;
  background: #f5f5f5;
}

.sin-imagen {
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #f5f5f5;
  color: #9e9e9e;
}

.acciones-producto {
  white-space: nowrap;
}

/* ==========================================
   FORMULARIO
   ========================================== */

.formulario-producto {
  width: 100%;
  min-height: 100vh;
  background: #f8fafc;
}

.formulario-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 28px 32px;
  background: #ffffff;
}

.formulario-header h2 {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
}

.formulario-header p {
  margin: 6px 0 0;
  color: #6b7280;
}

.formulario-contenido {
  padding: 30px 32px;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

.seccion-formulario {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 24px;
}

.titulo-seccion {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 22px;
  color: #1f2937;
}

.formulario-acciones {
  padding: 18px 32px;
  background: #ffffff;
}

/* ==========================================
   DIÁLOGO ELIMINAR PRODUCTO
   ========================================== */

.dialogo-eliminar {
  width: 100%;
  max-width: 500px;
  border-radius: 16px;
  overflow: hidden;
}

.dialogo-eliminar-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 24px 18px;
}

.icono-eliminar {
  width: 56px;
  height: 56px;
  min-width: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: #fee2e2;
  color: #dc2626;
}

.titulo-eliminar {
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
}

.subtitulo-eliminar {
  margin-top: 4px;
  font-size: 13px;
  color: #6b7280;
}

.dialogo-eliminar-contenido {
  padding: 10px 24px 24px;
}

.dialogo-eliminar-contenido p {
  margin: 0 0 16px;
  color: #4b5563;
  font-size: 15px;
}

.producto-a-eliminar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #f9fafb;
}

.producto-eliminar-icono {
  width: 46px;
  height: 46px;
  min-width: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #ffffff;
  color: #6b7280;
}

.producto-eliminar-nombre {
  font-weight: 700;
  color: #1f2937;
}

.producto-eliminar-codigo {
  margin-top: 4px;
  font-size: 12px;
  color: #6b7280;
}

.dialogo-eliminar-acciones {
  padding: 16px 24px;
  background: #ffffff;
}

@media (max-width: 700px) {

  .productos-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
  }

  .acciones-header {
    width: 100%;
    flex-direction: column;
  }

  .acciones-header .q-btn {
    width: 100%;
  }

  .formulario-header {
    padding: 20px;
  }

  .formulario-contenido {
    padding: 20px 16px;
  }

  .seccion-formulario {
    padding: 18px;
  }

  .formulario-acciones {
    padding: 16px;
  }

  .dialogo-eliminar {
    max-width: calc(100vw - 32px);
  }

  .dialogo-eliminar-header {
    padding: 20px 18px 14px;
  }

  .dialogo-eliminar-contenido {
    padding: 10px 18px 20px;
  }

  .dialogo-eliminar-acciones {
    padding: 14px 18px;
  }
}
</style>
```
