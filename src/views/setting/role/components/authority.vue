<template>
    <el-container>
        <el-main class="nopadding">
            <el-tabs v-model="activeName">
                <el-tab-pane class="pane" label="菜单权限" name="one" lazy>
                    <fc-tree-filter :border="true" ref="fcTFMenuRef" multiple :request-api="menuList"
                        :default-value="treeFilterValue" :tree-props="tfProps">
                        <template #default="scope">
                            <span>
                                {{ scope.row.data.meta.title + (scope.row.data.meta.type == 'BUTTON' ? ' - 按钮' : '') }}
                            </span>
                        </template>
                        <template #option="scope">
                            <div>{{ scope.row.data.name }}</div>
                        </template>
                    </fc-tree-filter>
                </el-tab-pane>
                <el-tab-pane label="API权限" name="two" lazy>
                    <fc-table ref="fcTableRef" :indent="20" :requestApi="apiListAll" :columns="columns"
                        :showColumnBtn="false" :pagination="false">
                    </fc-table>
                </el-tab-pane>
            </el-tabs>
        </el-main>
        <el-footer style="text-align: center;">
            <el-button class="addBtn" type="primary" :loading="btnLoading" @click="submintClick">
                提交{{ activeName == 'one' ? '菜单权限' : 'API权限' }}
            </el-button>
        </el-footer>
    </el-container>
</template>

<script setup lang='ts'>
import { ref, reactive, watch, nextTick } from 'vue';
import FcTreeFilter from '@/components/fcTreeFilter/index.vue'
import { menuList, apiListAll, roleApis, roleSetApis, roleMenus, roleSetMenus } from '@/api/modules/setting';
import { ColumnProps, FcTableInstance } from "@/components/fcTable/model"
import { APIModel, IDsModel, RoleApisModel, APIPMModel } from "@/models/setting";
import { ElMessage } from 'element-plus';

interface PropsModel {
    roleID: number,
}

const props = defineProps<PropsModel>();
const activeName = ref('one')
const tfProps = {
    children: "children",
    disabled: (data: any) => {
        return data.id == 1     //设置控制台（首页）必选
    }
}
// 表格配置项
const columns = reactive<ColumnProps<APIModel>[]>([
    { type: "selection", fixed: "left", width: 50 },
    { prop: "description", label: "接口描述" },
    { prop: "path", label: "接口路径" }
]);
const fcTFMenuRef = ref<InstanceType<typeof FcTreeFilter>>()    // fcTreeFilter 实例
const fcTableRef = ref<FcTableInstance>();                      // fcTabel 实例
const roleApiArray = ref<APIModel[]>([])                      // 角色的API接口模型数组
const btnLoading = ref(false)                                   // 提交按钮加载动画

const treeFilterValue = ref<string[]>([]);

// 获取角色已设置的菜单列表，并设置在FcTreeFilter上
const getRoleMenus = async () => {
    if (fcTFMenuRef.value && fcTFMenuRef.value.treeData.length > 0 && treeFilterValue.value.length == 0) {
        fcTFMenuRef.value.loading = true
        fcTFMenuRef.value.checkStrictly = true
        var response = await roleMenus({ id: props.roleID })
        if (response.data) {
            treeFilterValue.value = response.data.map(id => id.toString())
        }
        fcTFMenuRef.value.loading = false
        // 解决后端返回父节点 子节点全选中的问题，使用延时防止正式环境dom树刷新了 ，使得el-tree树节点对应的ID也刷新的问题。
        setTimeout(() => {
            nextTick(() => {
                fcTFMenuRef.value!.checkStrictly = false
            })
        }, 10);
    }
}

// 获取角色已设置的API列表
const getRoleApis = async () => {
    if (fcTableRef.value && fcTableRef.value.tableData.length > 0 && roleApiArray.value.length == 0) {
        fcTableRef.value.loading = true
        var response = await roleApis({ id: props.roleID })
        roleApiArray.value = response.data
        toggleApisSelection()
        fcTableRef.value.loading = false
    } else {
        toggleApisSelection()
    }
}

// 设置角色的API接口列表在table数据中
const toggleApisSelection = () => {
    if (!roleApiArray.value || roleApiArray.value.length == 0) return
    fcTableRef.value!.tableData.forEach(api => {
        let result = roleApiArray.value.some(item => item.path == api.path && item.method == api.method)
        // let result = roleApiIDArray.value.includes(api.path);
        if (result) {
            fcTableRef.value!.element!.toggleRowSelection(api, true)
        }
    });
}

// 监听tree-filter数据，有数据后再请求获取角色的菜单列表
watch(
    () => fcTFMenuRef.value?.treeData,
    getRoleMenus,
);

// 监听表格数据，有数据后再请求获取角色的api列表
watch(
    () => fcTableRef.value?.tableData,
    getRoleApis,
);

const submintClick = async () => {
    btnLoading.value = true
    //判断设置菜单权限还是API接口权限
    if (activeName.value == 'one') {
        try {
            var requestData1: IDsModel = {
                id: props.roleID,
                ids: fcTFMenuRef.value?.treeRef?.getCheckedNodes(false, true).map(menu => menu.id)! //把选中的节点及其父节点的ID数组传入
            }
            await roleSetMenus(requestData1)
            btnLoading.value = false
            ElMessage.success("设置成功");
        } catch (error) {
            btnLoading.value = false
            ElMessage.error("设置失败，请重试！");
        }
    } else if (activeName.value == 'two') {
        try {
            var apis: APIPMModel[] = fcTableRef.value!.selectedList.map(item => ({
                path: item.path,
                method: item.method,
            }));
            var requestData2: RoleApisModel = {
                id: props.roleID,
                apis: apis
            }
            await roleSetApis(requestData2)
            btnLoading.value = false
            ElMessage.success("设置成功");
        } catch (error) {
            btnLoading.value = false
            ElMessage.error("设置失败，请重试！");
        }
    }

}

</script>

<style scoped>
.el-tab-pane {
    height: calc(100vh - 155px);
}
</style>