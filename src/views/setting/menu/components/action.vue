<template>
    <el-container>
        <el-header style="padding-bottom: 10px;height: auto;">
            <div class="left-panel"></div>
            <div class="right-panel">
                <el-button v-role="['admin']" class="addBtn" :loading="submitLoading" type="primary"
                    @click="submitClick(formRef)">提 交</el-button>
                <el-button icon="Close" circle @click="() => { emit('cancelClick') }" />
            </div>
        </el-header>
        <el-main style="padding-top: 10px;">
            <el-row :gutter="40" v-if="menuModel">
                <el-col :lg="12">
                    <h3 class="margin-bottom-10">{{ menuModel.meta.title || '新增菜单' }}</h3>
                    <el-form :model="menuModel" ref="formRef" label-width="90px" label-position="right">
                        <el-form-item label="菜单标题" prop="meta.title" :rules="{ required: true, message: '请输入菜单显示标题' }">
                            <el-input v-model="menuModel.meta.title" clearable placeholder="菜单显示标题。例如：菜单管理"
                                :maxlength="20"></el-input>
                        </el-form-item>
                        <el-form-item label="上级菜单" prop="parentID">
                            <el-input v-model="props.parentMenuTitle" disabled></el-input>
                        </el-form-item>
                        <el-form-item label="菜单类型">
                            <el-radio-group v-model="menuModel.meta.type">
                                <el-radio-button label="菜单" value="MENU" />
                                <el-radio-button label="按钮" value="BUTTON" v-if="props.formData.parentID != 0" />
                                <el-radio-button label="外链" value="LINK" />
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="菜单标识" prop="name" :rules="{ required: true, message: '请输入菜单标识名称' }">
                            <el-input v-model="menuModel.name" clearable placeholder="菜单名称。例如：settingMenu"
                                :maxlength="20"></el-input>
                            <div class="el-form-item-msg">系统唯一且与内置组件名一致，否则导致缓存失效</div>
                        </el-form-item>
                        <el-form-item label="显示排序" prop="sort">
                            <el-input-number v-model="menuModel.sort" :min="0" />
                        </el-form-item>
                        <el-form-item label="菜单图标" prop="meta.icon" v-if="menuModel.meta.type != 'BUTTON'">
                            <fc-icon-select v-model="menuModel.meta.icon" clearable></fc-icon-select>
                        </el-form-item>
                        <el-form-item label="访问地址" prop="path" v-if="menuModel.meta.type != 'BUTTON'"
                            :rules="{ required: true, message: '请输入访问地址' }">
                            <el-input v-model="menuModel.path" clearable :maxlength="255"
                                :placeholder="menuModel.meta.type == 'LINK' ? '以http或https开头的外部连接网址' : '访问地址。例如：/setting/menu'">
                            </el-input>
                        </el-form-item>
                        <el-form-item label="重定向" prop="redirect" v-if="menuModel.meta.type == 'MENU'">
                            <el-input v-model="menuModel.redirect" clearable placeholder="打开访问地址会重定向该地址中，无视图有子菜单的必填。"
                                :maxlength="255"></el-input>
                        </el-form-item>
                        <el-form-item label="视图文件" prop="component" v-if="menuModel.meta.type == 'MENU'">
                            <el-input v-model="menuModel.component" clearable placeholder="代码文件目录。例如：setting/menu/index"
                                :maxlength="255">
                                <template #prepend>src/views/</template>
                            </el-input>
                            <div class="el-form-item-msg">如父节点、外链等没有视图的菜单不需要填写</div>
                        </el-form-item>
                        <el-form-item label="页面缓存" prop="meta.isKeepAlive" v-if="menuModel.meta.type != 'BUTTON'">
                            <div class="dis-flex">
                                <el-switch v-model="menuModel.meta.isKeepAlive" />
                                <div class="el-form-item-msg margin-left-20">缓存后每次切换标签页，页面内容不会重新加载</div>
                            </div>
                        </el-form-item>
                        <el-form-item label="是否隐藏" prop="meta.isHide" v-if="menuModel.meta.type != 'BUTTON'">
                            <div class="dis-flex">
                                <el-switch v-model="menuModel.meta.isHide" />
                                <div class="el-form-item-msg margin-left-20">菜单不显示在导航中，但用户依然可以访问，例如详情页</div>
                            </div>
                        </el-form-item>
                        <el-form-item label="整页显示" prop="isFull" v-if="menuModel.meta.type != 'BUTTON'">
                            <div class="dis-flex">
                                <el-switch v-model="menuModel.meta.isFull" />
                                <div class="el-form-item-msg margin-left-20">视图将会全屏显示</div>
                            </div>
                        </el-form-item>
                        <el-form-item label="标签" prop="isAffix" v-if="menuModel.meta.type != 'BUTTON'">
                            <div class="dis-flex">
                                <el-switch v-model="menuModel.meta.isAffix" />
                                <div class="el-form-item-msg margin-left-20">是否在顶部标签栏中固定，一般是首页。</div>
                            </div>
                        </el-form-item>
                        <el-form-item label="标签" prop="meta.tag" v-if="menuModel.meta.type != 'BUTTON'">
                            <el-input v-model="menuModel.meta.tag" clearable placeholder="最长6个字，将在菜单栏中显示"
                                :maxlength="6"></el-input>
                        </el-form-item>
                    </el-form>
                </el-col>
                <el-col :lg="12" class="parme-list" v-if="menuModel.meta.type == 'MENU'">
                    <h3 class="margin-bottom-10">参数设置</h3>
                    <div class="parame-type">
                        <div>参数类型</div>
                        <el-radio-group class="margin-bottom-10" v-model="parameType">
                            <el-radio-button label="query" value="query" />
                            <el-radio-button label="params" value="params" />
                        </el-radio-group>
                    </div>
                    <fc-form-table stripe ref="ftRef" :data="parameList" :columns="columns"
                        :data-template="dataTemplate">
                        <template #key="scope">
                            <el-input v-model="scope.row.key" placeholder="请输入参数key"></el-input>
                        </template>
                        <template #value="scope">
                            <el-input :disabled="parameType == 'params' ? true : false" v-model="scope.row.value"
                                placeholder="请输入参数值"></el-input>
                        </template>
                    </fc-form-table>
                </el-col>
            </el-row>
        </el-main>
    </el-container>
