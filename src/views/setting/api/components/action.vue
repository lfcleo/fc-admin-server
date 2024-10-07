<template>
    <el-form v-if="apiData" ref="formRef" :model="apiData" :rules="rules" label-width="auto">
        <el-form-item label="请求路径" prop="path">
            <el-input v-model="apiData.path" autocomplete="off" maxlength="255"
                @input="apiData.path = apiData.path.replace(/[^a-zA-Z0-9:\/.]/g, '')"
                placeholder="可选。输入字母，数字，冒号，斜杠。例如：admin/list" />
        </el-form-item>
        <el-form-item label="请求方式" prop="method">
            <el-select v-model="apiData.method" placeholder="选择一种请求方式">
                <el-option label="GET" value="GET" />
                <el-option label="POST" value="POST" />
                <el-option label="PUT" value="PUT" />
                <el-option label="DELETE" value="DELETE" />
            </el-select>
        </el-form-item>
        <el-form-item label="接口描述" prop="description">
            <el-input v-model="apiData.description" autocomplete="off" placeholder="接口描述" />
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
import { APIModel } from "@/models/setting";
import { apiCreate, apiUpdate } from '@/api/modules/setting';

const props = defineProps<{ formData: APIModel }>();
const emit = defineEmits<{
    cancelClick: [];
    submitClick: [formData: APIModel];
}>();

const formRef = ref<FormInstance>()
const apiData = ref<APIModel>()
const submitLoading = ref(false);

const rules = reactive<FormRules<APIModel>>({
    path: [
        { required: true, message: '请输入接口请求路径' },
    ],
    method: [
        { required: true, message: '请输入接口请求方式' },
    ],
    description: [
        { required: true, message: '请输入接口描述' },
    ]
})

onMounted(() => {
    apiData.value = { ...props.formData }
})

const submitClick = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (!valid) return
        submitLoading.value = true
        var requestData: APIModel = { ...apiData.value! }
        try {
            var response: any
            // 有ID，编辑。无ID，创建
            if (requestData.id! > 0) {
                response = await apiUpdate(requestData)
            } else {
                response = await apiCreate(requestData)
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