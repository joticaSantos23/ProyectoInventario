<template>
  <div class="prestamos-page">

    <!-- ============================== -->
    <!-- ENCABEZADO -->
    <!-- ============================== -->

    <div class="page-header">
      <div>
        <div class="eyebrow">GESTIÓN DE INVENTARIO</div>

        <h1>Préstamos</h1>

        <p>
          Administra las solicitudes, aprobaciones, entregas y devoluciones
          de equipos del inventario.
        </p>
      </div>

      <div class="acciones-header">
        <q-btn
          color="primary"
          outline
          icon="refresh"
          label="Actualizar"
          :loading="cargando"
          @click="cargarPrestamos"
        />
      </div>
    </div>

    <!-- ============================== -->
    <!-- RESUMEN -->
    <!-- ============================== -->

    <div class="resumen-grid">

      <q-card flat bordered class="resumen-card">
        <q-card-section>
          <div class="resumen-icon resumen-total">
            <q-icon name="inventory_2" size="28px" />
          </div>

          <div class="resumen-info">
            <span>Total préstamos</span>
            <strong>{{ prestamos.length }}</strong>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="resumen-card">
        <q-card-section>
          <div class="resumen-icon resumen-pendiente">
            <q-icon name="pending_actions" size="28px" />
          </div>

          <div class="resumen-info">
            <span>Pendientes</span>
            <strong>{{ cantidadPorEstado('Pendiente') }}</strong>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="resumen-card">
        <q-card-section>
          <div class="resumen-icon resumen-aprobado">
            <q-icon name="check_circle" size="28px" />
          </div>

          <div class="resumen-info">
            <span>Aprobados</span>
            <strong>{{ cantidadPorEstado('Aprobado') }}</strong>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="resumen-card">
        <q-card-section>
          <div class="resumen-icon resumen-entregado">
            <q-icon name="local_shipping" size="28px" />
          </div>

          <div class="resumen-info">
            <span>Entregados</span>
            <strong>{{ cantidadPorEstado('Entregado') }}</strong>
          </div>
        </q-card-section>
      </q-card>

      <q-card flat bordered class="resumen-card">
        <q-card-section>
          <div class="resumen-icon resumen-devuelto">
            <q-icon name="assignment_return" size="28px" />
          </div>

          <div class="resumen-info">
            <span>Devueltos</span>
            <strong>{{ cantidadPorEstado('Devuelto') }}</strong>
          </div>
        </q-card-section>
      </q-card>

    </div>

    <!-- ============================== -->
    <!-- FILTROS -->
    <!-- ============================== -->

    <q-card flat bordered class="filtros-card">
      <q-card-section>
        <div class="filtros-grid">

          <q-input
            v-model="busqueda"
            outlined
            dense
            clearable
            label="Buscar préstamo"
            placeholder="Nombre, identificación o correo"
            class="filtro-busqueda"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>

          <q-select
            v-model="filtroEstado"
            outlined
            dense
            clearable
            emit-value
            map-options
            label="Estado"
            :options="opcionesEstado"
          />

          <q-btn
            flat
            color="primary"
            icon="filter_alt_off"
            label="Limpiar filtros"
            :disable="!busqueda && !filtroEstado"
            @click="limpiarFiltros"
          />

        </div>
      </q-card-section>
    </q-card>

    <!-- ============================== -->
    <!-- TABLA -->
    <!-- ============================== -->

    <q-card flat bordered class="tabla-card">

      <q-card-section class="tabla-header">
        <div>
          <h2>Solicitudes de préstamo</h2>

          <span>
            {{ prestamosFiltrados.length }}
            préstamo(s) mostrado(s)
          </span>
        </div>
      </q-card-section>

      <q-separator />

      <q-table
        flat
        :rows="prestamosFiltrados"
        :columns="columnas"
        row-key="_id"
        :loading="cargando"
        no-data-label="No hay préstamos registrados"
        loading-label="Cargando préstamos..."
        :rows-per-page-options="[10, 20, 50, 0]"
      >

        <!-- SOLICITANTE -->

        <template #body-cell-solicitante="props">
          <q-td :props="props">

            <div class="solicitante-cell">

              <div class="avatar-solicitante">
                <q-icon name="person" size="20px" />
              </div>

              <div>
                <div class="nombre-solicitante">
                  {{ props.row.nombreSolicitante || 'Sin nombre' }}
                </div>

                <div class="dato-secundario">
                  {{ props.row.identificacion || 'Sin identificación' }}
                </div>
              </div>

            </div>

          </q-td>
        </template>

        <!-- CONTACTO -->

        <template #body-cell-contacto="props">
          <q-td :props="props">

            <div class="contacto-cell">

              <span>
                <q-icon name="mail" size="15px" />
                {{ props.row.correo || 'Sin correo' }}
              </span>

              <span>
                <q-icon name="phone" size="15px" />
                {{ props.row.telefono || 'Sin teléfono' }}
              </span>

            </div>

          </q-td>
        </template>

        <!-- PRODUCTOS -->

        <template #body-cell-productos="props">
          <q-td :props="props">

            <div class="productos-cell">

              <q-badge
                color="blue-1"
                text-color="primary"
                :label="`${cantidadProductos(props.row)} producto(s)`"
              />

              <div
                v-for="item in productosVisibles(props.row)"
                :key="item.producto?._id || item._id"
                class="producto-resumen"
              >
                <span>
                  {{ item.producto?.nombre || 'Producto no disponible' }}
                </span>

                <strong>
                  × {{ item.cantidad }}
                </strong>
              </div>

              <span
                v-if="cantidadProductos(props.row) > 2"
                class="mas-productos"
              >
                +{{ cantidadProductos(props.row) - 2 }} más
              </span>

            </div>

          </q-td>
        </template>

        <!-- FECHA DEVOLUCIÓN -->

        <template #body-cell-fechaDevolucionPrevista="props">
          <q-td :props="props">

            <div class="fecha-cell">
              <q-icon name="event" size="17px" />

              {{ formatearFecha(props.row.fechaDevolucionPrevista) }}
            </div>

          </q-td>
        </template>

        <!-- ESTADO -->

        <template #body-cell-estado="props">
          <q-td :props="props">

            <q-badge
              rounded
              class="estado-badge"
              :color="colorEstado(props.row.estado)"
              :label="props.row.estado"
            />

          </q-td>
        </template>

        <!-- FECHA SOLICITUD -->

        <template #body-cell-fechaSolicitud="props">
          <q-td :props="props">

            {{
              formatearFecha(
                props.row.fechaSolicitud || props.row.createdAt,
              )
            }}

          </q-td>
        </template>

        <!-- ACCIONES -->

        <template #body-cell-acciones="props">
          <q-td :props="props" class="acciones-cell">

            <div class="acciones-tabla">

              <!-- VER -->

              <q-btn
                flat
                round
                dense
                color="primary"
                icon="visibility"
                @click="verDetalle(props.row)"
              >
                <q-tooltip>
                  Ver detalle
                </q-tooltip>
              </q-btn>

              <!-- APROBAR -->

              <q-btn
                v-if="props.row.estado === 'Pendiente'"
                flat
                round
                dense
                color="positive"
                icon="check"
                :disable="procesando"
                @click="confirmarAprobacion(props.row)"
              >
                <q-tooltip>
                  Aprobar préstamo
                </q-tooltip>
              </q-btn>

              <!-- RECHAZAR -->

              <q-btn
                v-if="props.row.estado === 'Pendiente'"
                flat
                round
                dense
                color="negative"
                icon="close"
                :disable="procesando"
                @click="abrirRechazo(props.row)"
              >
                <q-tooltip>
                  Rechazar préstamo
                </q-tooltip>
              </q-btn>

              <!-- ENTREGAR -->

              <q-btn
                v-if="props.row.estado === 'Aprobado'"
                flat
                round
                dense
                color="primary"
                icon="local_shipping"
                :disable="procesando"
                @click="confirmarEntrega(props.row)"
              >
                <q-tooltip>
                  Registrar entrega
                </q-tooltip>
              </q-btn>

              <!-- DEVOLVER -->

              <q-btn
                v-if="props.row.estado === 'Entregado'"
                flat
                round
                dense
                color="orange"
                icon="assignment_return"
                :disable="procesando"
                @click="confirmarDevolucion(props.row)"
              >
                <q-tooltip>
                  Registrar devolución
                </q-tooltip>
              </q-btn>

              <!-- ELIMINAR -->

              <q-btn
                v-if="
                  props.row.estado === 'Rechazado' ||
                  props.row.estado === 'Devuelto'
                "
                flat
                round
                dense
                color="negative"
                icon="delete"
                :disable="procesando"
                @click="confirmarEliminacion(props.row)"
              >
                <q-tooltip>
                  Eliminar solicitud
                </q-tooltip>
              </q-btn>

            </div>

          </q-td>
        </template>

      </q-table>

    </q-card>

    <!-- ============================== -->
    <!-- DIALOGO DETALLE -->
    <!-- ============================== -->

    <q-dialog v-model="dialogoDetalle">

      <q-card class="dialogo-detalle">

        <q-card-section class="dialogo-header">

          <div>
            <div class="eyebrow">
              PRÉSTAMO
            </div>

            <h2>
              Detalle de solicitud
            </h2>

            <p>
              Información completa del préstamo seleccionado.
            </p>
          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            @click="dialogoDetalle = false"
          />

        </q-card-section>

        <q-separator />

        <q-card-section
          v-if="prestamoSeleccionado"
          class="detalle-contenido"
        >

          <!-- ESTADO -->

          <div class="detalle-estado">

            <span>
              Estado actual
            </span>

            <q-badge
              rounded
              class="estado-badge"
              :color="colorEstado(prestamoSeleccionado.estado)"
              :label="prestamoSeleccionado.estado"
            />

          </div>

          <!-- DATOS SOLICITANTE -->

          <div class="detalle-seccion">

            <div class="detalle-titulo">
              <q-icon name="person" />
              <span>
                Información del solicitante
              </span>
            </div>

            <div class="detalle-grid">

              <div class="detalle-item">
                <span>Nombre</span>

                <strong>
                  {{ prestamoSeleccionado.nombreSolicitante || '—' }}
                </strong>
              </div>

              <div class="detalle-item">
                <span>Identificación</span>

                <strong>
                  {{ prestamoSeleccionado.identificacion || '—' }}
                </strong>
              </div>

              <div class="detalle-item">
                <span>Área / programa</span>

                <strong>
                  {{ prestamoSeleccionado.areaPrograma || '—' }}
                </strong>
              </div>

              <div class="detalle-item">
                <span>Correo</span>

                <strong>
                  {{ prestamoSeleccionado.correo || '—' }}
                </strong>
              </div>

              <div class="detalle-item">
                <span>Teléfono</span>

                <strong>
                  {{ prestamoSeleccionado.telefono || '—' }}
                </strong>
              </div>

              <div class="detalle-item">
                <span>Lugar de entrega</span>

                <strong>
                  {{ prestamoSeleccionado.lugarEntrega || '—' }}
                </strong>
              </div>

            </div>

          </div>

          <q-separator />

          <!-- FECHAS -->

          <div class="detalle-seccion">

            <div class="detalle-titulo">
              <q-icon name="event" />
              <span>
                Fechas
              </span>
            </div>

            <div class="detalle-grid">

              <div class="detalle-item">
                <span>
                  Fecha de solicitud
                </span>

                <strong>
                  {{
                    formatearFecha(
                      prestamoSeleccionado.fechaSolicitud ||
                        prestamoSeleccionado.createdAt,
                    )
                  }}
                </strong>
              </div>

              <div class="detalle-item">
                <span>
                  Devolución prevista
                </span>

                <strong>
                  {{
                    formatearFecha(
                      prestamoSeleccionado.fechaDevolucionPrevista,
                    )
                  }}
                </strong>
              </div>

              <div class="detalle-item">
                <span>
                  Fecha de aprobación
                </span>

                <strong>
                  {{
                    formatearFecha(
                      prestamoSeleccionado.fechaAprobacion,
                    )
                  }}
                </strong>
              </div>

              <div class="detalle-item">
                <span>
                  Fecha de entrega
                </span>

                <strong>
                  {{
                    formatearFecha(
                      prestamoSeleccionado.fechaEntrega,
                    )
                  }}
                </strong>
              </div>

              <div class="detalle-item">
                <span>
                  Devolución real
                </span>

                <strong>
                  {{
                    formatearFecha(
                      prestamoSeleccionado.fechaDevolucionReal,
                    )
                  }}
                </strong>
              </div>

            </div>

          </div>

          <q-separator />

          <!-- PRODUCTOS -->

          <div class="detalle-seccion">

            <div class="detalle-titulo">
              <q-icon name="inventory_2" />
              <span>
                Productos solicitados
              </span>
            </div>

            <div class="productos-detalle">

              <div
                v-for="item in prestamoSeleccionado.productos || []"
                :key="item.producto?._id || item._id"
                class="producto-detalle"
              >

                <div class="producto-icono">
                  <q-icon
                    name="inventory_2"
                    size="22px"
                  />
                </div>

                <div class="producto-info">

                  <strong>
                    {{
                      item.producto?.nombre ||
                      'Producto no disponible'
                    }}
                  </strong>

                  <span>
                    Código:
                    {{ item.producto?.codigo || '—' }}
                  </span>

                  <span v-if="item.producto?.marca">
                    Marca:
                    {{ item.producto.marca }}
                  </span>

                </div>

                <div class="producto-cantidad">

                  <span>
                    Cantidad
                  </span>

                  <strong>
                    {{ item.cantidad }}
                  </strong>

                </div>

              </div>

            </div>

          </div>

          <!-- OBSERVACIONES -->

          <div
            v-if="prestamoSeleccionado.observaciones"
            class="detalle-seccion"
          >

            <div class="detalle-titulo">
              <q-icon name="notes" />

              <span>
                Observaciones
              </span>
            </div>

            <div class="observaciones">
              {{ prestamoSeleccionado.observaciones }}
            </div>

          </div>

          <!-- MOTIVO RECHAZO -->

          <div
            v-if="prestamoSeleccionado.motivoRechazo"
            class="detalle-seccion rechazo-info"
          >

            <div class="detalle-titulo">
              <q-icon name="info" />

              <span>
                Motivo del rechazo
              </span>
            </div>

            <div class="observaciones">
              {{ prestamoSeleccionado.motivoRechazo }}
            </div>

          </div>

        </q-card-section>

        <q-separator />

        <q-card-actions align="right">

          <q-btn
            flat
            color="grey-7"
            label="Cerrar"
            @click="dialogoDetalle = false"
          />

        </q-card-actions>

      </q-card>

    </q-dialog>

    <!-- ============================== -->
    <!-- DIALOGO APROBAR -->
    <!-- ============================== -->

    <q-dialog
      v-model="dialogoAprobacion"
      persistent
    >

      <q-card class="dialogo-confirmacion">

        <q-card-section class="confirmacion-contenido">

          <div class="confirmacion-icon confirmacion-aprobar">
            <q-icon
              name="check_circle"
              size="38px"
            />
          </div>

          <div class="confirmacion-texto">

            <div class="eyebrow">
              SOLICITUD DE PRÉSTAMO
            </div>

            <h2>
              Aprobar préstamo
            </h2>

            <p>
              ¿Deseas aprobar la solicitud de

              <strong>
                {{
                  prestamoAAprobar?.nombreSolicitante ||
                  'este aprendiz'
                }}
              </strong>?
            </p>

            <div class="confirmacion-info">

              <q-icon
                name="info"
                size="18px"
              />

              <span>
                Al aprobar la solicitud, quedará disponible para registrar
                la entrega del préstamo.
              </span>

            </div>

          </div>

        </q-card-section>

        <q-separator />

        <q-card-actions
          align="right"
          class="dialogo-acciones"
        >

          <q-btn
            flat
            color="grey-7"
            label="Cancelar"
            :disable="procesando"
            @click="cerrarAprobacion"
          />

          <q-btn
            color="positive"
            icon="check"
            label="Aprobar préstamo"
            :loading="procesando"
            @click="aprobar"
          />

        </q-card-actions>

      </q-card>

    </q-dialog>

    <!-- ============================== -->
    <!-- DIALOGO RECHAZO -->
    <!-- ============================== -->

    <q-dialog
      v-model="dialogoRechazo"
      persistent
    >

      <q-card class="dialogo-rechazo">

        <q-card-section class="dialogo-header">

          <div>

            <div class="eyebrow">
              SOLICITUD
            </div>

            <h2>
              Rechazar préstamo
            </h2>

            <p>
              Indica el motivo por el cual se rechaza esta solicitud.
            </p>

          </div>

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="procesando"
            @click="cerrarRechazo"
          />

        </q-card-section>

        <q-separator />

        <q-card-section>

          <div
            v-if="prestamoARechazar"
            class="solicitud-rechazo"
          >

            <strong>
              {{ prestamoARechazar.nombreSolicitante }}
            </strong>

            <span>
              {{ cantidadProductos(prestamoARechazar) }}
              producto(s) solicitado(s)
            </span>

          </div>

          <q-input
            v-model="motivoRechazo"
            outlined
            type="textarea"
            label="Motivo del rechazo *"
            placeholder="Escribe el motivo..."
            rows="5"
            maxlength="500"
            counter
            :disable="procesando"
          />

        </q-card-section>

        <q-separator />

        <q-card-actions
          align="right"
          class="dialogo-acciones"
        >

          <q-btn
            flat
            color="grey-7"
            label="Cancelar"
            :disable="procesando"
            @click="cerrarRechazo"
          />

          <q-btn
            color="negative"
            icon="close"
            label="Rechazar préstamo"
            :loading="procesando"
            @click="rechazar"
          />

        </q-card-actions>

      </q-card>

    </q-dialog>

    <!-- ============================== -->
    <!-- DIALOGO ENTREGAR -->
    <!-- ============================== -->

    <q-dialog
      v-model="dialogoEntrega"
      persistent
    >

      <q-card class="dialogo-confirmacion">

        <q-card-section class="confirmacion-contenido">

          <div class="confirmacion-icon confirmacion-entrega">
            <q-icon
              name="local_shipping"
              size="38px"
            />
          </div>

          <div class="confirmacion-texto">

            <div class="eyebrow">
              ENTREGA DE PRÉSTAMO
            </div>

            <h2>
              Registrar entrega
            </h2>

            <p>
              ¿Deseas registrar la entrega del préstamo de

              <strong>
                {{
                  prestamoAEntregar?.nombreSolicitante ||
                  'este aprendiz'
                }}
              </strong>?
            </p>

            <div class="confirmacion-info">

              <q-icon
                name="inventory_2"
                size="18px"
              />

              <span>
                Al registrar la entrega, se descontará del inventario
                la cantidad correspondiente de cada producto.
              </span>

            </div>

          </div>

        </q-card-section>

        <q-separator />

        <q-card-actions
          align="right"
          class="dialogo-acciones"
        >

          <q-btn
            flat
            color="grey-7"
            label="Cancelar"
            :disable="procesando"
            @click="cerrarEntrega"
          />

          <q-btn
            color="primary"
            icon="local_shipping"
            label="Registrar entrega"
            :loading="procesando"
            @click="entregar"
          />

        </q-card-actions>

      </q-card>

    </q-dialog>

    <!-- ============================== -->
    <!-- DIALOGO DEVOLVER -->
    <!-- ============================== -->

    <q-dialog
      v-model="dialogoDevolucion"
      persistent
    >

      <q-card class="dialogo-confirmacion">

        <q-card-section class="confirmacion-contenido">

          <div class="confirmacion-icon confirmacion-devolucion">
            <q-icon
              name="assignment_return"
              size="38px"
            />
          </div>

          <div class="confirmacion-texto">

            <div class="eyebrow">
              DEVOLUCIÓN DE PRÉSTAMO
            </div>

            <h2>
              Registrar devolución
            </h2>

            <p>
              ¿Deseas registrar la devolución del préstamo de

              <strong>
                {{
                  prestamoADevolver?.nombreSolicitante ||
                  'este aprendiz'
                }}
              </strong>?
            </p>

            <div class="confirmacion-info">

              <q-icon
                name="inventory_2"
                size="18px"
              />

              <span>
                Al registrar la devolución, las cantidades de los productos
                serán reintegradas al stock disponible.
              </span>

            </div>

          </div>

        </q-card-section>

        <q-separator />

        <q-card-actions
          align="right"
          class="dialogo-acciones"
        >

          <q-btn
            flat
            color="grey-7"
            label="Cancelar"
            :disable="procesando"
            @click="cerrarDevolucion"
          />

          <q-btn
            color="orange"
            icon="assignment_return"
            label="Registrar devolución"
            :loading="procesando"
            @click="devolver"
          />

        </q-card-actions>

      </q-card>

    </q-dialog>

    <!-- ============================== -->
    <!-- DIALOGO ELIMINAR -->
    <!-- ============================== -->

    <q-dialog
      v-model="dialogoEliminacion"
      persistent
    >

      <q-card class="dialogo-confirmacion">

        <q-card-section class="confirmacion-contenido">

          <div class="confirmacion-icon confirmacion-eliminar">
            <q-icon
              name="delete_forever"
              size="38px"
            />
          </div>

          <div class="confirmacion-texto">

            <div class="eyebrow">
              ELIMINAR SOLICITUD
            </div>

            <h2>
              Eliminar préstamo
            </h2>

            <p>
              ¿Estás seguro de que deseas eliminar la solicitud de

              <strong>
                {{
                  prestamoAEliminar?.nombreSolicitante ||
                  'este aprendiz'
                }}
              </strong>?
            </p>

            <div class="confirmacion-info confirmacion-info-eliminar">

              <q-icon
                name="warning"
                size="18px"
              />

              <span>
                Esta acción eliminará permanentemente el registro del
                préstamo. No se podrá recuperar después.
              </span>

            </div>

          </div>

        </q-card-section>

        <q-separator />

        <q-card-actions
          align="right"
          class="dialogo-acciones"
        >

          <q-btn
            flat
            color="grey-7"
            label="Cancelar"
            :disable="procesando"
            @click="cerrarEliminacion"
          />

          <q-btn
            color="negative"
            icon="delete"
            label="Eliminar definitivamente"
            :loading="procesando"
            @click="eliminar"
          />

        </q-card-actions>

      </q-card>

    </q-dialog>

  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import api from '../services/api'

