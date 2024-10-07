<template>
    <el-container>
        <el-header>
            <div class="demo-form-inline">
                <fc-query :formItems="formItems" @search="handleSearch" @enterKey="handleSearch"
                    @reset="handleReset"></fc-query>
            </div>
        </el-header>
        <el-main class="nopadding">
            <fc-table ref="fcTableRef" :requestApi="logDataList" :columns="columns">
                <template #createdAt="scope">
                    <!-- 使用了自定义指令，时间转为年月日时分 -->
                    <div v-timeYMDHM="scope.row.createdAt"></div>
                </template>
                <template #code="scope">
                    <el-tag type="success" v-if="scope.row.code == 200">{{ scope.row.code }}</el-tag>
                    <el-tag type="info" v-else>{{ scope.row.code }}</el-tag>
                </template>
                <template #agent="scope">
                    <el-tooltip effect="dark" placement="left">
                        <template #content> {{ scope.row.agent }} </template>
                        <el-icon :size="20">
                            <InfoFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #request="scope">
                    <el-tooltip effect="light" placement="left">
                        <template #content>
                            <div style="width: 500px;overflow-x: auto;">
                                <pre
                                    class="json-preview"><code>{{ JSON.stringify(JSON.parse(scope.row.request), null, 4) }}</code></pre>
                            </div>
                        </template>
                        <el-icon :size="20">
                            <InfoFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <template #response="scope">
                    <el-tooltip effect="light" placement="left">
                        <template #content>
                            <div style="width: 500px;overflow-x: auto;">
                                <pre
                                    class="json-preview"><code>{{ JSON.stringify(JSON.parse(scope.row.response), null, 4) }}</code></pre>
                            </div>
                        </template>
                        <el-icon :size="20">
                            <InfoFilled />
                        </el-icon>
                    </el-tooltip>
                </template>
                <!-- 表格操作 -->
                <template #options="scope">
                    <el-popconfirm title="确定要删除吗?" @confirm="deleteClick([scope.row.id])">
                        <template #reference>
                            <el-button v-auths="['log:delete']" type="danger" link>删除</el-button>
                        </template>
                    </el-popconfirm>
                </template>
                <template #toolButtons>
                    <div style="width: 100%;">
                        <el-button v-auths="['log:delete']" type="danger" plain icon="Delete"
                            :disabled="fcTableRef?.selectedList.length == 0" circle
                            @click="deleteMoreClick(fcTableRef?.selectedListKeys!)"></el-button>
                    </div>
                </template>
            </fc-table>
        </el-main>
    </el-container>
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { ColumnProps, FcTableInstance } from "@/components/fcTable/model"
import { LogDataModel } from "@/models/setting";
import { logDataList, logDataDelete } from "@/api/modules/setting";
import { ElMessageBox } from "element-plus";

defineOptions({
    name: "settingLog"
})

// 查询器配置
const formItems = ref<any>([
    {
        type: 'input',
        label: '管理员ID',
        placeholder: '管理员的ID，ID可在用户管理中查找',
        field: 'administratorID',
    },
    {
        type: 'input',
        label: '请求路径',
        placeholder: '请求路径',
        field: 'path',
    },
    {
        type: 'date',
        label: '起止时间',
        placeholder: '请选择日期',
        field: 'date',
        dateType: 'daterange',
    },
    {
        type: 'select',
        label: '请求方式',
        placeholder: '请选择类型',
        field: 'method',
        options: [
            {
                value: 'POST',
                label: 'POST',
            },
            {
                value: 'GET',
                label: 'GET',
            },
            {
                value: 'PUT',
                label: 'PUT',
            },
            {
                value: 'DELETE',
                label: 'DELETE',
            }
        ]
    },
    {
        type: 'input',
        label: '响应码',
        placeholder: '网络返回响应码',
        field: 'code',
    },
])
// 表格配置项
const columns = reactive<ColumnProps<LogDataModel>[]>([
    { type: "selection", fixed: "left", width: 50 },
    { prop: "administrator.name", label: "操作人", width: 150 },
    { prop: "createdAt", label: "日期", width: 150 },
    { prop: "code", label: "响应码" },
    { prop: "ip", label: "IP地址", width: 130 },
    { prop: "method", label: "请求方法", width: 100 },
    { prop: "path", label: "请求路径", width: 300 },
    { prop: "agent", label: "代理" },
    { prop: "request", label: "请求参数" },
    { prop: "response", label: "响应结果" },
    { prop: "options", label: "操作", fixed: "right" },
]);
// fcTabel 实例
const fcTableRef = ref<FcTableInstance>();

// 查询
const handleSearch = (formData: any) => {
    let newParams = JSON.parse(JSON.stringify(formData));
    //把administratorID的值由string转为number
    if (newParams && typeof newParams.administratorID === 'string' && !isNaN(Number(newParams.administratorID))) {
        // 转换字符串为数字并赋值给test  
        newParams.administratorID = Number(newParams.administratorID);
    }
    //把code的值由string转为number
    if (newParams && typeof newParams.code === 'string' && !isNaN(Number(newParams.code))) {
        // 转换字符串为数字并赋值给test  
        newParams.code = Number(newParams.code);
    }
    fcTableRef.value!.searchParam = newParams
    fcTableRef.value!.search()
}
// 初始化状态
const handleReset = () => {
    fcTableRef.value?.reset()
}

// 删除选项
const deleteClick = async (ids: string[]) => {
    await logDataDelete({ ids: ids })
    fcTableRef.value!.getTableList()
}

const deleteMoreClick = (ids: string[]) => {
    ElMessageBox.confirm(
        '是否要删除所选的内容?',
        '提示',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        await logDataDelete({ ids: ids })
        fcTableRef.value!.reset()
        fcTableRef.value!.element?.clearSelection() //清除下selection
    }).catch(() => {

    })
}

</script>

<style scoped>
.demo-form-inline {
    margin-top: 18px;
    width: 100%;
}

.demo-form-inline .el-select {
    --el-select-width: 180px;
}

.el-header {
    height: auto;
}
</style>