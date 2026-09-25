<script setup>
import { computed } from 'vue'

const usuario = computed(() => {
  try {
    return JSON.parse(sessionStorage.getItem('usuario') || '{}')
  } catch {
    return {}
  }
})

const nombreUsuario = computed(() => {
  return usuario.value.nombre || 'Aprendiz'
})
</script>

<template>
  <q-page class="aprendiz-page">

    <!-- ============================== -->
    <!-- ENCABEZADO -->
    <!-- ============================== -->

    <section class="welcome-section">

      <div>

        <span class="eyebrow">
          PORTAL DEL APRENDIZ
        </span>

        <h1>
          Bienvenido, {{ nombreUsuario }}
        </h1>

        <p>
          Consulta el inventario, solicita equipos y revisa tus préstamos.
        </p>

      </div>

    </section>


    <!-- ============================== -->
    <!-- ACCESOS PRINCIPALES -->
    <!-- ============================== -->

    <section class="quick-section">

      <div class="section-heading">

        <div>
          <h2>
            ¿Qué deseas hacer?
          </h2>

          <p>
            Accede rápidamente a las funciones disponibles.
          </p>
        </div>

      </div>


      <div class="quick-grid">

        <!-- INVENTARIO -->

        <router-link
          to="/aprendiz/inventario"
          class="quick-card"
        >

          <div class="quick-icon blue">
            <q-icon
              name="inventory_2"
              size="26px"
            />
          </div>

          <div class="quick-content">

            <h3>
              Consultar inventario
            </h3>

            <p>
              Revisa los productos y equipos disponibles para préstamo.
            </p>

          </div>

          <q-icon
            name="arrow_forward"
            class="quick-arrow"
            size="20px"
          />

        </router-link>


        <!-- PRÉSTAMOS -->

        <router-link
          to="/aprendiz/prestamos"
          class="quick-card"
        >

          <div class="quick-icon green">
            <q-icon
              name="assignment"
              size="26px"
            />
          </div>

          <div class="quick-content">

            <h3>
              Mis préstamos
            </h3>

            <p>
              Consulta tus solicitudes y revisa el estado de cada préstamo.
            </p>

          </div>

          <q-icon
            name="arrow_forward"
            class="quick-arrow"
            size="20px"
          />

        </router-link>


        <!-- COTIZADOR -->

        <router-link
          to="/aprendiz/cotizador"
          class="quick-card"
        >

          <div class="quick-icon orange">
            <q-icon
              name="calculate"
              size="26px"
            />
          </div>

          <div class="quick-content">

            <h3>
              Cotizador
            </h3>

            <p>
              Calcula el valor estimado de los productos seleccionados.
            </p>

          </div>

          <q-icon
            name="arrow_forward"
            class="quick-arrow"
            size="20px"
          />

        </router-link>

      </div>

    </section>


    <!-- ============================== -->
    <!-- INFORMACIÓN -->
    <!-- ============================== -->

    <section class="info-section">

      <div class="info-card">

        <div class="info-icon">
          <q-icon
            name="info_outline"
            size="25px"
          />
        </div>

        <div>

          <h3>
            ¿Cómo funciona?
          </h3>

          <p>
            Consulta los equipos disponibles, selecciona el producto que
            necesitas y realiza una solicitud de préstamo. Desde
            <strong>Mis préstamos</strong> podrás consultar el estado de tus
            solicitudes.
          </p>

        </div>

      </div>

    </section>

  </q-page>
</template>

<style scoped>
.aprendiz-page {
  padding: 32px;
  background: #f4f7fb;
  min-height: calc(100vh - 72px);
}


/* ================================= */
/* BIENVENIDA */
/* ================================= */

.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;

  margin-bottom: 34px;
}

.eyebrow {
  display: inline-block;

  margin-bottom: 8px;

  font-size: 11px;
  font-weight: 700;

  letter-spacing: 0.08em;

  color: #1976d2;
}

.welcome-section h1 {
  margin: 0;

  font-size: 30px;
  line-height: 1.2;

  font-weight: 700;

  color: #172033;
}

.welcome-section p {
  margin: 9px 0 0;

  font-size: 14px;

  color: #718096;
}


/* ================================= */
/* SECCIÓN */
/* ================================= */

.quick-section {
  margin-bottom: 28px;
}

.section-heading {
  margin-bottom: 16px;
}

.section-heading h2 {
  margin: 0;

  font-size: 18px;
  font-weight: 700;

  color: #172033;
}

.section-heading p {
  margin: 4px 0 0;

  font-size: 13px;

  color: #8792a2;
}


/* ================================= */
/* TARJETAS */
/* ================================= */

.quick-grid {
  display: grid;

  grid-template-columns: repeat(3, 1fr);

  gap: 18px;
}

.quick-card {
  position: relative;

  display: flex;
  align-items: flex-start;

  min-height: 170px;

  padding: 24px;

  background: #ffffff;

  border: 1px solid #e7ebf0;

  border-radius: 16px;

  text-decoration: none;

  box-shadow: 0 5px 20px rgba(15, 35, 60, 0.04);

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.quick-card:hover {
  transform: translateY(-3px);

  border-color: #d6e5f7;

  box-shadow: 0 12px 28px rgba(15, 35, 60, 0.09);
}


/* ================================= */
/* ICONOS */
/* ================================= */

.quick-icon {
  width: 50px;
  height: 50px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 13px;

  margin-right: 16px;
}

.quick-icon.blue {
  background: #eaf2fc;
  color: #1976d2;
}

.quick-icon.green {
  background: #eaf8f1;
  color: #16875b;
}

.quick-icon.orange {
  background: #fff5e8;
  color: #d98216;
}


/* ================================= */
/* CONTENIDO TARJETAS */
/* ================================= */

.quick-content {
  padding-right: 22px;
}

.quick-content h3 {
  margin: 3px 0 7px;

  font-size: 15px;
  font-weight: 700;

  color: #172033;
}

.quick-content p {
  margin: 0;

  font-size: 12px;
  line-height: 1.6;

  color: #7b8797;
}

.quick-arrow {
  position: absolute;

  right: 20px;
  bottom: 20px;

  color: #a0a9b5;

  transition: 0.2s ease;
}

.quick-card:hover .quick-arrow {
  color: #1976d2;

  transform: translateX(3px);
}


/* ================================= */
/* INFORMACIÓN */
/* ================================= */

.info-section {
  margin-top: 8px;
}

.info-card {
  display: flex;
  align-items: flex-start;

  gap: 16px;

  padding: 22px 24px;

  background: #ffffff;

  border: 1px solid #e7ebf0;

  border-radius: 16px;
}

.info-icon {
  width: 44px;
  height: 44px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 12px;

  background: #eaf2fc;
  color: #1976d2;
}

.info-card h3 {
  margin: 1px 0 6px;

  font-size: 15px;
  font-weight: 700;

  color: #172033;
}

.info-card p {
  margin: 0;

  font-size: 13px;
  line-height: 1.65;

  color: #718096;
}

.info-card strong {
  color: #172033;
}


/* ================================= */
/* RESPONSIVE */
/* ================================= */

@media (max-width: 1000px) {
  .quick-grid {
    grid-template-columns: 1fr;
  }

  .quick-card {
    min-height: 135px;
  }
}

@media (max-width: 700px) {
  .aprendiz-page {
    padding: 22px 16px;
  }

  .welcome-section h1 {
    font-size: 25px;
  }

  .welcome-section p {
    font-size: 13px;
  }

  .quick-card {
    padding: 20px;
  }
}
</style>