const $q = useQuasar()

// ==============================
// ESTADO
// ==============================

const prestamos = ref([])
const cargando = ref(false)
const procesando = ref(false)

const busqueda = ref('')
const filtroEstado = ref(null)

const dialogoDetalle = ref(false)
const prestamoSeleccionado = ref(null)

const dialogoRechazo = ref(false)
const prestamoARechazar = ref(null)
const motivoRechazo = ref('')

const dialogoAprobacion = ref(false)
const prestamoAAprobar = ref(null)

const dialogoEntrega = ref(false)
const prestamoAEntregar = ref(null)

const dialogoDevolucion = ref(false)
const prestamoADevolver = ref(null)

const dialogoEliminacion = ref(false)
const prestamoAEliminar = ref(null)

// ==============================
// TABLA
// ==============================

const columnas = [
  {
    name: 'solicitante',
    label: 'SOLICITANTE',
    field: 'nombreSolicitante',
    align: 'left',
    sortable: true,
  },
  {
    name: 'contacto',
    label: 'CONTACTO',
    field: 'correo',
    align: 'left',
  },
  {
    name: 'productos',
    label: 'PRODUCTOS',
    field: 'productos',
    align: 'left',
  },
  {
    name: 'fechaDevolucionPrevista',
    label: 'DEVOLUCIÓN PREVISTA',
    field: 'fechaDevolucionPrevista',
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
    name: 'fechaSolicitud',
    label: 'SOLICITUD',
    field: 'fechaSolicitud',
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

const opcionesEstado = [
  {
    label: 'Pendiente',
    value: 'Pendiente',
  },
  {
    label: 'Aprobado',
    value: 'Aprobado',
  },
  {
    label: 'Rechazado',
    value: 'Rechazado',
  },
  {
    label: 'Entregado',
    value: 'Entregado',
  },
  {
    label: 'Devuelto',
    value: 'Devuelto',
  },
]

// ==============================
// FILTROS
// ==============================

const prestamosFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase()

  return prestamos.value.filter((prestamo) => {
    const coincideEstado =
      !filtroEstado.value ||
      prestamo.estado === filtroEstado.value

    if (!coincideEstado) {
      return false
    }

    if (!texto) {
      return true
    }

    const nombre = (
      prestamo.nombreSolicitante || ''
    ).toLowerCase()

    const identificacion = (
      prestamo.identificacion || ''
    ).toLowerCase()

    const correo = (
      prestamo.correo || ''
    ).toLowerCase()

    const areaPrograma = (
      prestamo.areaPrograma || ''
    ).toLowerCase()

    return (
      nombre.includes(texto) ||
      identificacion.includes(texto) ||
      correo.includes(texto) ||
      areaPrograma.includes(texto)
    )
  })
})

