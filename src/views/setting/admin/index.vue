<template>
    <el-container>
        <el-header>
            <div class="left-panel">
                <el-button v-auths="['admin:create']" class="addBtn" type="primary" icon="Plus"
                    @click="() => { dialogFormVisible = true }">新增管理员</el-button>
            </div>
            <div class="right-panel">
                <el-select v-model="statusType" placeholder="状态" style="width: 150px">
                    <el-option v-for="item in statusOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
                <el-select v-model="searchType" placeholder="搜索类型" style="width: 160px">
                    <el-option v-for="item in searchOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                </el-select>
                <el-input v-model="searchWord" placeholder="输入搜索内容，为空搜索全部。" maxlength="25"></el-input>
                <el-button v-auths="['admin:read']" type="primary" icon="Search" @click="searchClick"></el-button>
            </div>
        </el-header>
        <el-main class="nopadding">
            <fc-table ref="fcTableRef" :indent="20" :requestApi="getAdminList" :columns="columns">
                <template #avatar="scope">
                    <el-avatar :size="50" :src="scope.row.avatar" @click="showImgView(scope.row.avatar)" />
                </template>
                <template #sex="scope">
                    <div v-if="scope.row.sex == 1">未知</div>
                    <div v-if="scope.row.sex == 2">男</div>
                    <div v-if="scope.row.sex == 3">女</div>
                </template>
                <template #status="scope">
                    <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="2"
                        :loading="scope.row.statusLoading" :before-change="() => statusBeforeChange(scope.row)"
                        :disabled="scope.row.id == 1 ? true : false" />
                </template>
                <template #roles="scope">
                    <el-select :ref="(el: selectRefItem) => handleSetSelectMap(el, scope.row.id)"
                        v-model="scope.row.roles" :disabled="scope.row.id == 1 ? true : false" multiple collapse-tags
                        :max-collapse-tags="3" placeholder="选择角色权限" @visible-change="visibleChange($event, scope.row)"
                        style="width: 240px">
                        <el-option v-for="item in roleArray" :key="item.id" :label="item.name" :value="item.code" />
                        <ElSelectLoading :page="selectPage" :loading="selectLoading" v-if="selectHasMore"
                            @loadMore="selectHandleLoadMore" />
                        <template #footer>
                            <div style="text-align: right;">
                                <el-button size="small" @click="selectCancelClick(scope.row.id)">取消</el-button>
                                <el-button :loading="selectSubmitLoading" type="primary" size="small"
                                    @click="selectSubmitClick(scope.row)">确定</el-button>
                            </div>
                        </template>
                    </el-select>
                </template>
                <template #createdAt="scope">
                    <!-- 使用了自定义指令，时间转为年月日时分 -->
                    <div v-timeYMDHM="scope.row.createdAt"></div>
                </template>
                <!-- 表格操作 -->
                <template #options="scope">
                    <el-button v-auths="['admin:update']" type="primary" icon="Edit" link @click="editClick(scope.row)"
                        :disabled="scope.row.id == 1 ? true : false">编辑</el-button>
                    <el-button v-auths="['admin:password']" type="primary" icon="Refresh" link
                        :disabled="scope.row.id == 1 ? true : false" @click="resetPassword(scope.row)">重置密码</el-button>
                    <el-popconfirm title="确定要删除吗?" @confirm="deleteClick(scope.row)">
                        <template #reference>
                            <el-button v-auths="['admin:delete']" type="danger" link
                                :disabled="scope.row.id == 1 ? true : false">删除</el-button>
                        </template>
                    </el-popconfirm>
                </template>
            </fc-table>
        </el-main>

        <!-- 创建/编辑弹出框 -->
        <el-dialog v-model="dialogFormVisible" :title="formData.id ? '编辑管理员' : '新建管理员'" width="500"
            @closed="dialogClosed" :close-on-click-modal="false" destroy-on-close>
            <action-view :formData="formData" @cancel-click="() => { dialogFormVisible = false }"
                @submit-click="submitClick"></action-view>
        </el-dialog>

        <!-- 头像预览组件 -->
        <el-image-viewer v-if="imgViewVisible" :url-list="[avatarUrl]" @close="imgViewVisible = false" />
    </el-container>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted, ComponentPublicInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { adminList, adminUpdate, adminResetPwd, adminDelete, roleList, adminSetRole } from "@/api/modules/setting"
