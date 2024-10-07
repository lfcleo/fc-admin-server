<template>
    <el-form v-if="adminData" ref="formRef" :model="adminData" :rules="rules" label-width="auto"
        :disabled="adminData.id == 1 ? true : false">
        <el-form-item label="用户头像" prop="avatar">
            <fc-upload-img v-model:image-url="adminData.avatar" :requestApi="avatarFormData" width="100px"
                height="100px" :drag="false" border-radius="50%" :edit-btn-option="{ icon: 'Edit', title: '' }"
                :show-btn-option="{ icon: 'ZoomIn', title: '' }" :dele-btn="false">
                <template #empty>
                    <el-icon>
                        <Avatar />
                    </el-icon>
                    <span>设置头像</span>
                </template>
            </fc-upload-img>
        </el-form-item>
        <el-form-item label="角色权限" prop="roles" v-if="!adminData.id">
            <el-select ref="selectRef" v-model="adminData.roles" multiple clearable :max-collapse-tags="10"
                placeholder="请选择角色权限">
                <el-option v-for="item in roleArray" :key="item.id" :label="item.name" :value="item.code" />
                <ElSelectLoading :page="selectPage" :loading="selectLoading" v-if="selectHasMore"
                    @loadMore="selectHandleLoadMore" />
                <template #footer>
                    <div style="text-align: right;">
                        <el-button type="primary" size="small" @click="() => { selectRef!.blur() }">确定</el-button>
                    </div>
                </template>
            </el-select>
        </el-form-item>
        <el-form-item label="昵 称" prop="name">
            <el-input v-model="adminData.name" autocomplete="off" maxlength="12" placeholder="管理员昵称" />
        </el-form-item>
        <el-form-item label="邮 箱" prop="email">
            <el-input v-model="adminData.email" autocomplete="off" maxlength="25" placeholder="管理员邮箱，可做登录账户使用。" />
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
            <el-input v-model="adminData.mobile" autocomplete="off" maxlength="11" placeholder="管理员手机号，可做登录账户使用。" />
        </el-form-item>
        <el-form-item label="密 码" prop="password" v-if="!adminData.id">
            <el-input v-model="adminData.password" autocomplete="off" maxlength="20" placeholder="登录密码。" />
        </el-form-item>
        <el-form-item label="性 别" prop="sex">
            <el-select v-model="adminData.sex" placeholder="请选择">
                <el-option label="未知" :value=1></el-option>
                <el-option label="男" :value=2></el-option>
                <el-option label="女" :value=3></el-option>
            </el-select>
        </el-form-item>
        <div style="text-align: center;">
            <el-button @click="() => { emit('cancelClick') }">取消</el-button>
            <el-button type="primary" :loading="submitLoading" @click="submitClick(formRef)">确定</el-button>
        </div>
    </el-form>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted } from 'vue'
import { ElSelect, type FormInstance, FormRules } from 'element-plus'
import { AdminUserModel, RoleModel } from "@/models/setting";
import { authUpload } from '@/api/modules/auth';
import { roleList, adminUpdate, adminCreate } from "@/api/modules/setting"
import ElSelectLoading from "./elSelectLoading.vue";
import encryptionTool from "@/utils/encryption"

const props = defineProps<{ formData: AdminUserModel }>();
const emit = defineEmits<{
    cancelClick: [];
    submitClick: [formData: AdminUserModel];
}>();

const formRef = ref<FormInstance>()                     // el-form 实例
const selectRef = ref<InstanceType<typeof ElSelect>>()  // el-select 实例
const adminData = ref<AdminUserModel>()
const rules = reactive<FormRules<AdminUserModel>>({
    mobile: [
        { required: true, message: '请输入管理员手机号' },
        { pattern: /^1[3456789]\d{9}$/, message: '手机号格式错误', trigger: ['blur'] }
    ],
    email: [
        { required: true, message: '请输入管理员邮箱' },
        { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '邮箱格式错误', trigger: ['blur'] }
    ],
    name: [
        { required: true, message: '请输入管理员昵称' },
        { min: 1, max: 12, message: '管理员昵称长度应在1到12个字符之间', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码' },
        { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, message: '密码至少包含一个小写字母，一个大写字母，一个数字，长度至少为6', trigger: ['blur'] }
    ],
    roles: [
        { required: true, message: '请选择管理员角色' },
    ]
})
const roleArray = ref<RoleModel[]>([]);     //角色列表
const selectPage = ref(1);                  //el-select数据当前页码
const selectLoading = ref(false);           //el-select是否加载中，用来过滤重复的加载
const selectHasMore = ref(true);            //el-select是否有更多数据可加载
const submitLoading = ref(false);           //提交按钮加载loading

onMounted(() => {
    adminData.value = { ...props.formData }
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

// 设置头像图片设置参数
const avatarFormData = (params: FormData) => {
    params.append("director", "avatar")
    return authUpload(params)
};

// 提交按钮
const submitClick = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (!valid) return
        submitLoading.value = true
        // 新建一个model是为了设置密码和角色权限的时候不改变原先的值
        var requestData: AdminUserModel = { ...adminData.value! }
        try {
            var response: any
            // 有ID，编辑。无ID，创建
            if (requestData.id! > 0) {
                response = await adminUpdate(requestData)
            } else {
                //密码加密
                var timestamp = new Date().getTime()
                var timeIV = (timestamp * 1000).toString()
                const encryPwd = encryptionTool.AES.encrypt(encryptionTool.SHA1(adminData.value!.password!), import.meta.env.VITE_PASSWORD_ENCRYPTION_KEY, timeIV)
                requestData.timestamp = timestamp
                requestData.password = encryPwd
                //后端需要的是roleID，所以根据row.roles取出roleArray中的ID
                var roleIDs = roleArray.value.filter(item => requestData.roles!.includes(item.code)).map(item => item.id);
                requestData.roleIDs = roleIDs as number[]
                //网络请求
                response = await adminCreate(requestData)
                //后端没有返回roles数组，就用此页面设置的数据赋值。如果后端返回的话可以省略下面代码
                response.data.roles = requestData.roles
            }
            submitLoading.value = false
            emit('submitClick', response.data)
        } catch (error) {
            submitLoading.value = false
        }
    })
}
</script>

<style scoped></style>