// ==============================
// RESUMEN
// ==============================

const cantidadPorEstado = (estado) => {
  return prestamos.value.filter(
    (prestamo) => prestamo.estado === estado,
  ).length
}

// ==============================
// CARGAR PRÉSTAMOS
// ==============================

const cargarPrestamos = async () => {
  cargando.value = true

  try {
    prestamos.value = await api.obtenerPrestamos()
  } catch (error) {
    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        'No fue posible cargar los préstamos.',
    })
  } finally {
    cargando.value = false
  }
}

// ==============================
// FILTROS
// ==============================

const limpiarFiltros = () => {
  busqueda.value = ''
  filtroEstado.value = null
}

// ==============================
// PRODUCTOS
// ==============================

const cantidadProductos = (prestamo) => {
  if (!Array.isArray(prestamo?.productos)) {
    return 0
  }

  return prestamo.productos.length
}

const productosVisibles = (prestamo) => {
  if (!Array.isArray(prestamo?.productos)) {
    return []
  }

  return prestamo.productos.slice(0, 2)
}

// ==============================
// ESTADOS
// ==============================

const colorEstado = (estado) => {
  switch (estado) {
    case 'Pendiente':
      return 'orange'

    case 'Aprobado':
      return 'primary'

    case 'Rechazado':
      return 'negative'

    case 'Entregado':
      return 'deep-purple'

    case 'Devuelto':
      return 'positive'

    default:
      return 'grey'
  }
}