import { ColumnProps, FcTableInstance } from "@/components/fcTable/model"
import { AdminUserModel, TableAdminUserModel, AdminPwdModel, RoleModel, AdminRoleModel } from "@/models/setting";
import ActionView from "./components/action.vue"
import encryptionTool from "@/utils/encryption"
import ElSelectLoading from "./components/elSelectLoading.vue";

defineOptions({
    name: "settingAdmin"
})

const columns = reactive<ColumnProps<AdminUserModel>[]>([
    { prop: "id", label: "ID", width: 80 },
    { prop: "avatar", label: "头像", width: 100 },
    { prop: "name", label: "昵称" },
    { prop: "email", label: "邮箱" },
    { prop: "mobile", label: "手机号" },
    { prop: "sex", label: "性别" },
    { prop: "status", label: "启用" },
    { prop: "roles", label: "角色权限", width: 280 },
    { prop: "createdAt", label: "创建时间" },
    { prop: "options", label: "操作", width: 280, fixed: "right" }
]);
const fcTableRef = ref<FcTableInstance>();  // fcTabel 实例
const statusType = ref(-1)                  // 要搜索的状态类型
const statusOptions = [
    {
        value: -1,
        label: '全 部',
    },
    {
        value: 1,
        label: '启 用',
    },
    {
        value: 2,
        label: '禁 用',
    }
]
const searchType = ref('name')              // 搜索类型
const searchWord = ref('')                  // 要搜索的内容
const searchOptions = [                     // 搜索类型选择数组
    {
        value: 'name',
        label: '昵 称',
    },
    {
        value: 'email',
        label: '邮 箱',
    },
    {
        value: 'mobile',
        label: '手机号',
    }
]
const dialogFormVisible = ref(false)
const imgViewVisible = ref(false)           //是否avatar预览
const avatarUrl = ref('')                   //要查看的头像img地址
const formData = ref<AdminUserModel>({      //创建/修改管理员用户模型
    id: 0,
    mobile: '',
    email: '',
    name: '',
    avatar: import.meta.env.VITE_DEFAULT_AVATAR_URL,    //使用默认头像地址
    sex: 1,
    status: 0,
    roles: [],
    password: '',
})
type selectRefItem = Element | ComponentPublicInstance | null;
const selectRefMap = ref<any>({});          //el-select实例(动态设置)
const selectSubmitLoading = ref(false)      //el-select控制提交按钮loading
const roleArray = ref<RoleModel[]>([]);     //角色列表
const selectPage = ref(1);                  //el-select数据当前页码
const selectLoading = ref(false);           //el-select是否加载中，用来过滤重复的加载
const selectHasMore = ref(true);            //el-select是否有更多数据可加载
const selectRowRole = ref<string[]>([])     //正在编辑el-select中的角色数据

onMounted(() => {
    getRoleList(selectPage.value)           // 获取角色列表
})

// el-select获取角色列表
const getRoleList = async (newPage: number) => {
    try {
        selectLoading.value = true;
        const res = await roleList({ page: newPage, pageSize: 20 });
        const list = res.data.list || [];
        if (newPage === 1) {
            roleArray.value = [];
        }
        roleArray.value.push(...list);
        selectHasMore.value = roleArray.value.length < res.data.total;
        selectPage.value = newPage;
        selectLoading.value = false;
    } catch (error) {
        selectLoading.value = false;
    }
}

// el-select加载更多数据
const selectHandleLoadMore = async (newPage: number) => {
    await getRoleList(newPage);
};

// 表格获取数据
const getAdminList = (params: any) => {
    let newParams = JSON.parse(JSON.stringify(params));
    newParams.status = statusType.value
    return adminList(newParams);
};

// 搜索内容
const searchClick = () => {
    var form: any = {}
    form[searchType.value] = searchWord.value
    fcTableRef.value!.searchParam = form
    fcTableRef.value!.search()
}

