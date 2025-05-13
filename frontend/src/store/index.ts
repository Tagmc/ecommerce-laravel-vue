import { createStore } from "vuex";
import auth  from "./modules/auth";
import product from "./modules/product";

const store = createStore({
  modules: {
    auth,
    product
  },
});

export default store;