// ==============================
// FECHAS
// ==============================

const formatearFecha = (fecha) => {
  if (!fecha) {
    return '—'
  }

  const fechaConvertida = new Date(fecha)

  if (Number.isNaN(fechaConvertida.getTime())) {
    return '—'
  }

  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(fechaConvertida)
}

// ==============================
// DETALLE
// ==============================

const verDetalle = (prestamo) => {
  prestamoSeleccionado.value = prestamo
  dialogoDetalle.value = true
}

// ==============================
// APROBAR
// ==============================

const confirmarAprobacion = (prestamo) => {
  prestamoAAprobar.value = prestamo
  dialogoAprobacion.value = true
}

const cerrarAprobacion = () => {
  if (procesando.value) {
    return
  }

  dialogoAprobacion.value = false
  prestamoAAprobar.value = null
}

const aprobar = async () => {
  if (!prestamoAAprobar.value) {
    return
  }

  procesando.value = true

  try {
    await api.aprobarPrestamo(
      prestamoAAprobar.value._id,
    )

    $q.notify({
      type: 'positive',
      message: 'Préstamo aprobado correctamente.',
    })

    dialogoAprobacion.value = false
    prestamoAAprobar.value = null

    await cargarPrestamos()
  } catch (error) {
    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        'No fue posible aprobar el préstamo.',
    })
  } finally {
    procesando.value = false
  }
}

