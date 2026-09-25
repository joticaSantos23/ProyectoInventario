<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import api from '../services/api'

const router = useRouter()
const $q = useQuasar()

const cargando = ref(true)

const estadisticas = ref({
  totalProductos: 0,
  productosDisponibles: 0,
  productosPrestados: 0,
  productosStockBajo: 0,
  productosSinStock: 0,
})

const porcentajeDisponibles = computed(() => {
  if (!estadisticas.value.totalProductos) return 0

  return Math.round(
    (estadisticas.value.productosDisponibles /
      estadisticas.value.totalProductos) *
      100,
  )
})

const porcentajePrestados = computed(() => {
  if (!estadisticas.value.totalProductos) return 0

  return Math.round(
    (estadisticas.value.productosPrestados /
      estadisticas.value.totalProductos) *
      100,
  )
})

const porcentajeStockBajo = computed(() => {
  if (!estadisticas.value.totalProductos) return 0

  return Math.round(
    (estadisticas.value.productosStockBajo /
      estadisticas.value.totalProductos) *
      100,
  )
})

const porcentajeSinStock = computed(() => {
  if (!estadisticas.value.totalProductos) return 0

  return Math.round(
    (estadisticas.value.productosSinStock /
      estadisticas.value.totalProductos) *
      100,
  )
})

const cargarDashboard = async () => {
  cargando.value = true

  try {
    const resumen = await api.obtenerDashboard()

    estadisticas.value = {
      totalProductos: resumen.totalProductos ?? 0,
      productosDisponibles: resumen.productosDisponibles ?? 0,
      productosPrestados: resumen.productosPrestados ?? 0,
      productosStockBajo: resumen.productosStockBajo ?? 0,
      productosSinStock: resumen.productosSinStock ?? 0,
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.message || 'No fue posible cargar el dashboard.',
      position: 'top-right',
      timeout: 3500,
    })
  } finally {
    cargando.value = false
  }
}

const irAProductos = () => {
  router.push('/admin/productos')
}

const irACategorias = () => {
  router.push('/admin/categorias')
}

const irAPrestamos = () => {
  router.push('/admin/prestamos')
}

const irAMovimientos = () => {
  router.push('/admin/movimientos')
}

onMounted(() => {
  cargarDashboard()
})
</script>

