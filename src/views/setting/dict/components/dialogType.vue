<template>
    <el-form v-if="dictData" ref="formRef" :model="dictData" label-width="auto" :rules="rules">
        <el-form-item label="字典名称" prop="name">
            <el-input v-model="dictData.name" autocomplete="off" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item label="字典类型" prop="type">
            <el-input v-model="dictData.type" autocomplete="off"
                @input="dictData.type = dictData.type.replace(/[^a-zA-Z0-9_]/g, '')"
                placeholder="可选。输入字母，数字，下划线。例如：sys_admin_type" />
        </el-form-item>
        <el-form-item label="是否启用" prop="status">
            <el-radio-group v-model="dictData.status">
                <el-radio :value="1">启用</el-radio>
                <el-radio :value="2">禁用</el-radio>
            </el-radio-group>
        </el-form-item>
        <el-form-item label="备 注" prop="notes">
            <el-input v-model="dictData.notes" autocomplete="off" maxlength="255" type="textarea" :rows="3"
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
import { dictTypeCreate, dictTypeUpdate } from '@/api/modules/setting';
import { DictTypeModel } from "@/models/setting";
import { FormInstance, FormRules } from 'element-plus'

interface PropsModel {
    formData: DictTypeModel,
}

const props = defineProps<PropsModel>()
const emit = defineEmits<{
    cancelClick: [];
    submitClick: [formData: DictTypeModel];
}>();
const submitLoading = ref(false);
const formRef = ref<FormInstance>()
const dictData = ref<DictTypeModel>()

const rules = reactive<FormRules<DictTypeModel>>({
    name: [
        { required: true, message: '清输入字典名称' },
    ],
    type: [
        { required: true, message: '请输入角色标识' },
        { pattern: /^[a-zA-Z0-9_]+$/, message: '角色标识只能为字母，数字，下划线', trigger: ['blur'] },
    ]
})

onMounted(() => {
    dictData.value = { ...props.formData }
})

const submitClick = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        if (!valid) return
        submitLoading.value = true
        var requestData: DictTypeModel = { ...dictData.value! }
        try {
            var response: any
            // 有ID，编辑。无ID，创建
            if (requestData.id! > 0) {
                response = await dictTypeUpdate(requestData)
            } else {
                response = await dictTypeCreate(requestData)
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