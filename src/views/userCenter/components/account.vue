<template>
    <el-card shadow="never" header="个人信息">
        <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px" style="margin-top:20px;">
            <el-form-item label="手机号">
                <el-input v-model="formData.mobile" disabled maxlength="11"></el-input>
                <div class="el-form-item-msg">手机号信息用于登录，请联系超级管理员修改</div>
            </el-form-item>
            <el-form-item label="邮箱">
                <el-input v-model="formData.email" placeholder="邮箱信息用于登录"
                    :disabled="authStore.userInfo.roles!.includes('ALL') ? false : true" maxlength="25"></el-input>
                <div class="el-form-item-msg" v-if="authStore.userInfo.roles!.includes('ALL') ? false : true">
                    邮箱信息用于登录，请联系超级管理员修改</div>
            </el-form-item>
            <el-form-item label="昵称">
                <el-input v-model="formData.name" placeholder="请输入您的昵称"
                    :disabled="authStore.userInfo.roles!.includes('ALL') ? false : true" maxlength="12"></el-input>
                <div class="el-form-item-msg">请联系超级管理员修改</div>
            </el-form-item>
            <el-form-item label="性别">
                <el-select v-model="formData.sex" placeholder="请选择">
                    <el-option v-for="item in sexSelectData" :key="item.value" :label="item.label"
                        :value="Number(item.value)" />
                </el-select>
            </el-form-item>
            <el-form-item label="头像">
                <fc-upload-img v-model:image-url="formData.avatar" :requestApi="avatarFormData" width="100px"
                    height="100px" :drag="false" border-radius="50%" :edit-btn-option="{ icon: 'Edit', title: '' }"
                    :show-btn-option="{ icon: 'ZoomIn', title: '' }" :dele-btn="false">
                    <template #empty>
                        <el-icon>
                            <Avatar />
                        </el-icon>
                        <span>请上传头像</span>
                    </template>
                </fc-upload-img>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="savaClick">保存</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from "@/store/modules/auth";
import { UserInfoModel } from '@/models/authModel';
import { authUpload, authUpdateInfo } from '@/api/modules/auth';
import { FormInstance, FormRules } from 'element-plus'
import { authDict } from '@/api/modules/auth';
import { DictDataModel } from '@/models/setting';

const authStore = useAuthStore()
const formRef = ref<FormInstance>()

const formData = ref<UserInfoModel>({
    id: 0,
    mobile: authStore.userInfo.mobile,
    email: authStore.userInfo.email,
    name: authStore.userInfo.name,
    avatar: authStore.userInfo.avatar,
    sex: authStore.userInfo.sex,
})

const rules = reactive<FormRules<UserInfoModel>>({
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
    ]
})

const sexSelectData = ref<DictDataModel[]>([])

onMounted(() => {
    getDictData()
})

const getDictData = async () => {
    var response = await authDict({ key: 'sex' })
    sexSelectData.value = response.data
}

// 更改头像图片设置参数
const avatarFormData = (params: FormData) => {
    params.append("director", "avatar")
    return authUpload(params)
};

const savaClick = async () => {
    //判断没有改变值
    if (formData.value.mobile == authStore.userInfo.mobile
        && formData.value.email == authStore.userInfo.email
        && formData.value.name == authStore.userInfo.name
        && formData.value.avatar == authStore.userInfo.avatar
        && formData.value.sex == authStore.userInfo.sex) {
        return
    }
    const result = await authUpdateInfo(formData.value)
    authStore.userInfo.mobile = result.data.mobile
    authStore.userInfo.email = result.data.email
    authStore.userInfo.name = result.data.name
    authStore.userInfo.avatar = result.data.avatar
    authStore.userInfo.sex = result.data.sex
}
</script>