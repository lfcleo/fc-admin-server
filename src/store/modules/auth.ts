import { defineStore } from "pinia";
import { SelfStorage } from '../securels'
import { UserInfoModel } from "@/models/authModel";

export const useAuthStore = defineStore('authStore', {
    state: () => ({
        token: "",
        refreshToken: "",
        userInfo: {
            id: 0,
            mobile: "",
            email: "",
            name: "",
            avatar: "",
            sex: 0,
            roles: [],
        } as UserInfoModel
    }),
    persist: {
        key: 'AUTH',
        storage: SelfStorage,
    }
})