<template>
  <div class="dashboard-page">
    <div class="page-content">

      <!-- ENCABEZADO -->
      <div class="page-heading">
        <div>
          <div class="eyebrow">
            PANEL ADMINISTRATIVO
          </div>

          <h1>
            Resumen del inventario
          </h1>

          <p>
            Control y seguimiento de los equipos y elementos registrados.
          </p>
        </div>

        <div class="heading-actions">
          <q-btn
            outline
            no-caps
            icon="refresh"
            label="Actualizar"
            color="primary"
            :loading="cargando"
            @click="cargarDashboard"
          />
        </div>
      </div>

      <!-- CARGANDO -->
      <div
        v-if="cargando"
        class="loading-container"
      >
        <q-spinner
          color="primary"
          size="40px"
        />

        <span>
          Cargando información del inventario...
        </span>
      </div>

      <!-- DASHBOARD -->
      <template v-else>

        <!-- ============================= -->
        <!-- TARJETAS PRINCIPALES -->
        <!-- ============================= -->

        <div class="stats-grid">

          <!-- TOTAL -->
          <q-card
            flat
            bordered
            class="stat-card stat-card-blue"
          >
            <q-card-section>

              <div class="stat-icon">
                <q-icon
                  name="inventory_2"
                  size="27px"
                />
              </div>

              <div class="stat-info">
                <span class="stat-label">
                  Total de productos
                </span>

                <strong>
                  {{ estadisticas.totalProductos }}
                </strong>

                <small>
                  Elementos registrados
                </small>
              </div>

            </q-card-section>
          </q-card>

          <!-- DISPONIBLES -->
          <q-card
            flat
            bordered
            class="stat-card stat-card-green"
          >
            <q-card-section>

              <div class="stat-icon">
                <q-icon
                  name="check_circle"
                  size="27px"
                />
              </div>

              <div class="stat-info">
                <span class="stat-label">
                  Disponibles
                </span>

                <strong>
                  {{ estadisticas.productosDisponibles }}
                </strong>

                <small>
                  {{ porcentajeDisponibles }}% del inventario
                </small>
              </div>

            </q-card-section>
          </q-card>

          <!-- PRESTADOS -->
          <q-card
            flat
            bordered
            class="stat-card stat-card-orange"
          >
            <q-card-section>

              <div class="stat-icon">
                <q-icon
                  name="assignment"
                  size="27px"
                />
              </div>

              <div class="stat-info">
                <span class="stat-label">
                  Prestados
                </span>

                <strong>
                  {{ estadisticas.productosPrestados }}
                </strong>

                <small>
                  {{ porcentajePrestados }}% del inventario
                </small>
              </div>

            </q-card-section>
          </q-card>

          <!-- STOCK BAJO -->
          <q-card
            flat
            bordered
            class="stat-card stat-card-yellow"
          >
            <q-card-section>

              <div class="stat-icon">
                <q-icon
                  name="warning"
                  size="27px"
                />
              </div>

              <div class="stat-info">
                <span class="stat-label">
                  Stock bajo
                </span>

                <strong>
                  {{ estadisticas.productosStockBajo }}
                </strong>

                <small>
                  {{ porcentajeStockBajo }}% del inventario
                </small>
              </div>

            </q-card-section>
          </q-card>

          <!-- SIN STOCK -->
          <q-card
            flat
            bordered
            class="stat-card stat-card-red"
          >
            <q-card-section>

              <div class="stat-icon">
                <q-icon
                  name="remove_circle"
                  size="27px"
                />
              </div>

              <div class="stat-info">
                <span class="stat-label">
                  Sin stock
                </span>

                <strong>
                  {{ estadisticas.productosSinStock }}
                </strong>

                <small>
                  {{ porcentajeSinStock }}% del inventario
                </small>
              </div>

            </q-card-section>
          </q-card>

        </div>

        <!-- ============================= -->
        <!-- BLOQUE CENTRAL -->
        <!-- ============================= -->

        <div class="main-grid">

          <!-- ESTADO DEL INVENTARIO -->
          <q-card
            flat
            bordered
            class="dashboard-card inventory-status-card"
          >
            <q-card-section>

              <div class="card-header">

                <div>
                  <div class="card-title">
                    Estado del inventario
                  </div>

                  <div class="card-subtitle">
                    Distribución actual de los productos
                  </div>
                </div>

                <div class="card-header-icon">
                  <q-icon
                    name="analytics"
                    size="21px"
                  />
                </div>

              </div>

              <div class="inventory-summary">

                <div class="inventory-total">
                  <strong>
                    {{ estadisticas.totalProductos }}
                  </strong>

                  <span>
                    Productos registrados
                  </span>
                </div>

                <div class="inventory-bars">

                  <!-- DISPONIBLES -->
                  <div class="bar-item">

                    <div class="bar-info">
                      <span>
                        <i class="legend-dot dot-green"></i>
                        Disponibles
                      </span>

                      <strong>
                        {{ estadisticas.productosDisponibles }}
                      </strong>
                    </div>

                    <q-linear-progress
                      :value="estadisticas.totalProductos
                        ? estadisticas.productosDisponibles /
                          estadisticas.totalProductos
                        : 0"
                      rounded
                      size="9px"
                      color="positive"
                      track-color="grey-3"
                    />

                  </div>

                  <!-- PRESTADOS -->
                  <div class="bar-item">

                    <div class="bar-info">
                      <span>
                        <i class="legend-dot dot-orange"></i>
                        Prestados
                      </span>

                      <strong>
                        {{ estadisticas.productosPrestados }}
                      </strong>
                    </div>

                    <q-linear-progress
                      :value="estadisticas.totalProductos
                        ? estadisticas.productosPrestados /
                          estadisticas.totalProductos
                        : 0"
                      rounded
                      size="9px"
                      color="warning"
                      track-color="grey-3"
                    />

                  </div>

                  <!-- STOCK BAJO -->
                  <div class="bar-item">

                    <div class="bar-info">
                      <span>
                        <i class="legend-dot dot-yellow"></i>
                        Stock bajo
                      </span>

                      <strong>
                        {{ estadisticas.productosStockBajo }}
                      </strong>
                    </div>

                    <q-linear-progress
                      :value="estadisticas.totalProductos
                        ? estadisticas.productosStockBajo /
                          estadisticas.totalProductos
                        : 0"
                      rounded
                      size="9px"
                      color="orange"
                      track-color="grey-3"
                    />

                  </div>

                  <!-- SIN STOCK -->
                  <div class="bar-item">

                    <div class="bar-info">
                      <span>
                        <i class="legend-dot dot-red"></i>
                        Sin stock
                      </span>

                      <strong>
                        {{ estadisticas.productosSinStock }}
                      </strong>
                    </div>

                    <q-linear-progress
                      :value="estadisticas.totalProductos
                        ? estadisticas.productosSinStock /
                          estadisticas.totalProductos
                        : 0"
                      rounded
                      size="9px"
                      color="negative"
                      track-color="grey-3"
                    />

                  </div>

                </div>
              </div>

            </q-card-section>
          </q-card>

          <!-- INVENTARIO QUE REQUIERE ATENCIÓN -->
          <q-card
            flat
            bordered
            class="dashboard-card attention-card"
          >
            <q-card-section>

              <div class="card-header">

                <div>
                  <div class="card-title">
                    Inventario que requiere atención
                  </div>

                  <div class="card-subtitle">
                    Productos que necesitan revisión
                  </div>
                </div>

                <div class="attention-header-icon">
                  <q-icon
                    name="priority_high"
                    size="21px"
                  />
                </div>

              </div>

              <div class="attention-list">

                <!-- SIN STOCK -->
                <div class="attention-item">

                  <div class="attention-icon attention-red">
                    <q-icon
                      name="remove_circle"
                      size="21px"
                    />
                  </div>

                  <div class="attention-info">
                    <strong>
                      {{ estadisticas.productosSinStock }}
                    </strong>

                    <span>
                      Productos sin stock
                    </span>
                  </div>

                  <q-btn
                    flat
                    round
                    dense
                    icon="chevron_right"
                    color="grey-7"
                    @click="irAProductos"
                  />

                </div>

                <!-- STOCK BAJO -->
                <div class="attention-item">

                  <div class="attention-icon attention-yellow">
                    <q-icon
                      name="warning"
                      size="21px"
                    />
                  </div>

                  <div class="attention-info">
                    <strong>
                      {{ estadisticas.productosStockBajo }}
                    </strong>

                    <span>
                      Productos con stock bajo
                    </span>
                  </div>

                  <q-btn
                    flat
                    round
                    dense
                    icon="chevron_right"
                    color="grey-7"
                    @click="irAProductos"
                  />

                </div>

                <!-- PRESTADOS -->
                <div class="attention-item">

                  <div class="attention-icon attention-blue">
                    <q-icon
                      name="assignment"
                      size="21px"
                    />
                  </div>

                  <div class="attention-info">
                    <strong>
                      {{ estadisticas.productosPrestados }}
                    </strong>

                    <span>
                      Productos actualmente prestados
                    </span>
                  </div>

                  <q-btn
                    flat
                    round
                    dense
                    icon="chevron_right"
                    color="grey-7"
                    @click="irAPrestamos"
                  />

                </div>

              </div>

            </q-card-section>
          </q-card>

        </div>

        <!-- ============================= -->
        <!-- ACCIONES RÁPIDAS -->
        <!-- ============================= -->

        <q-card
          flat
          bordered
          class="dashboard-card quick-card"
        >
          <q-card-section>

            <div class="card-header">

              <div>
                <div class="card-title">
                  Acciones rápidas
                </div>

                <div class="card-subtitle">
                  Accede rápidamente a las funciones principales
                </div>
              </div>

              <div class="card-header-icon">
                <q-icon
                  name="bolt"
                  size="21px"
                />
              </div>

            </div>

            <div class="quick-actions">

              <q-btn
                outline
                no-caps
                icon="inventory_2"
                label="Administrar productos"
                color="primary"
                @click="irAProductos"
              />

              <q-btn
                outline
                no-caps
                icon="category"
                label="Gestionar categorías"
                color="primary"
                @click="irACategorias"
              />

              <q-btn
                outline
                no-caps
                icon="assignment"
                label="Gestionar préstamos"
                color="primary"
                @click="irAPrestamos"
              />

              <q-btn
                outline
                no-caps
                icon="swap_vert"
                label="Ver movimientos"
                color="primary"
                @click="irAMovimientos"
              />

            </div>

          </q-card-section>
        </q-card>

      </template>

    </div>
  </div>
