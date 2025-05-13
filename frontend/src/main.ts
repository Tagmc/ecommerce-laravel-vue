import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/tailwind.css";
import "daisyui";
import Toastify from "vue3-toastify";
import "vue3-toastify/dist/index.css";
createApp(App)
  .use(store)
  .use(router)
  .use(Toastify, {
    autoClose: 3000,
    position: "top-right",
    theme: "light",
  })
  .mount("#app");
