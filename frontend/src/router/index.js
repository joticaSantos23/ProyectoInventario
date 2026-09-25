import { createRouter, createWebHistory } from 'vue-router'

import LoginPage from '../pages/LoginPage.vue'

// =========================
// ADMIN
// =========================

import AdminLayout from '../layouts/admin/AdminLayout.vue'
import AdminPage from '../pages/AdminPage.vue'
import ProductosPage from '../pages/ProductosPage.vue'
import CategoriasPage from '../pages/CategoriasPage.vue'
import PrestamosPage from '../pages/PrestamosPage.vue'
import MovimientosPage from '../pages/MovimientosPage.vue'

// =========================
// APRENDIZ
// =========================

import AprendizLayout from '../pages/aprendiz/AprendizLayout.vue'
import AprendizPage from '../pages/aprendiz/AprendizPage.vue'
import InventarioAprendizPage from '../pages/aprendiz/InventarioAprendizPage.vue'
import SolicitarPrestamoPage from '../pages/aprendiz/SolicitarPrestamoPage.vue'
import MisPrestamosPage from '../pages/aprendiz/MisPrestamosPage.vue'
import CotizadorPage from '../pages/aprendiz/CotizadorPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    // =========================
    // LOGIN
    // =========================

    {
      path: '/',
      name: 'login',
      component: LoginPage,
    },

    // =========================
    // ADMINISTRADOR
    // =========================

    {
      path: '/admin',
      component: AdminLayout,
      meta: {
        requiereAutenticacion: true,
      },

      children: [
        {
          path: '',
          name: 'admin',
          component: AdminPage,
        },

        {
          path: 'productos',
          name: 'productos',
          component: ProductosPage,
        },

        {
          path: 'categorias',
          name: 'categorias',
          component: CategoriasPage,
        },

        {
          path: 'prestamos',
          name: 'prestamos',
          component: PrestamosPage,
        },

        {
          path: 'movimientos',
          name: 'movimientos',
          component: MovimientosPage,
        },
      ],
    },

    // =========================
    // APRENDIZ
    // =========================

    {
      path: '/aprendiz',
      component: AprendizLayout,
      meta: {
        requiereAutenticacion: true,
      },

      children: [
        // Inicio del aprendiz

        {
          path: '',
          name: 'aprendiz',
          component: AprendizPage,
        },

        // Inventario

        {
          path: 'inventario',
          name: 'inventario-aprendiz',
          component: InventarioAprendizPage,
        },

        // Solicitar préstamo

        {
          path: 'prestamos/solicitar',
          name: 'solicitar-prestamo',
          component: SolicitarPrestamoPage,
        },

        // Mis préstamos

        {
          path: 'prestamos',
          name: 'mis-prestamos-aprendiz',
          component: MisPrestamosPage,
        },

        // Cotizador

        {
          path: 'cotizador',
          name: 'cotizador',
          component: CotizadorPage,
        },
      ],
    },
  ],
})

// =========================
// PROTECCIÓN DE RUTAS
// =========================

router.beforeEach((to) => {
  // La sesión ahora pertenece a cada pestaña
  const token = sessionStorage.getItem('token')

  if (to.meta.requiereAutenticacion && !token) {
    return { name: 'login' }
  }

  return true
})

export default router