// ==============================
// RECHAZAR
// ==============================

const abrirRechazo = (prestamo) => {
  prestamoARechazar.value = prestamo
  motivoRechazo.value = ''
  dialogoRechazo.value = true
}

const cerrarRechazo = () => {
  if (procesando.value) {
    return
  }

  dialogoRechazo.value = false
  prestamoARechazar.value = null
  motivoRechazo.value = ''
}

const rechazar = async () => {
  if (!motivoRechazo.value.trim()) {
    $q.notify({
      type: 'warning',
      message: 'El motivo del rechazo es obligatorio.',
    })

    return
  }

  if (!prestamoARechazar.value) {
    return
  }

  procesando.value = true

  try {
    await api.rechazarPrestamo(
      prestamoARechazar.value._id,
      motivoRechazo.value.trim(),
    )

    $q.notify({
      type: 'positive',
      message: 'Préstamo rechazado correctamente.',
    })

    dialogoRechazo.value = false
    prestamoARechazar.value = null
    motivoRechazo.value = ''

    await cargarPrestamos()
  } catch (error) {
    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        'No fue posible rechazar el préstamo.',
    })
  } finally {
    procesando.value = false
  }
}

// ==============================
// ENTREGAR
// ==============================

const confirmarEntrega = (prestamo) => {
  prestamoAEntregar.value = prestamo
  dialogoEntrega.value = true
}

