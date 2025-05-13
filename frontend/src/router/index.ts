import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/auth/Login.vue";
import Register from "../pages/auth/Register.vue";
import Dashboard from "../pages/admin/Dashboard.vue";
import store from "../store";
import Home from "../pages/client/Home.vue";
import CategoryManager from "../pages/admin/Category/CategoryManager.vue";
import AdminLayout from "../pages/admin/AdminLayout.vue";
import ProductManager from "../pages/admin/Product/ProductManager.vue";

const routes = [
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, isAdmin: true },
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: Dashboard,
      },
      {
        path: "categories",
        name: "AdminCategories",
        component: CategoryManager,
      },
      {
        path: "products",
        name: "AdminProducts",
        component: ProductManager,
      },
      // {
      //   path: "products",
      //   name: "AdminProducts",
      //   component: () => import('../pages/admin/Product/ProductManager.vue'), // nếu có
      // },
      // {
      //   path: "users",
      //   name: "AdminUsers",
      //   component: () => import('../pages/admin/User/UserManager.vue'), // nếu có
      // },
      // {
      //   path: "orders",
      //   name: "AdminOrders",
      //   component: () => import('../pages/admin/Order/OrderManager.vue'), // nếu có
      // }
    ],
  },
  {
    path: "/home",
    name: "Home",
    component: Home,
    meta: { requiresAuth: false },
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
  {
    path: "/register",
    name: "Register",
    component: Register,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const isAuthenticated = store.getters["auth/isAuthenticated"];
  const isAdmin = store.getters["auth/isAdmin"];
  const accessToken = localStorage.getItem('access_token');
   if (accessToken && !store.getters["auth/user"]) {
    try {
      await store.dispatch('auth/fetchUser');
    } catch (error) {
      console.error('Failed to fetch user', error);
      await store.dispatch('auth/logout');
      return next('/login');
    }
  }
  if (to.meta.requiresAuth && !isAuthenticated) {
    return next("/login");
  }
  if (to.meta.isAdmin && !isAdmin) {
    return next("/home");
  }
  if (["Login", "Register"].includes(to.name as string) && isAuthenticated) {
    return next("/home");
  }

  next();
});
export default router;
