<template>
    <el-form v-if="dictData" ref="formRef" :model="dictData" label-width="auto" :rules="rules">
        <el-form-item label="字典类型" prop="dictType">
            <el-input v-model="dictData.dictType" autocomplete="off" disabled />
        </el-form-item>
        <el-form-item label="字典标签" prop="label">
            <el-input v-model="dictData.label" autocomplete="off" maxlength="30"
                placeholder="标签，例如：男。主要不要与同分类下的其它标签重复。" />
        </el-form-item>
        <el-form-item label="字典键值" prop="value">
            <el-input v-model="dictData.value" autocomplete="off" maxlength="30"
                placeholder="值，例如：1。主要不要与同分类下的其它值重复。" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
            <el-input-number v-model="dictData.sort" :min="1" />
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
import { dictDataCreate, dictDataUpdate } from '@/api/modules/setting';
import { DictDataModel, DictTypeModel } from "@/models/setting";
import { FormInstance, FormRules } from 'element-plus'

interface PropsModel {
    formData: DictDataModel,
    typeData: DictTypeModel
}

const props = defineProps<PropsModel>()
const emit = defineEmits<{
    cancelClick: [];
    submitClick: [formData: DictDataModel];
}>();
const submitLoading = ref(false);
const formRef = ref<FormInstance>()
const dictData = ref<DictDataModel>()
const rules = reactive<FormRules<DictDataModel>>({
    label: [
        { required: true, message: '请输入字典标签' },
    ],
    value: [
        { required: true, message: '请输入字典键值' },
        // { pattern: /^[a-zA-Z0-9_]+$/, message: '角色标识只能为字母，数字，下划线', trigger: ['blur'] },
    ]
})

onMounted(() => {
    dictData.value = { ...props.formData }
    dictData.value.dictType = props.typeData.type
})

const submitClick = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    await formEl.validate(async (valid) => {
        console.log("123")
        if (!valid) return
        submitLoading.value = true

        try {
            var requestData: DictDataModel = { ...dictData.value! }
            var response: any
            // 有ID，编辑。无ID，创建
            if (props.formData.id! > 0) {
                response = await dictDataUpdate(requestData)
            } else {
                response = await dictDataCreate(requestData)
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