</template>

<style scoped>
.dashboard-page {
  min-height: 100%;
  background: #f4f7fb;
}

.page-content {
  width: 100%;
  max-width: 1550px;
  margin: 0 auto;
  padding: 30px;
  box-sizing: border-box;
}

/* ============================= */
/* ENCABEZADO */
/* ============================= */

.page-heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 25px;
}

.eyebrow {
  margin-bottom: 7px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.11em;
  color: #1976d2;
}

.page-heading h1 {
  margin: 0;
  font-size: 29px;
  line-height: 1.2;
  font-weight: 700;
  color: #172033;
}

.page-heading p {
  margin: 8px 0 0;
  color: #718096;
  font-size: 13px;
}

.heading-actions {
  flex-shrink: 0;
}

.heading-actions :deep(.q-btn) {
  min-height: 42px;
  border-radius: 10px;
  padding: 0 17px;
}

/* ============================= */
/* LOADING */
/* ============================= */

.loading-container {
  min-height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  color: #718096;
  font-size: 13px;
}

/* ============================= */
/* ESTADÍSTICAS */
/* ============================= */

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
}

.stat-card {
  min-width: 0;
  border-radius: 15px;
  border-color: #e4e9ef;
  background: #ffffff;
  overflow: hidden;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 9px 25px rgba(23, 32, 51, 0.07);
}

