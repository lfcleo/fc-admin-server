<template>
    <el-container>
        <el-header>
            <div class="left-panel">
                <el-button v-auths="['role:create']" class="addBtn" type="primary" icon="Plus"
                    @click="addRoleClick">新增</el-button>
            </div>
            <div class="right-panel">
                <el-select v-model="searchType" placeholder="搜索类型" style="width: 160px">
                    <el-option v-for="item in searchOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
                <el-input v-model="searchWord" placeholder="输入搜索内容，为空搜索全部。" maxlength="20"></el-input>
                <el-button v-auths="['role:read']" type="primary" icon="Search" @click="searchClick"></el-button>
            </div>
        </el-header>
        <el-main class="nopadding">
            <fc-table ref="fcTableRef" :requestApi="roleList" :columns="columns">
                <template #notes="scope">
                    <div class="el-form-item-msg"> {{ scope.row.notes }} </div>
                </template>
                <template #options="scope">
                    <el-button v-auths="['role:update']" type="primary" icon="Edit" link
                        :disabled="scope.row.id == 1 ? true : false" @click="editClick(scope.row)">编辑信息</el-button>
                    <el-button v-auths="['role:set']" type="primary" icon="Setting" link
                        :disabled="scope.row.id == 1 ? true : false" @click="editRoleClick(scope.row)">设置权限</el-button>
                    <el-popconfirm title="删除后无法恢复！并且所有拥有此角色的管理员都需要重新登录。确定要删除吗?" width="280" :hide-after="0"
                        icon="InfoFilled" @confirm="deleteClick(scope.row)">
                        <template #reference>
                            <el-button v-auths="['role:delete']" type="danger" link
                                :disabled="scope.row.id == 1 ? true : false">删除</el-button>
                        </template>
                    </el-popconfirm>
                </template>
            </fc-table>
        </el-main>

        <!-- 创建/编辑弹出框 -->
        <el-dialog v-model="dialogFormVisible" :title="formData.id ? '编辑角色' : '新建角色'" width="500" @closed="dialogClosed"
            destroy-on-close>
            <action-view :formData="formData" @cancel-click="() => { dialogFormVisible = false }"
                @submit-click="submitClick"></action-view>
        </el-dialog>

        <!-- 抽屉视图 -->
        <el-drawer v-model="editViewVisible" :size="800" :with-header="false" destroy-on-close>
            <authority-view v-if="editViewVisible" :roleID="selectRoleID"></authority-view>
        </el-drawer>
    </el-container>
</template>

<script setup lang='ts'>
import { ref, reactive } from 'vue'
import { ColumnProps, FcTableInstance } from "@/components/fcTable/model"
import { roleList, roleDelete } from '@/api/modules/setting';
import { RoleModel } from "@/models/setting";
import { ElMessage } from 'element-plus';
import ActionView from "./components/action.vue"
import AuthorityView from "./components/authority.vue"

defineOptions({
    name: "settingRole"
})

const fcTableRef = ref<FcTableInstance>();  // fcTabel 实例
const dialogFormVisible = ref(false)
const editViewVisible = ref(false)
const selectRoleID = ref<number>(0)
const searchType = ref('name')              // 搜索类型
const searchWord = ref('')                  // 要搜索的内容
const searchOptions = [                     // 搜索类型选择数组
    {
        value: 'name',
        label: '名 称',
    },
    {
        value: 'code',
        label: '标 识',
    }
]

// 表格配置项
const columns = reactive<ColumnProps<RoleModel>[]>([
    { prop: "id", label: "ID", width: 80 },
    { prop: "code", label: "角色标识" },
    { prop: "name", label: "角色名称" },
    { prop: "notes", label: "备注" },
    { prop: "options", label: "操作", width: 280, fixed: "right" }
]);

const formData = ref<RoleModel>({
    id: 0,
    name: '',
    code: '',
    notes: ''
})

// 搜索内容
const searchClick = () => {
    var form: any = {}
    form[searchType.value] = searchWord.value
    fcTableRef.value!.searchParam = form
    fcTableRef.value!.search()
}

// 新增角色
const addRoleClick = () => {
    dialogFormVisible.value = true
}

// 编辑信息
const editClick = (row: RoleModel) => {
    formData.value = row
    dialogFormVisible.value = true
}

// 编辑权限
const editRoleClick = (row: RoleModel) => {
    selectRoleID.value = row.id as number
    editViewVisible.value = true
}

// 删除角色
const deleteClick = async (row: RoleModel) => {
    await roleDelete({ id: row.id })
    fcTableRef.value!.getTableList()
    ElMessage.success("删除成功");
}

// 关闭dialog，重新赋值
const dialogClosed = () => {
    formData.value = {
        id: 0,
        name: '',
        code: '',
        notes: ''
    }
}

// 创建/编辑
const submitClick = async (_valueData: RoleModel) => {
    // 有ID，编辑。无ID，创建
    if (formData.value.id && formData.value.id > 0) {
        fcTableRef.value!.getTableList();
        ElMessage.success("修改成功");
        dialogFormVisible.value = false
    } else {
        fcTableRef.value!.reset();
        ElMessage.success("创建成功");
        dialogFormVisible.value = false
    }
}

</script>

<style scoped></style>