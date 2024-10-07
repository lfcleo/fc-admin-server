<template>
    <el-form ref="loginForm" :model="form" :rules="rules" label-width="0" size="large" @keyup.enter="login">
        <el-form-item prop="user">
            <el-input v-model="form.username" prefix-icon="User" clearable :placeholder="$t('login.userPlaceholder')">
            </el-input>
        </el-form-item>
        <el-form-item prop="password">
            <el-input v-model="form.password" prefix-icon="Lock" clearable show-password
                :placeholder="$t('login.PWPlaceholder')"></el-input>
        </el-form-item>
        <el-form-item prop="code">
            <div class="login-msg-yzm">
                <el-input v-model="form.code" clearable maxlength="4"
                    :placeholder="$t('login.codeVerifyplaceholder')"></el-input>
                <fc-char-verify ref="fcCharVerify" style="margin-left: 10px;"></fc-char-verify>
            </div>
        </el-form-item>
        <el-form-item style="margin-bottom: 10px;">
            <el-col :span="12">
                <el-checkbox :label="$t('login.rememberMe')" v-model="form.auto"></el-checkbox>
            </el-col>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" style="width: 100%;" :loading="islogin" round @click="login(loginForm)">
                {{ $t('login.signIn') }}
            </el-button>
        </el-form-item>
    </el-form>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, type FormInstance, FormRules } from 'element-plus'
import { useI18n } from "vue-i18n";
import router from '@/router'
import encryptionTool from '@/utils/encryption'
import { authLogin, authMenu } from '@/api/modules/auth'
import { useAuthStore } from "@/store/modules/auth";
import { useMenuStore } from "@/store/modules/menu";
import { AuthRequestModel } from '@/models/authModel';
import FcCharVerify from '@/components/fcCharVerify/index.vue'

interface formModel {
    username: string;
    password: string;
    code: string;
    auto: boolean;
}

const { t } = useI18n()
const authStore = useAuthStore()
const menuStore = useMenuStore()
const islogin = ref(false);
const fcCharVerify = ref<InstanceType<typeof FcCharVerify>>();
const form = reactive<formModel>({
    username: '',
    password: '',
    code: '',
    auto: false,
});

const rules = reactive<FormRules<formModel>>({
    username: [
        { required: true, message: t('login.userError'), trigger: 'blur' }
    ],
    password: [
        { required: true, message: t('login.PWError'), trigger: 'blur' },
        { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/, message: '密码至少包含一个小写字母，一个大写字母，一个数字，长度至少为6', trigger: ['blur'] }
    ],
    code: [
        { required: true, message: t('login.codeVerifyplaceholder'), trigger: 'blur' },
        { len: 4, message: t('login.codeVerifyError'), trigger: 'blur' },
    ]
})
const loginForm = ref<FormInstance>()

const login = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    // 验证表单 
    await formEl.validate(async (valid) => {
        if (!valid) return
        if (fcCharVerify.value?.code != form.code) {
            ElMessage({ type: "error", message: "验证码错误,请重新输入新验证码" });
            fcCharVerify.value?.refresh()
            return
        }
        islogin.value = true;
        //密码加密
        var timestamp = new Date().getTime()
        var timeIV = (timestamp * 1000).toString()
        const encryPwd = encryptionTool.AES.encrypt(encryptionTool.SHA1(form.password), import.meta.env.VITE_PASSWORD_ENCRYPTION_KEY, timeIV)

        const requestForm: AuthRequestModel = {
            username: form.username,
            password: encryPwd,
            auto: form.auto,
            timestamp: timestamp,
        }

        try {
            // 获取 token  
            const authData = await authLogin(requestForm);
            authStore.$state = authData.data

            // 获取菜单  
            let menuData = await authMenu();
            if (menuData.data.menu.length === 0) {
                islogin.value = false;
                alert("当前用户无任何菜单权限，请联系系统管理员")
                return
            }
            menuStore.list = menuData.data.menu
            menuStore.permissions = menuData.data.permissions

            router.replace({ path: '/' });
            ElMessage.success("Login Success 登录成功");
            islogin.value = false;
        } catch (error) {
            islogin.value = false;
            fcCharVerify.value?.refresh();
        }
    })
}

</script>

<style></style>
