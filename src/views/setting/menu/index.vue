<template>
    <el-container>
        <el-header>
            <div class="left-panel">
                <el-button v-auths="['menu:create:root']" type="primary" icon="Plus"
                    @click="addMenuClick()">新增根菜单</el-button>
            </div>
            <div class="right-panel">
                <el-input v-model="searchWord" placeholder="搜索的菜单标题" maxlength="20"></el-input>
                <el-button v-auths="['menu:read']" type="primary" icon="Search" @click="searchClick"></el-button>
            </div>
        </el-header>
        <el-main class="nopadding">
            <fc-table ref="fcTableRef" rowKey="name" :indent="20" :requestApi="menuList" :columns="columns"
                :pagination="false" :showColumnBtn="false" :showRefreshBtn="false">
                <!-- 菜单标题 -->
                <template #meta.title="scope">
                    <span>{{ scope.row.meta.title }}</span>
                    <span v-if="scope.row.meta?.tag" class="menu-tag">{{ scope.row.meta.tag }}</span>
                </template>
                <!-- 菜单图标 -->
                <template #meta.icon="scope">
                    <el-icon :size="18">
                        <component :is="scope.row.meta.icon"></component>
                    </el-icon>
                </template>
                <!-- 菜单图标 -->
                <template #meta.type="scope">
                    <div>{{ MenuTypeMap[scope.row.meta.type] }}</div>
                </template>
                <!-- 表格操作 -->
                <template #options="scope">
                    <el-button v-auths="['menu:create:sub']" type="primary" icon="Plus" link
                        @click="addMenuClick(scope.row)" v-if="scope.row.meta.type != 'BUTTON'">添加子菜单</el-button>
                    <el-button v-auths="['menu:update']" type="primary" icon="Edit" link
                        @click="editClick(scope.row)">编辑</el-button>
                    <el-popconfirm title="删除后无法恢复！并且所有拥有此菜单角色的管理员都需要重新登录。确定要删除吗?" width="280" :hide-after="0"
                        icon="InfoFilled" @confirm="deleteClick(scope.row)">
                        <template #reference>
                            <el-button v-auths="['menu:delete']" type="danger" :disabled="scope.row.systemMenu"
                                link>删除</el-button>
                        </template>
                    </el-popconfirm>
                </template>
            </fc-table>
        </el-main>

        <el-drawer v-model="dialogFormVisible" :size="1400" :with-header="false" destroy-on-close
            @closed="drawerClosed">
            <action-view :parentMenuTitle="parentMenuTitle" :form-data="formData!" @submit-click="submitClick"
                @cancel-click="() => { dialogFormVisible = false }"></action-view>
        </el-drawer>
    </el-container>
</template>

<script setup lang='ts'>
import { reactive, ref } from 'vue'
import { ColumnProps, FcTableInstance } from "@/components/fcTable/model"
import { menuList, menuDelete } from '@/api/modules/setting';
import { ElMessage } from 'element-plus';
import ActionView from "./components/action.vue"

defineOptions({
    name: "settingMenu"
})

// 菜单类型映射对象
const MenuTypeMap: Record<string, string> = {
    BUTTON: '按钮',
    MENU: '菜单',
    LINK: '外链'
};

// 表格配置项
const columns = reactive<ColumnProps<Menu.MenuOptions>[]>([
    { prop: "meta.title", label: "菜单标题", align: "left" },
    { prop: "meta.icon", label: "菜单图标", width: 80 },
    { prop: "sort", label: "排序" },
    { prop: "meta.type", label: "类型" },
    { prop: "name", label: "名称" },
    { prop: "path", label: "菜单路径", width: 300 },
    { prop: "component", label: "组件路径", width: 300 },
    { prop: "options", label: "操作", width: 280, fixed: "right" }
]);
const searchWord = ref('')                  // 要搜索的内容
const fcTableRef = ref<FcTableInstance>();  // fcTabel 实例
const dialogFormVisible = ref(false)
const parentMenuTitle = ref("根路由")
const formData = ref<Menu.MenuOptions>({
    id: 0,
    parentID: 0,
    systemMenu: false,
    sort: 0,
    path: '',
    name: '',
    redirect: '',
    component: '',
    meta: {
        icon: '',
        title: '',
        type: 'MENU',
        isHide: false,
        isFull: false,
        isAffix: false,
        isKeepAlive: false,
        tag: ''
    }
})