const cerrarEntrega = () => {
  if (procesando.value) {
    return
  }

  dialogoEntrega.value = false
  prestamoAEntregar.value = null
}

const entregar = async () => {
  if (!prestamoAEntregar.value) {
    return
  }

  procesando.value = true

  try {
    await api.entregarPrestamo(
      prestamoAEntregar.value._id,
    )

    $q.notify({
      type: 'positive',
      message:
        'Entrega registrada y stock actualizado correctamente.',
    })

    dialogoEntrega.value = false
    prestamoAEntregar.value = null

    await cargarPrestamos()
  } catch (error) {
    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        'No fue posible registrar la entrega.',
    })
  } finally {
    procesando.value = false
  }
}

// ==============================
// DEVOLVER
// ==============================

const confirmarDevolucion = (prestamo) => {
  prestamoADevolver.value = prestamo
  dialogoDevolucion.value = true
}

const cerrarDevolucion = () => {
  if (procesando.value) {
    return
  }

  dialogoDevolucion.value = false
  prestamoADevolver.value = null
}

const devolver = async () => {
  if (!prestamoADevolver.value) {
    return
  }

  procesando.value = true

  try {
    await api.devolverPrestamo(
      prestamoADevolver.value._id,
    )

    $q.notify({
      type: 'positive',
      message:
        'Devolución registrada y stock actualizado correctamente.',
    })

    dialogoDevolucion.value = false
    prestamoADevolver.value = null

    await cargarPrestamos()
  } catch (error) {
    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        'No fue posible registrar la devolución.',
    })
  } finally {
    procesando.value = false
  }
}

