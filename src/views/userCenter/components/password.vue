<template>
    <el-card shadow="never" header="修改密码">
        <el-alert title="密码更新成功后，您将被重定向到登录页面，您可以使用新密码重新登录。" type="info" show-icon style="margin-bottom: 15px;" />
        <el-form ref="formRef" :model="form" :rules="rules" label-width="120px" style="margin-top:20px;">
            <el-form-item label="当前密码" prop="userPassword">
                <el-input v-model="form.userPassword" type="password" show-password placeholder="请输入当前密码"
                    maxlength="20"></el-input>
                <div class="el-form-item-msg">必须提供当前登录用户密码才能进行更改</div>
            </el-form-item>
            <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="form.newPassword" type="password" show-password placeholder="请输入新密码"
                    maxlength="20"></el-input>
                <fc-password-strength v-model="form.newPassword"></fc-password-strength>
                <div class="el-form-item-msg">请输入包含英文、数字的6位以上密码</div>
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmNewPassword">
                <el-input v-model="form.confirmNewPassword" type="password" show-password placeholder="请再次输入新密码"
                    maxlength="20"></el-input>
            </el-form-item>
            <el-form-item>
                <el-button type="primary" @click="save(formRef)">保存密码</el-button>
            </el-form-item>
        </el-form>
    </el-card>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import router from '@/router'
import { ElMessageBox, type FormInstance, FormRules } from 'element-plus'
import { authUpdatePwd } from '@/api/modules/auth';
import { FormPwdModel } from '@/models/authModel'
import encryptionTool from '@/utils/encryption'
import { useAuthStore } from "@/store/modules/auth";

interface FormData {
    userPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}
const form = reactive<FormData>({
    userPassword: "123456",
    newPassword: "123123",
    confirmNewPassword: "123123",
})

const rules = reactive<FormRules<FormData>>({
    userPassword: [
        { required: true, message: '请输入当前密码' },
        { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, message: '密码至少包含一个小写字母，一个大写字母，一个数字，长度至少为6', trigger: ['blur'] }
    ],
    newPassword: [
        { required: true, message: '请输入新密码' },
        { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, message: '密码至少包含一个小写字母，一个大写字母，一个数字，长度至少为6', trigger: ['blur'] }
    ],
    confirmNewPassword: [
        { required: true, message: '请再次输入新密码' },
        {
            validator: (_rule, value, callback) => {
                if (value !== form.newPassword) {
                    callback(new Error('两次输入密码不一致'));
                } else {
                    callback();
                }
            }
        }
    ]
})

const authStore = useAuthStore()
const formRef = ref<FormInstance>()

const save = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (!valid) return

        //密码加密
        var timestamp = new Date().getTime()
        var timeIV = (timestamp * 1000).toString()
        const formPwd: FormPwdModel = {
            usePassword: encryptionTool.AES.encrypt(encryptionTool.SHA1(form.userPassword), import.meta.env.VITE_PASSWORD_ENCRYPTION_KEY, timeIV),
            newPassword: encryptionTool.AES.encrypt(encryptionTool.SHA1(form.newPassword), import.meta.env.VITE_PASSWORD_ENCRYPTION_KEY, timeIV),
            timestamp: timestamp
        }

        await authUpdatePwd(formPwd)
        authStore.$reset(); //清除本地存储用户信息
        ElMessageBox.alert('密码修改成功，需跳转至登录页面重新登录', '修改成功', {
            type: 'success',
            showClose: false,
            confirmButtonText: '重新登录',
        }).then(() => {
            router.replace({ path: '/login' })
        }).catch(() => {
        })
    })
}
</script>