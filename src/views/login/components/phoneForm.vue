<template>
    <el-form ref="loginForm" :model="form" :rules="rules" label-width="0" size="large" @keyup.enter="login">
        <el-form-item prop="phone">
            <el-input v-model="form.username" prefix-icon="Iphone" clearable maxlength="11"
                :placeholder="$t('login.mobilePlaceholder')">
                <template #prepend>+86</template>
            </el-input>
        </el-form-item>
        <el-form-item prop="yzm">
            <div class="login-msg-yzm">
                <el-input v-model="form.password" prefix-icon="Unlock" clearable
                    :placeholder="$t('login.smsPlaceholder')"></el-input>
                <el-button @click="yzmBtnClick(loginForm)" :disabled="disabled">
                    {{ $t('login.smsGet') }}
                    <span v-if="disabled">({{ countDownNumber }})</span>
                </el-button>
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

    <el-dialog v-model="dialogVisible" width="350px" top="160px" destroy-on-close>
        <fc-word-verify @resultCallback="verifyCallback"></fc-word-verify>
    </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { ElMessage, type FormInstance, FormRules } from 'element-plus'
import { useI18n } from "vue-i18n";
import { authVerificationCode, authLoginMobile, authMenu } from '@/api/modules/auth'
import { AuthRequestModel } from '@/models/authModel';
import { useAuthStore } from "@/store/modules/auth";
import { useMenuStore } from "@/store/modules/menu";
import router from '@/router'

const { t } = useI18n()
const authStore = useAuthStore()
const menuStore = useMenuStore()
// 定义响应式数据  
const form = reactive<AuthRequestModel>({
    username: '',
    password: '',
    code: '',
    auto: false,
    timestamp: 0,
});

const rules = reactive<FormRules<AuthRequestModel>>({
    username: [
        { required: true, message: t('login.mobileError') },
        { pattern: /^1[3456789]\d{9}$/, message: '手机号码格式错误', trigger: ['blur'] }
    ],
    password: [
        { required: true, message: t('login.smsError') },
        { len: 6, message: t('login.smsError'), trigger: 'blur' },
    ]
})

const disabled = ref(false);
const countDownNumber = ref(0);
const islogin = ref(false);
const loginForm = ref<FormInstance>()
const dialogVisible = ref(false);
// 定义定时器变量并初始化为null
let timer: number | null = null;

const yzmBtnClick = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    // 验证表单  
    const validateResult = await formEl.validateField("phone")
    if (!validateResult) {
        console.log(validateResult)
        return false;
    }
    dialogVisible.value = true
}

const verifyCallback = async (result: boolean) => {
    if (!result) {
        ElMessage({ type: "error", message: "验证码错误" });
        return
    }

    const authData = await authVerificationCode({ username: form.username });
    form.password = authData.data + ''

    dialogVisible.value = false
    ElMessage.success(t('login.smsSent'));
    disabled.value = true;
    countDownNumber.value = 60;
    timer = window.setInterval(() => {
        countDownNumber.value -= 1;
        if (countDownNumber.value < 1) {
            if (timer) {
                clearInterval(timer);
            }
            disabled.value = false;
            countDownNumber.value = 0;
        }
    }, 1000);
}

const login = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    // 验证表单 
    await formEl.validate(async (valid) => {
        if (!valid) return

        // 获取 token  
        const authData = await authLoginMobile(form);
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
    })
}
</script>

<style></style>