</template>

<script setup lang='ts'>
import { ref, reactive, onMounted } from 'vue';
import { FormInstance } from 'element-plus'
import { FTColumnProps } from '@/components/fcFormTable/index.vue'
import FcFormTable from '@/components/fcFormTable/index.vue'
import { menuCreate, menuUpdate } from '@/api/modules/setting';

interface PropsModel {
    parentMenuTitle: string,   //上层路由菜单的标题和id
    formData: Menu.MenuOptions,
}

// formTable模型
interface ftModel {
    key: string;
    value: string;
}

const props = defineProps<PropsModel>();
const emit = defineEmits<{
    cancelClick: [];
    submitClick: [formData: Menu.MenuOptions];
}>();
const menuModel = ref<Menu.MenuOptions>()
const parameType = ref('query')             //参数类型，query 和 params
const formRef = ref<FormInstance>()         //form实例
const ftRef = ref<InstanceType<typeof FcFormTable>>();  //fc-form-table实例
const submitLoading = ref(false);
// 表单表格配置项
const columns = reactive<FTColumnProps<ftModel>[]>([
    { prop: "key", label: "参数key" },
    { prop: "value", label: "参数值value" },
]);
// fc-form-table的默认模板
const dataTemplate = reactive<ftModel>({
    key: '',
    value: '',
});
// fc-form-table所需的值
const parameList = reactive<ftModel[]>([])

onMounted(() => {
    menuModel.value = JSON.parse(JSON.stringify(props.formData))
})

// 提交按钮响应方法
const submitClick = async (formEl: FormInstance | undefined) => {
    if (!formEl) return
    //校验
    await formEl.validate(async (valid) => {
        if (!valid) return
        submitLoading.value = true
        menuModel.value!.path += setMenuPathParam()                              //组合请求参数
        //判断path字段是否以'/'开头，不是的话添加/
        if (menuModel.value!.path && !menuModel.value!.path.startsWith('/')) {
            menuModel.value!.path = '/' + menuModel.value!.path
        }
        //判断redirect字段是否以'/'开头，不是的话添加/
        if (menuModel.value!.redirect && !menuModel.value!.redirect.startsWith('/')) {
            menuModel.value!.redirect = '/' + menuModel.value!.redirect
        }
        //判断component字段是否以'/'开头，是的话删除/
        if (menuModel.value!.component && typeof menuModel.value!.component === 'string' && menuModel.value!.component.startsWith('/')) {
            menuModel.value!.component = menuModel.value!.component.slice(1);
        }
        var requestData: Menu.MenuOptions = { ...menuModel.value! }
        try {
            var response: any
            // 有ID，编辑。无ID，创建
            if (requestData.id! > 0) {
                response = await menuUpdate(requestData)
            } else {
                response = await menuCreate(requestData)
            }
            submitLoading.value = false
            emit('submitClick', response.data)
        } catch (error) {
            submitLoading.value = false
        }
    })
}

//设置路径参数
const setMenuPathParam = (): string => {
    //判断是否设置了默认参数
    if (parameList.length > 0 && menuModel.value!.meta.type == 'MENU') {
        let qString = '';
        //判断参数类型，是query还是params
        if (parameType.value == 'query') {
            //query形式，把参数拼接为 ?id=123&title=%E6%A0%87%E9%A2%98 这种形式
            qString = '?'
            parameList.forEach((param, index) => {
                qString += `${encodeURIComponent(param.key)}=${encodeURIComponent(param.value)}`;   //键值进行URL编码，以避免特殊字符导致问题
                if (index < parameList.length - 1) {
                    qString += '&';
                }
            });
        } else {
            //query形式，把参数拼接为 /:id/:title 这种形式
            parameList.forEach(param => {
                qString += `/:${param.key}`;
            });
        }
        return qString
    }
    return ''
}

</script>

<style scoped>
.margin-20 {
    margin: 20px;
}

.margin-bottom-10 {
    margin-bottom: 10px;
}

.parme-list {
    border-left: 1px solid #eee;
}

.parame-type {
    display: flex;
    align-items: center;

    div {
        height: 32px;
        font-size: 14px;
        margin-right: 20px;
    }
}

.dis-flex {
    width: 100%;
    display: flex;
}

.margin-left-20 {
    margin-left: 20px;
}
</style>