.stat-card :deep(.q-card__section) {
  display: flex;
  align-items: center;
  gap: 14px;
  min-height: 112px;
  padding: 19px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
}

.stat-card-blue .stat-icon {
  background: #e8f1fc;
  color: #1976d2;
}

.stat-card-green .stat-icon {
  background: #e9f7ef;
  color: #18864b;
}

.stat-card-orange .stat-icon {
  background: #fff2df;
  color: #d97706;
}

.stat-card-yellow .stat-icon {
  background: #fff7d9;
  color: #b7791f;
}

.stat-card-red .stat-icon {
  background: #ffebeb;
  color: #c62828;
}

.stat-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 11px;
  color: #8792a2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stat-info strong {
  margin-top: 4px;
  font-size: 25px;
  line-height: 1;
  font-weight: 700;
  color: #172033;
}

.stat-info small {
  margin-top: 6px;
  font-size: 10px;
  color: #a0a9b5;
}

/* ============================= */
/* BLOQUE CENTRAL */
/* ============================= */

.main-grid {
  display: grid;
  grid-template-columns: 1.45fr 1fr;
  gap: 17px;
  margin-top: 17px;
}

.dashboard-card {
  border-radius: 15px;
  border-color: #e4e9ef;
  background: #ffffff;
}

.dashboard-card :deep(.q-card__section) {
  padding: 22px;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #172033;
}

.card-subtitle {
  margin-top: 4px;
  font-size: 11px;
  color: #909aaa;
}

.card-header-icon,
.attention-header-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: #edf4fc;
  color: #1976d2;
}

.attention-header-icon {
  background: #fff0ee;
  color: #d63c3c;
}

/* ============================= */
/* ESTADO DEL INVENTARIO */
/* ============================= */

.inventory-summary {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 28px;
  margin-top: 28px;
  align-items: center;
}

.inventory-total {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 145px;
  border-radius: 14px;
  background: #f6f8fb;
}

.inventory-total strong {
  font-size: 36px;
  line-height: 1;
  color: #172033;
}

.inventory-total span {
  max-width: 100px;
  margin-top: 9px;
  text-align: center;
  font-size: 10px;
  line-height: 1.4;
  color: #8b96a6;
}

.inventory-bars {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.bar-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11px;
  color: #667085;
}

.bar-info span {
  display: flex;
  align-items: center;
  gap: 7px;
}

.bar-info strong {
  color: #172033;
  font-size: 12px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot-green {
  background: #21a366;
}

.dot-orange {
  background: #f29932;
}

.dot-yellow {
  background: #d99a20;
}

.dot-red {
  background: #d63c3c;
}

/* ============================= */
/* ATENCIÓN */
/* ============================= */

.attention-list {
  display: flex;
  flex-direction: column;
  margin-top: 18px;
}

.attention-item {
  display: flex;
  align-items: center;
  gap: 13px;
  min-height: 67px;
  border-bottom: 1px solid #edf0f4;
}

.attention-item:last-child {
  border-bottom: none;
}

.attention-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
}

.attention-red {
  background: #ffebeb;
  color: #c62828;
}

.attention-yellow {
  background: #fff5df;
  color: #d97706;
}

.attention-blue {
  background: #eaf2fc;
  color: #1976d2;
}

.attention-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.attention-info strong {
  font-size: 16px;
  line-height: 1.2;
  color: #172033;
}

.attention-info span {
  margin-top: 3px;
  font-size: 10px;
  color: #8b96a6;
}

/* ============================= */
/* ACCIONES RÁPIDAS */
/* ============================= */

.quick-card {
  margin-top: 17px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 21px;
}

.quick-actions :deep(.q-btn) {
  min-height: 48px;
  border-radius: 10px;
  justify-content: flex-start;
}

/* ============================= */
/* RESPONSIVE */
/* ============================= */

@media (max-width: 1250px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .main-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 850px) {
  .page-content {
    padding: 23px 18px;
  }

  .page-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .inventory-summary {
    grid-template-columns: 1fr;
  }

  .inventory-total {
    min-height: 110px;
  }

  .quick-actions {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 560px) {
  .page-content {
    padding: 20px 14px;
  }

  .page-heading h1 {
    font-size: 24px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }

  .dashboard-card :deep(.q-card__section) {
    padding: 18px;
  }

  .inventory-summary {
    gap: 18px;
  }
}
</style>