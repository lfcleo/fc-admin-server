import { defineStore } from "pinia";
import { SelfStorage } from '../securels'
import { UserInfoModel } from "@/models/authModel";

export const useAuthStore = defineStore('authStore', {
    state: () => ({
        token: "",
        userInfo: {
            userId: "",
            userName: "",
            dashboard: "",
            role: [],
        } as UserInfoModel
    }),
    persist: {
        key: 'AUTH',
        storage: SelfStorage,
    }
})