// 搜索内容
const searchClick = () => {
    var form: any = {
        title: searchWord.value
    }
    fcTableRef.value!.searchParam = form
    fcTableRef.value!.search()
}

// 新增菜单
const addMenuClick = (row?: Menu.MenuOptions) => {
    if (row) {
        parentMenuTitle.value = row.meta.title
        formData.value.parentID = row.id!
    }
    dialogFormVisible.value = true
}

// 编辑
const editClick = (row: Menu.MenuOptions) => {
    if (row) {
        var tempMenu = findMenuById(fcTableRef.value!.tableData, row.parentID || 0)
        if (tempMenu) {
            parentMenuTitle.value = tempMenu!.meta.title
        } else {
            parentMenuTitle.value = '根路由'
        }
        formData.value = row
    }
    dialogFormVisible.value = true
}

// 删除
const deleteClick = async (row: Menu.MenuOptions) => {
    //判断是否存在子菜单，存在不允许删除
    if (row.children && row.children.length > 0) {
        ElMessage.error("删除失败，当前菜单目录存在子菜单，不允许删除！");
        return
    }
    await menuDelete({ id: row.id })
    const removed = removeNodeById(fcTableRef.value!.tableData, row.id as number);
    if (removed) {
        ElMessage.success("删除成功");
    } else {
        ElMessage.success("未找到该菜单");
    }
}

// 递归删除
const removeNodeById = (menus: Menu.MenuOptions[], id: number): boolean => {
    for (let i = 0; i < menus.length; i++) {
        const node = menus[i];
        if (node.id === id) {
            // 找到了匹配的节点，从父节点的 children 中移除
            menus.splice(i, 1);
            return true;
        } else if (node.children && node.children.length > 0) {
            // 如果当前节点有子节点，继续递归搜索
            const found = removeNodeById(node.children, id);
            if (found) {
                // 如果在子树中找到了并删除了节点，返回成功
                return true;
            }
        }
    }
    return false; // 如果遍历完所有节点都没有找到，返回失败
};

// 创建/编辑
const submitClick = (valueData: Menu.MenuOptions) => {
    dialogFormVisible.value = false
    // 有ID，编辑。无ID，创建
    if (formData.value.id && formData.value.id > 0) {
        formData.value.systemMenu = valueData.systemMenu
        formData.value.sort = valueData.sort
        formData.value.path = valueData.path
        formData.value.name = valueData.name
        formData.value.redirect = valueData.redirect
        formData.value.component = valueData.component
        formData.value.meta = valueData.meta
        ElMessage.success("修改成功");
    } else {
        var tempMenu = findMenuById(fcTableRef.value!.tableData, valueData.parentID as number)
        if (tempMenu) {
            if (tempMenu.children) {
                tempMenu.children.push(valueData)
            } else {
                tempMenu.children = [valueData]
            }
        } else {
            fcTableRef.value!.tableData.push(valueData)
        }
        ElMessage.success("创建成功");
    }
    console.log(fcTableRef.value!.tableData)
}

//递归菜单数组
const findMenuById = (menus: Menu.MenuOptions[], id: number): Menu.MenuOptions | undefined => {
    for (const obj of menus) {
        if (obj.id === id) {
            return obj;
        }
        if (obj.children) {
            const found = findMenuById(obj.children, id);
            if (found) {
                return found;
            }
        }
    }
    return undefined
}

// 关闭drawer，重新赋值
const drawerClosed = () => {
    parentMenuTitle.value = '根路由'
    formData.value = {
        id: 0,
        parentID: 0,
        systemMenu: false,
        sort: 0,
        path: '',
        name: '',
        redirect: '',
        component: '',
        meta: {
            icon: '',
            title: '',
            type: 'MENU',
            isHide: false,
            isFull: false,
            isAffix: false,
            isKeepAlive: false,
            tag: ''
        }
    }
}

</script>

<style scoped></style>