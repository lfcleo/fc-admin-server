import { BaseIDModel } from "./base";

// 管理员模型
export interface AdminUserModel extends BaseIDModel {
    mobile: string;
    email: string;
    name: string;
    avatar: string;
    sex: number;
    status?: number;
    roles?: string[];
    password?: string;
    roleIDs?: number[];
    timestamp?: number;
}

// 表格管理员模型
export interface TableAdminUserModel extends AdminUserModel {
    statusLoading: boolean;
}

// 设置管理员角色模型
export interface AdminRoleModel extends BaseIDModel {
    roleIDs: number[];
}

// 重置管理员密码模型
export interface AdminPwdModel extends BaseIDModel {
    password: string;
    timestamp: number;
}

// 角色模型
export interface RoleModel extends BaseIDModel {
    name: string;
    code: string;
    notes: string;
}

// API模型path和method模型
export interface APIPMModel {
    path: string;
    method: string;
}

// API模型
export interface APIModel extends APIPMModel {
    id?: number;
    description: string;
}

// 设置角色菜单接口模型
export interface IDsModel extends BaseIDModel {
    ids: number[];
}

// 设置角色Api接口模型
export interface RoleApisModel extends BaseIDModel {
    apis: APIPMModel[];
}

// 字典分类模型
export interface DictTypeModel extends BaseIDModel {
    name: string;
    type: string;
    status: number;
    notes: string;
}

// 字典数据模型
export interface DictDataModel extends BaseIDModel {
    label: string;
    value: string;
    status: number;
    sort: number;
    notes: string;
    dictType: string;
}

// 请求字典数据
export interface RequestDictDataModel extends BaseIDModel {
    page: number;
    pageSize: number;
}

// 操作日志模型
export interface LogDataModel extends BaseIDModel {
    ip: string;
    method: string;
    path: string;
    agent: string;
    request: string;
    response: string;
    code: number;
    administratorID: number;
    administrator: AdminUserModel;
}