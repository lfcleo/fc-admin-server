<template>
    <el-container class="page-user">
        <el-aside style="width: 240px;">
            <el-container>
                <el-header style="height: auto;display: block;padding: 20px 0px">
                    <div class="user-info-top">
                        <el-avatar :size="100" :src="authStore.userInfo.avatar"></el-avatar>
                        <h2>{{ authStore.userInfo.name }}</h2>
                    </div>
                </el-header>
                <el-main class="nopadding">
                    <el-menu class="menu" :default-active="selectTitle">
                        <el-menu-item-group v-for="group in menu" :key="group.groupName" :title="group.groupName">
                            <el-menu-item v-for="item in group.list" :key="item.title" :index="item.title"
                                @click="openPage(item)">
                                <el-icon v-if="item.icon">
                                    <component :is="item.icon" />
                                </el-icon>
                                <template #title>
                                    <span>{{ item.title }}</span>
                                </template>
                            </el-menu-item>
                        </el-menu-item-group>
                    </el-menu>
                </el-main>
            </el-container>
        </el-aside>
        <el-main>
            <Suspense>
                <template #default>
                    <component :is="selectComponent" />
                </template>
                <template #fallback>
                    <el-skeleton :rows="3" />
                </template>
            </Suspense>
        </el-main>
    </el-container>
</template>

<script setup lang="ts">
import { DefineComponent, defineAsyncComponent, ref, markRaw } from 'vue'
import { useAuthStore } from "@/store/modules/auth";

defineOptions({
    name: "userCenter"
})

const authStore = useAuthStore()

const account = defineAsyncComponent(() => import('./components/account.vue'))
const pushSettings = defineAsyncComponent(() => import('./components/pushSettings.vue'))
const password = defineAsyncComponent(() => import('./components/password.vue'))
const logs = defineAsyncComponent(() => import('./components/logs.vue'))

const selectTitle = ref("账号信息")
const selectComponent = ref<DefineComponent>(markRaw(account) as DefineComponent)

interface MenuModel {
    groupName: string;
    list: ListModel[];
}

interface ListModel {
    icon: string;
    title: string;
    component: DefineComponent;
}

const menu = [
    {
        groupName: "基本设置",
        list: [
            {
                icon: "Postcard",
                title: "账号信息",
                component: account
            },
            {
                icon: "Lock",
                title: "密码",
                component: password
            },
            {
                icon: "Bell",
                title: "通知设置",
                component: pushSettings
            }
        ]
    },
    {
        groupName: "数据管理",
        list: [

            {
                icon: "Clock",
                title: "操作日志",
                component: logs
            }
        ]
    }
] as MenuModel[]

const openPage = (item: ListModel) => {
    selectTitle.value = item.title
    selectComponent.value = markRaw(item.component)
}
</script>