<template>
    <el-container>
        <el-header>
            <div class="left-panel">
                <el-button v-auths="['api:create']" class="addBtn" type="primary" icon="Plus"
                    @click="addApiClick">新增</el-button>
            </div>
            <div class="right-panel">
                <el-select v-model="methodType" placeholder="搜索类型" style="width: 170px">
                    <el-option v-for="item in searchOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
                <el-input v-model="searchWord" placeholder="要搜索的描述"></el-input>
                <el-button v-auths="['api:read']" type="primary" icon="Search" @click="searchClick"></el-button>
            </div>
        </el-header>
        <el-main class="nopadding">
            <fc-table ref="fcTableRef" :indent="20" :requestApi="apiList" :columns="columns">
                <!-- 表格操作 -->
                <template #options="scope">
                    <el-button v-auths="['api:update']" type="primary" icon="Edit" link
                        @click="editClick(scope.row)">编辑</el-button>
                    <el-popconfirm title="删除后无法恢复！并且所有拥有此权限角色的管理员都需要重新登录。确定要删除吗?" width="280" :hide-after="0"
                        icon="InfoFilled" @confirm="deleteClick(scope.row)">
                        <template #reference>
                            <el-button v-auths="['api:delete']" type="danger" link>删除</el-button>
                        </template>
                    </el-popconfirm>
                </template>
            </fc-table>
        </el-main>

        <!-- 创建/编辑弹出框 -->
        <el-dialog v-model="dialogFormVisible" :title="formData.id ? '编辑接口' : '新建接口'" width="500" @closed="dialogClosed"
            destroy-on-close>
            <action-view :formData="formData" @cancel-click="() => { dialogFormVisible = false }"
                @submit-click="submitClick"></action-view>
        </el-dialog>

    </el-container>
</template>

<script setup lang='ts'>
import { ref, reactive } from 'vue'
import { apiList, apiDelete } from '@/api/modules/setting';
import { ColumnProps, FcTableInstance } from "@/components/fcTable/model"
import { APIModel } from "@/models/setting";
import { ElMessage } from 'element-plus';
import ActionView from "./components/action.vue"

defineOptions({
    name: "settingApi"
})

const columns = reactive<ColumnProps<APIModel>[]>([
    { prop: "id", label: "ID", width: 80 },
    { prop: "path", label: "请求路径" },
    { prop: "method", label: "请求方式" },
    { prop: "description", label: "描述" },
    { prop: "options", label: "操作", width: 280, fixed: "right" }
]);
const fcTableRef = ref<FcTableInstance>();  // fcTabel 实例
const dialogFormVisible = ref(false)
const formData = ref<APIModel>({
    id: 0,
    path: '',
    method: '',
    description: '',
})
const methodType = ref('POST')              // 搜索类型
const searchWord = ref('')                  // 要搜索的内容
const searchOptions = [                     // 搜索类型选择数组
    {
        value: 'POST',
        label: 'POST',
    },
    {
        value: 'GET',
        label: 'GET',
    },
    {
        value: 'PUT',
        label: 'PUT',
    },
    {
        value: 'DELETE',
        label: 'DELETE',
    }
]

// 搜索内容
const searchClick = () => {
    fcTableRef.value!.searchParam = {
        method: methodType,
        description: searchWord
    }
    fcTableRef.value!.search()
}

const addApiClick = () => {
    dialogFormVisible.value = true
}

const editClick = (row: APIModel) => {
    formData.value = row
    dialogFormVisible.value = true
}

const dialogClosed = () => {
    formData.value = {
        id: 0,
        path: '',
        method: '',
        description: '',
    }
}

// 删除
const deleteClick = async (row: APIModel) => {
    await apiDelete({ id: row.id })
    for (let i = 0; i < fcTableRef.value!.tableData.length; i++) {
        if (fcTableRef.value!.tableData[i].id === row.id) {
            // 使用 splice 方法从数组中删除对象  
            fcTableRef.value!.tableData.splice(i, 1);
            // 找到后退出循环
            break;
        }
    }
    fcTableRef.value!.pageable.total -= 1
    ElMessage.success("删除成功");
}

// 创建/编辑
const submitClick = (_valueData: APIModel) => {
    // 有ID，编辑。无ID，创建
    if (formData.value.id && formData.value.id > 0) {
        fcTableRef.value!.getTableList();
        ElMessage.success("修改成功");
        dialogFormVisible.value = false
    } else {
        fcTableRef.value!.search();
        ElMessage.success("创建成功");
        dialogFormVisible.value = false
    }
}

</script>

<style scoped></style>