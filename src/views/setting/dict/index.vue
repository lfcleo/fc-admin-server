<template>
    <el-container>
        <el-aside>
            <el-container>
                <el-main class="nopadding">
                    <fc-tree-filter show-search ref="fcTFRef" :showAll="false" :set-props="{ label: 'name' }"
                        :request-api="dictTypeList" @selectClick="changeTreeFilter">
                        <template #option="scope">
                            <span class="custom-tree-node">
                                <span class="code">{{ scope.row.data.type }}</span>
                                <span class="do">
                                    <el-button-group>
                                        <el-button v-auths="['dict:type:update']" icon="Edit" size="small"
                                            @click.stop="dictTypeClick(scope.row.data)"></el-button>
                                        <el-button v-auths="['dict:type:delete']" icon="Delete" size="small"
                                            @click.stop="deleteTypeClick(scope.row.data)"></el-button>
                                    </el-button-group>
                                </span>
                            </span>
                        </template>
                    </fc-tree-filter>
                </el-main>
                <el-footer>
                    <el-button v-auths="['dict:type:create']" type="primary" icon="Plus" style="width: 100%;"
                        @click="dictTypeClick()">字典分类</el-button>
                </el-footer>
            </el-container>
        </el-aside>
        <el-container v-if="selectTypeModel.id">
            <el-header>
                <div class="left-panel">
                    <el-button v-auths="['dict:data:create']" class="addBtn" type="primary" icon="Plus"
                        @click="dictDataClick()">新增</el-button>
                    <el-button v-auths="['dict:data:delete']" type="danger" plain icon="Delete"
                        :disabled="fcTableRef?.selectedListKeys.length == 0"
                        @click="deleteDataClick(fcTableRef?.selectedListKeys!)">删除</el-button>
                </div>
            </el-header>
            <el-main class="nopadding">
                <fc-table ref="fcTableRef" :indent="20" :requestApi="getDictData" :columns="columns">
                    <template #status="scope">
                        <el-tag type="success" v-if="scope.row.status == 1">启用</el-tag>
                        <el-tag type="info" v-else>禁用</el-tag>
                    </template>
                    <!-- 表格操作 -->
                    <template #options="scope">
                        <el-button v-auths="['dict:data:update']" type="primary" icon="Edit" link
                            @click="dictDataClick(scope.row)">编辑</el-button>
                        <el-button v-auths="['dict:data:delete']" type="danger" link
                            @click="deleteDataClick([scope.row.id])">删除</el-button>
                    </template>
                </fc-table>
            </el-main>
        </el-container>
        <el-container v-else>
            <el-main><el-empty description="右侧选择字典分类查看字典数据" /></el-main>
        </el-container>
        <el-dialog v-model="dialogFormVisible" :title="dialogType" width="500" destroy-on-close @closed="dialogClosed">
            <!-- 新建/编辑字典分类弹窗 -->
            <dialog-type :formData="optionTypeModel" @cancel-click="() => { dialogFormVisible = false }"
                @submit-click="submitTypeClick" v-if="dialogType == '字典分类'"></dialog-type>
            <!-- 新建/编辑字典数据弹窗 -->
            <dialog-data :formData="selectDataModel" :typeData="selectTypeModel"
                @cancel-click="() => { dialogFormVisible = false }" @submit-click="submitDataClick"
                v-if="dialogType == '字典数据'"></dialog-data>
        </el-dialog>
    </el-container>
</template>

<script setup lang='ts'>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from "element-plus";
import { dictTypeList, dictDataList, dictTypeDelete, dictDataDelete } from '@/api/modules/setting';
import { DictTypeModel, DictDataModel } from "@/models/setting";
import { ColumnProps, FcTableInstance } from "@/components/fcTable/model"
import DialogType from "./components/dialogType.vue"
import DialogData from "./components/dialogData.vue"
import FcTreeFilter from '@/components/fcTreeFilter/index.vue'

defineOptions({
    name: "settingDict"
})

const changeTreeFilter = (val: DictTypeModel) => {
    if (val.id == selectTypeModel.value.id) return
    selectTypeModel.value = val;
    if (fcTFRef.value && fcTFRef.value.treeData.length > 0) {
        getDictData({ page: 1, pageSize: 20 });
        fcTableRef.value?.reset()
    }
};

//table表格配置
const columns = reactive<ColumnProps<DictDataModel>[]>([
    { type: "selection", fixed: "left", width: 50 },
    { prop: "label", label: "名称" },
    { prop: "value", label: "键值" },
    { prop: "sort", label: "排序" },
    { prop: "status", label: "状态" },
    { prop: "notes", label: "备注" },
    { prop: "options", label: "操作", width: 280, fixed: "right" }
]);

