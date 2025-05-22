import { createRouter, createWebHistory } from "vue-router";
import Login from "../pages/auth/Login.vue";
import Register from "../pages/auth/Register.vue";
import Dashboard from "../pages/admin/Dashboard.vue";
import store from "../store";
import Home from "../pages/client/Home.vue";
import CategoryManager from "../pages/admin/Category/CategoryManager.vue";
import AdminLayout from "../pages/admin/AdminLayout.vue";
import ProductManager from "../pages/admin/Product/ProductManager.vue";
import ProductList from "../pages/client/Product/ProductList.vue";

const routes = [
  {
    path: "/",
    redirect: "/home",
  },
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, isAdmin: true },
    children: [
      {
        path: "",
        redirect: { name: "Dashboard" },
      },
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
      {
        path: "orders",
        name: "AdminOrders",
        component: () => import("../pages/admin/Order/OrderManager.vue"),
      },
      {
        path: "users",
        name: "admin-users",
        component: () => import("../pages/admin/User/UserManager.vue"), // New route
      },
      // Các route admin khác có thể thêm sau này
      // {
      //   path: "users",
      //   name: "AdminUsers",
      //   component: () => import('../pages/admin/User/UserManager.vue'),
      //   meta: { requiresAuth: true, isAdmin: true }
      // },
      // {
      //   path: "orders",
      //   name: "AdminOrders",
      //   component: () => import('../pages/admin/Order/OrderManager.vue'),
      //   meta: { requiresAuth: true, isAdmin: true }
      // }
    ],
  },
  // Client routes
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
  {
    path: "/products",
    name: "ProductList",
    component: ProductList,
    meta: { requiresAuth: false },
  },
  {
    path: "/products/:id",
    name: "ProductDetail",
    component: () => import("../pages/client/Product/ProductDetail.vue"),
    meta: { requiresAuth: false },
    props: true,
  },

  // Cart & Checkout routes
  {
    path: "/cart",
    name: "Cart",
    component: () => import("../pages/client/Cart/CartPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/checkout",
    name: "Checkout",
    component: () => import("../pages/client/Checkout/CheckoutPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/orders",
    name: "OrderHistory",
    component: () => import("../pages/client/Order/OrderHistory.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/orders/:id",
    name: "OrderDetail",
    component: () => import("../pages/client/Order/OrderDetail.vue"),
    meta: { requiresAuth: true },
    props: true,
  },
  {
    path: "/orders/:id/confirmation",
    name: "OrderConfirmation",
    component: () => import("../pages/client/Order/OrderConfirmation.vue"),
    meta: { requiresAuth: true },
  },
  // // User Profile routes
  // {
  //   path: "/profile",
  //   name: "UserProfile",
  //   component: () => import("../pages/client/User/UserProfile.vue"),
  //   meta: { requiresAuth: true }
  // },
  // {
  //   path: "/orders",
  //   name: "UserOrders",
  //   component: () => import("../pages/client/User/UserOrders.vue"),
  //   meta: { requiresAuth: true }
  // },
  // // Catch all route (404)
  // {
  //   path: "/:pathMatch(.*)*",
  //   name: "NotFound",
  //   component: () => import("../pages/NotFound.vue")
  // }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  },
  linkActiveClass: "router-link-active",
  linkExactActiveClass: "router-link-exact-active",
});

router.beforeEach(async (to, from, next) => {
  const accessToken = localStorage.getItem("access_token");
  let isAuthenticated = store.getters["auth/isAuthenticated"];
  let isAdmin = store.getters["auth/isAdmin"];

  if (accessToken && !store.getters["auth/user"]) {
    try {
      await store.dispatch("auth/fetchUser");
      isAuthenticated = store.getters["auth/isAuthenticated"];
      isAdmin = store.getters["auth/isAdmin"];
    } catch (error) {
      console.error("Failed to fetch user", error);
      await store.dispatch("auth/logout");
      return next("/login");
    }
  }

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({
      path: "/login",
      query: { redirect: to.fullPath },
    });
  }
  if (to.meta.isAdmin && !isAdmin) {
    return next("/home");
  }
  if (["Login", "Register"].includes(to.name as string) && isAuthenticated) {
    const redirectPath = (to.query.redirect as string) || "/home";
    return next(redirectPath);
  }

  next();
});

export default router;
