import { createStore } from "vuex";
import auth  from "./modules/auth";
import product from "./modules/product";
import category from "./modules/category";
import cart from "./modules/cart";
import order from "./modules/order";
import user from "./modules/user";

const store = createStore({
  modules: {
    auth,
    product,
    category,
    cart,
    order,
    user
  },
});

export default store;