// ==============================
// ELIMINAR
// ==============================

const confirmarEliminacion = (prestamo) => {
  prestamoAEliminar.value = prestamo
  dialogoEliminacion.value = true
}

const cerrarEliminacion = () => {
  if (procesando.value) {
    return
  }

  dialogoEliminacion.value = false
  prestamoAEliminar.value = null
}

const eliminar = async () => {
  if (!prestamoAEliminar.value) {
    return
  }

  procesando.value = true

  try {
    await api.eliminarPrestamo(
      prestamoAEliminar.value._id,
    )

    $q.notify({
      type: 'positive',
      message: 'Solicitud eliminada correctamente.',
    })

    dialogoEliminacion.value = false
    prestamoAEliminar.value = null

    await cargarPrestamos()
  } catch (error) {
    console.error(error)

    $q.notify({
      type: 'negative',
      message:
        error.message ||
        'No fue posible eliminar la solicitud.',
    })
  } finally {
    procesando.value = false
  }
}

// ==============================
// INICIO
// ==============================

onMounted(() => {
  cargarPrestamos()
})
</script>

<style scoped>
.prestamos-page {
  padding: 28px;
}

/* ============================== */
/* ENCABEZADO */
/* ============================== */

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
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
  color: #1f2937;
}

.page-header p {
  margin: 6px 0 0;
  color: #6b7280;
  max-width: 720px;
}

.acciones-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* ============================== */
/* RESUMEN */
/* ============================== */

.resumen-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.resumen-card {
  border-radius: 12px;
}

.resumen-card .q-card__section {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
}

.resumen-icon {
  width: 50px;
  height: 50px;
  min-width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.resumen-total {
  background: #eaf2ff;
  color: #1976d2;
}

.resumen-pendiente {
  background: #fff4df;
  color: #f57c00;
}

.resumen-aprobado {
  background: #e8f1ff;
  color: #1976d2;
}

.resumen-entregado {
  background: #eee9ff;
  color: #673ab7;
}

.resumen-devuelto {
  background: #e7f7ee;
  color: #21a366;
}

.resumen-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.resumen-info span {
  color: #6b7280;
  font-size: 13px;
  white-space: nowrap;
}

.resumen-info strong {
  color: #1f2937;
  font-size: 25px;
  line-height: 1;
}

/* ============================== */
/* FILTROS */
/* ============================== */

.filtros-card {
  border-radius: 12px;
  margin-bottom: 20px;
}

.filtros-grid {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) 220px auto;
  align-items: center;
  gap: 14px;
}

/* ============================== */
/* TABLA */
/* ============================== */

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
  color: #1f2937;
}

.tabla-header span {
  color: #6b7280;
  font-size: 14px;
}

.solicitante-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 190px;
}

.avatar-solicitante {
  width: 38px;
  height: 38px;
  min-width: 38px;
  border-radius: 50%;
  background: #eaf2ff;
  color: #1976d2;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nombre-solicitante {
  font-weight: 600;
  color: #1f2937;
}

.dato-secundario {
  margin-top: 3px;
  font-size: 12px;
  color: #6b7280;
}

.contacto-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
  color: #4b5563;
  font-size: 13px;
}

.contacto-cell span {
  display: flex;
  align-items: center;
  gap: 5px;
}

.productos-cell {
  min-width: 180px;
  max-width: 240px;
}

.producto-resumen {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 5px;
  font-size: 12px;
  color: #4b5563;
}

.producto-resumen span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.producto-resumen strong {
  color: #1f2937;
  white-space: nowrap;
}

.mas-productos {
  display: block;
  margin-top: 5px;
  color: #1976d2;
  font-size: 12px;
}

.fecha-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  white-space: nowrap;
  color: #4b5563;
  font-size: 13px;
}

