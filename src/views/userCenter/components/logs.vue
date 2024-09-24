<template>
    <!-- style="background-color: #fff;" -->
    <el-container>
        <el-main style="background-color: #fff; padding:20px 20px 0 20px">
            <fc-table ref="fcTableRef" :initParam="requestParam" :requestApi="logDataList" :columns="columns">
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
            </fc-table>
        </el-main>
    </el-container>
    <!-- </el-card> -->
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { ColumnProps, FcTableInstance } from "@/components/fcTable/model"
import { LogDataModel } from "@/models/setting";
import { logDataList } from "@/api/modules/setting";

// fcTabel 实例
const fcTableRef = ref<FcTableInstance>();
// 初始化请求参数
const requestParam = reactive({
    "administratorID": 1
})

// 表格配置项
const columns = reactive<ColumnProps<LogDataModel>[]>([
    { prop: "administrator.name", label: "操作人", width: 150 },
    { prop: "createdAt", label: "日期", width: 150 },
    { prop: "code", label: "响应码" },
    { prop: "ip", label: "IP地址", width: 120 },
    { prop: "method", label: "请求方法", width: 100 },
    { prop: "path", label: "请求路径", width: 300 },
    { prop: "agent", label: "代理" },
    { prop: "request", label: "请求参数" },
    { prop: "response", label: "响应结果" },
]);

</script>