const fcTFRef = ref<InstanceType<typeof FcTreeFilter>>()    // fcTreeFilter 实例
const fcTableRef = ref<FcTableInstance>();        // fcTabel 实例
const dialogType = ref<string>("字典分类");        // 弹窗类型，字典分类/字典数据
const dialogFormVisible = ref<boolean>(false);    // 控制是否弹窗
// 新建字典分类
const optionTypeModel = ref<DictTypeModel>({
    id: 0,
    name: '',
    status: 1,
    type: "",
    notes: "",
})
// 选中的字典分类
const selectTypeModel = ref<DictTypeModel>({
    id: 0,
    name: '',
    status: 1,
    type: "",
    notes: "",
})
// 选中的字典数据/新建/编辑字典数据
const selectDataModel = ref<DictDataModel>({
    id: 0,
    label: "",
    value: "",
    status: 1,
    sort: 0,
    notes: "",
    dictType: "",
})

// 新建/编辑字典分类
const dictTypeClick = (row?: DictTypeModel) => {
    dialogType.value = "字典分类"
    if (row) {
        optionTypeModel.value = row
    } else {
        optionTypeModel.value = {
            id: 0,
            name: "",
            type: "",
            status: 1,
            notes: ""
        };
    }
    dialogFormVisible.value = true
}

// 提交新建/编辑字典分类成功
const submitTypeClick = (valueData: DictTypeModel) => {
    // 有ID，编辑。无ID，创建
    if (optionTypeModel.value.id && optionTypeModel.value.id > 0) {
        optionTypeModel.value.name = valueData.name
        optionTypeModel.value.type = valueData.type
        optionTypeModel.value.notes = valueData.notes
        optionTypeModel.value.status = valueData.status
        ElMessage.success("修改成功");
        dialogFormVisible.value = false
    } else {
        //创建成功后，可以重新刷新fcTFRef.value?.getData()，或者直接把新创建的数据插入进去，这里用第一种方法。
        // fcTFRef.value?.treeAllData.push(valueData)
        fcTFRef.value?.getData();
        ElMessage.success("创建成功");
        dialogFormVisible.value = false
    }
}

// 删除字典分类
const deleteTypeClick = (row: DictTypeModel) => {
    ElMessageBox.confirm('将会删除字典分类及其分类下的数据', '确定要删除吗？', {
        type: 'info',
    }).then(async () => {
        await dictTypeDelete({ id: row.id })
        fcTFRef.value?.getData()
        selectTypeModel.value = {
            id: 0,
            name: "",
            type: "",
            status: 1,
            notes: ""
        };
    }).catch(() => {
        //取消
    })
}

// 新建/编辑字典数据
const dictDataClick = (row?: DictDataModel) => {
    dialogType.value = "字典数据"
    selectDataModel.value = row || JSON.parse(JSON.stringify(selectDataModel.value))
    dialogFormVisible.value = true
}

// 提交新建/编辑字典数据成功
const submitDataClick = (valueData: DictDataModel) => {
    dialogFormVisible.value = false
    // 有ID，编辑。无ID，创建
    if (valueData.id && valueData.id > 0) {
        ElMessage.success("修改成功");
        fcTableRef.value!.getTableList()
    } else {
        ElMessage.success("创建成功");
        fcTableRef.value!.reset()
    }
}

// 删除字典数据
const deleteDataClick = (ids: string[]) => {
    ElMessageBox.confirm('', '确定要删除吗？', {
        type: 'info',
    }).then(async () => {
        await dictDataDelete({ ids: ids })
        fcTableRef.value!.reset()
        fcTableRef.value!.element?.clearSelection() //清除下selection
    }).catch(() => {
        //取消
    })
}

// 获取字典数据列表，
const getDictData = (params: any) => {
    //防止首次加载页面两次请求
    if (!params.page || !params.pageSize || selectTypeModel.value.id == 0) {
        return
    }
    let newParams = JSON.parse(JSON.stringify(params));
    newParams.dictType = selectTypeModel.value.type
    return dictDataList(newParams);
}

// 新建/编辑字典数据弹窗关闭，初始化数据
const dialogClosed = () => {
    selectDataModel.value = {
        id: 0,
        label: "",
        value: "",
        status: 1,
        sort: 0,
        notes: "",
        dictType: "",
    }
}
</script>

<style scoped>
.type {
    font-size: 12px;
    color: #999;
}

.custom-tree-node .code {
    font-size: 12px;
    color: #999;
}

.custom-tree-node .do {
    display: none;
}

.custom-tree-node:hover .code {
    display: none;
}

.custom-tree-node:hover .do {
    display: inline-block;
}
</style>