.estado-badge {
  padding: 6px 10px;
  font-weight: 600;
}

.acciones-cell {
  white-space: nowrap;
}

.acciones-tabla {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

/* ============================== */
/* DIALOGO GENERAL */
/* ============================== */

.dialogo-detalle,
.dialogo-rechazo,
.dialogo-confirmacion {
  width: 100%;
  border-radius: 14px;
}

.dialogo-detalle {
  max-width: 850px;
}

.dialogo-rechazo {
  max-width: 560px;
}

.dialogo-confirmacion {
  max-width: 560px;
}

.dialogo-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
}

.dialogo-header h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
}

.dialogo-header p {
  margin: 6px 0 0;
  color: #6b7280;
}

.dialogo-acciones {
  padding: 16px 20px;
}

/* ============================== */
/* DIALOGOS DE CONFIRMACIÓN */
/* ============================== */

.confirmacion-contenido {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 26px;
}

.confirmacion-icon {
  width: 64px;
  height: 64px;
  min-width: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.confirmacion-aprobar {
  background: #e7f7ee;
  color: #21a366;
}

.confirmacion-entrega {
  background: #eaf2ff;
  color: #1976d2;
}

.confirmacion-devolucion {
  background: #fff4df;
  color: #f57c00;
}

.confirmacion-eliminar {
  background: #fff0f0;
  color: #d32f2f;
}

.confirmacion-texto {
  flex: 1;
  min-width: 0;
}

.confirmacion-texto h2 {
  margin: 0;
  font-size: 23px;
  font-weight: 700;
  color: #1f2937;
}

.confirmacion-texto p {
  margin: 8px 0 0;
  color: #6b7280;
  line-height: 1.5;
}

.confirmacion-texto p strong {
  color: #1f2937;
}

.confirmacion-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 18px;
  padding: 12px 14px;
  border-radius: 10px;
  background: #f8fafc;
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
}

.confirmacion-info .q-icon {
  flex-shrink: 0;
  color: #1976d2;
}

.confirmacion-info-eliminar {
  background: #fff5f5;
  color: #991b1b;
}

.confirmacion-info-eliminar .q-icon {
  color: #d32f2f;
}

/* ============================== */
/* DETALLE */
/* ============================== */

.detalle-contenido {
  max-height: 70vh;
  overflow-y: auto;
}

.detalle-estado {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0 20px;
}

.detalle-estado > span {
  color: #6b7280;
  font-size: 14px;
}

.detalle-seccion {
  padding: 20px 0;
}

.detalle-titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  color: #1976d2;
  font-weight: 700;
}

.detalle-titulo .q-icon {
  font-size: 20px;
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.detalle-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.detalle-item span {
  font-size: 12px;
  color: #6b7280;
}

.detalle-item strong {
  font-size: 14px;
  color: #1f2937;
  word-break: break-word;
}

.productos-detalle {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.producto-detalle {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.producto-icono {
  width: 44px;
  height: 44px;
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #eaf2ff;
  color: #1976d2;
}

.producto-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  flex: 1;
  min-width: 0;
}

.producto-info strong {
  color: #1f2937;
  font-size: 14px;
}

.producto-info span {
  color: #6b7280;
  font-size: 12px;
}

.producto-cantidad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 70px;
}

.producto-cantidad span {
  color: #6b7280;
  font-size: 11px;
}

.producto-cantidad strong {
  font-size: 20px;
  color: #1976d2;
}

.observaciones {
  padding: 14px;
  background: #f8fafc;
  border-radius: 10px;
  color: #4b5563;
  line-height: 1.5;
}

.rechazo-info .detalle-titulo {
  color: #d32f2f;
}

.rechazo-info .observaciones {
  background: #fff5f5;
  color: #991b1b;
}

/* ============================== */
/* RECHAZO */
/* ============================== */

.solicitud-rechazo {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-bottom: 18px;
  padding: 14px;
  background: #f8fafc;
  border-radius: 10px;
}

.solicitud-rechazo strong {
  color: #1f2937;
}

.solicitud-rechazo span {
  color: #6b7280;
  font-size: 13px;
}

/* ============================== */
/* RESPONSIVE */
/* ============================== */

@media (max-width: 1200px) {
  .resumen-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .filtros-grid {
    grid-template-columns: 1fr 200px;
  }

  .filtros-grid .q-btn {
    justify-self: start;
  }
}

@media (max-width: 800px) {
  .prestamos-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
  }

  .acciones-header {
    width: 100%;
  }

  .acciones-header .q-btn {
    width: 100%;
  }

  .resumen-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .filtros-grid {
    grid-template-columns: 1fr;
  }

  .detalle-grid {
    grid-template-columns: 1fr;
  }

  .confirmacion-contenido {
    padding: 22px;
  }
}

@media (max-width: 500px) {
  .resumen-grid {
    grid-template-columns: 1fr;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .producto-detalle {
    align-items: flex-start;
  }

  .confirmacion-contenido {
    flex-direction: column;
  }
}
</style>