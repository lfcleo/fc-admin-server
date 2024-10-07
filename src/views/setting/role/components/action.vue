<template>
    <el-form v-if="roleData" ref="formRef" :model="roleData" :rules="rules" label-width="auto"
        :disabled="roleData.id == 1 ? true : false">
        <el-form-item label="名 称" prop="name">
            <el-input v-model="roleData.name" autocomplete="off" maxlength="20" placeholder="角色名称" />
        </el-form-item>
        <el-form-item label="标 识" prop="code">
            <el-input v-model="roleData.code" autocomplete="off" maxlength="20"
                @input="roleData.code = roleData.code.replace(/[^a-zA-Z0-9_]/g, '')"
                placeholder="角色标识，只允许输入字母，数字，下划线。" />
        </el-form-item>
        <el-form-item label="备 注" prop="notes">
            <el-input v-model="roleData.notes" autocomplete="off" maxlength="255" type="textarea" :rows="3"
                placeholder="选填" />
        </el-form-item>
        <div style="text-align: center;">
            <el-button @click="() => { emit('cancelClick') }">取消</el-button>
            <el-button type="primary" :loading="submitLoading" @click="submitClick(formRef)">确定</el-button>
        </div>
    </el-form>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted } from 'vue'
import { FormInstance, FormRules } from 'element-plus'
import { RoleModel } from "@/models/setting";
import { roleCreate, roleUpdate } from '@/api/modules/setting';

const props = defineProps<{ formData: RoleModel }>();
const emit = defineEmits<{
    cancelClick: [];
    submitClick: [formData: RoleModel];
}>();

const formRef = ref<FormInstance>()
const roleData = ref<RoleModel>()
const submitLoading = ref(false);

const rules = reactive<FormRules<RoleModel>>({
    name: [
        { required: true, message: '请输入角色名称' },
    ],
    code: [
        { required: true, message: '请输入角色标识' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: '角色标识只能为字母，数字，下划线', trigger: ['blur'] },
    ]
})

onMounted(() => {
    roleData.value = { ...props.formData }
})

const submitClick = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (!valid) return
        submitLoading.value = true
        var requestData: RoleModel = { ...roleData.value! }
        try {
            var response: any
            // 有ID，编辑。无ID，创建
            if (requestData.id! > 0) {
                response = await roleUpdate(requestData)
            } else {
                response = await roleCreate(requestData)
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