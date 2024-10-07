import { RouteRecordRaw } from "vue-router";

export default {
    name: "userCenter",
    path: "/userCenter",
    component: () => import("@/views/userCenter/index.vue"),
    meta: {
        icon: "User",
        title: "账号信息",
        type: "MENU",
        isHide: true,
        isKeepAlive: true,
    }
} as RouteRecordRaw