// 设置启用状态
const statusBeforeChange = (row: TableAdminUserModel) => {
    row.statusLoading = true
    return new Promise(async (resolve, reject) => {
        try {
            var requestData: AdminUserModel = { ...row }
            requestData.status = row.status == 1 ? 2 : 1
            await adminUpdate(requestData)
            ElMessage.success("修改成功");
            row.statusLoading = false
            return resolve(true)
        } catch (error) {
            row.statusLoading = false
            return reject(error)
        }
    })
}

// 编辑用户信息
const editClick = (row: AdminUserModel) => {
    formData.value = row
    dialogFormVisible.value = true
}

// 查看头像
const showImgView = (imgUrl: string) => {
    avatarUrl.value = imgUrl
    imgViewVisible.value = true
}

// 关闭dialog，重新赋值
const dialogClosed = () => {
    formData.value = {
        id: 0,
        mobile: '',
        email: '',
        name: '',
        avatar: import.meta.env.VITE_DEFAULT_AVATAR_URL,    //使用默认头像地址
        sex: 1,
        status: 0,
        roles: [],
        password: '',
    }
}

// 创建/编辑 响应方法
const submitClick = async (valueData: AdminUserModel) => {
    if (formData.value.id && formData.value.id > 0) {
        valueData.roles = formData.value.roles  //更新后获取的数据没有roles数据，这里赋值
        fcTableRef.value!.getTableList();
        ElMessage.success("修改成功");
        dialogFormVisible.value = false
    } else {
        fcTableRef.value!.reset();
        ElMessage.success("创建成功");
        dialogFormVisible.value = false
    }
}

// 重置密码
const resetPassword = (row: AdminUserModel) => {
    ElMessageBox.prompt('请输入 ' + row.name + ' 的新密码', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPlaceholder: "密码包含大写字母,小写字母和数字,长度至少为6",
        inputPattern:
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/,
        inputErrorMessage: '密码需包含大写字母,小写字母和数字,长度至少为6',
        beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
                //密码加密
                var timestamp = new Date().getTime()
                var timeIV = (timestamp * 1000).toString()
                const encryPwd = encryptionTool.AES.encrypt(encryptionTool.SHA1(instance.inputValue), import.meta.env.VITE_PASSWORD_ENCRYPTION_KEY, timeIV)
                var requestData: AdminPwdModel = {
                    id: row.id as number,
                    password: encryPwd,
                    timestamp: timestamp
                }
                await adminResetPwd(requestData)
            }
            done()
        },
    }).then(() => {
        ElMessage.success("修改成功");
    })
}

// 删除用户
const deleteClick = async (row: AdminUserModel) => {
    await adminDelete({ id: row.id })
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

// 动态设置 selectRef 
const handleSetSelectMap = (el: selectRefItem, item: number) => {
    if (el) {
        selectRefMap.value[`selectRef_${item}`] = el;
    }
};

// el-select 取消按钮
const selectCancelClick = (item: number) => {
    selectRefMap.value[`selectRef_${item}`].blur();
}

// el-select 提交按钮
const selectSubmitClick = async (row: AdminUserModel) => {
    if (row.roles?.length == 0) {
        ElMessage.error("请选择角色");
        return
    }
    selectSubmitLoading.value = true
    try {
        //后端需要的是roleID，所以根据row.roles取出roleArray中的ID
        var roleIDs = roleArray.value.filter(item => row.roles!.includes(item.code)).map(item => item.id);
        var requestData: AdminRoleModel = {
            id: row.id,
            roleIDs: roleIDs as number[]
        }
        await adminSetRole(requestData)
        selectRowRole.value = row.roles as string[]
        selectSubmitLoading.value = false
        selectRefMap.value[`selectRef_${row.id}`].blur();
        ElMessage.success("设置成功");
    } catch (error) {
        selectSubmitLoading.value = false
    }
}

// el-select 监听el-select显示/隐藏
const visibleChange = async (visible: boolean, row: AdminUserModel) => {
    if (visible) {
        selectRowRole.value = JSON.parse(JSON.stringify(row.roles));
    } else {
        row.roles = selectRowRole.value
    }
}
</script>

<style scoped lang="scss">
// 隐藏多选时tag的关闭按钮
:deep(.el-tag .el-tag__close) {
    display: none !important;
}
</style>