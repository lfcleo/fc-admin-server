import http from "@/api";
import { ResultPage } from "../utils/models";
import { BaseListModel, BaseIDModel } from "@/models/base";
import { AdminUserModel, TableAdminUserModel, AdminPwdModel, RoleModel, AdminRoleModel, APIModel, IDsModel, RoleApisModel, DictTypeModel, DictDataModel, RequestDictDataModel, LogDataModel } from "@/models/setting";

// 测试接口
export const testApi = () => {
    return http.post<string>('/v1/token/test');
};

// 管理员列表
export const adminList = (params: BaseListModel) => {
    return http.post<ResultPage<TableAdminUserModel[]>>('/v1/token/admin/list', params);
};

// 创建管理员
export const adminCreate = (params: AdminUserModel) => {
    return http.post<AdminUserModel>('/v1/token/admin/create', params);
};

// 更新管理员
export const adminUpdate = (params: AdminUserModel) => {
    return http.post<AdminUserModel>('/v1/token/admin/update', params);
};

// 设置管理员角色
export const adminSetRole = (params: AdminRoleModel) => {
    return http.post<AdminUserModel>('/v1/token/admin/set/role', params);
};

// 重置管理员密码
export const adminResetPwd = (params: AdminPwdModel) => {
    return http.post<string>('/v1/token/admin/reset/pwd', params);
};

// 删除管理员
export const adminDelete = (params: BaseIDModel) => {
    return http.post<string>('/v1/token/admin/delete', params);
};

// 角色列表
export const roleList = (params: BaseListModel) => {
    return http.post<ResultPage<RoleModel>>('/v1/token/role/list', params);
};

// 创建角色
export const roleCreate = (params: RoleModel) => {
    return http.post<RoleModel>('/v1/token/role/create', params);
};

// 编辑角色
export const roleUpdate = (params: RoleModel) => {
    return http.post<RoleModel>('/v1/token/role/update', params);
};

// 角色菜单列表
export const roleMenus = (params: BaseIDModel) => {
    return http.post<number[]>('/v1/token/role/menus', params);
};

// 设置角色的菜单列表
export const roleSetMenus = (params: IDsModel) => {
    return http.post<string>('/v1/token/role/set/menus', params);
};

// 角色API权限列表
export const roleApis = (params: BaseIDModel) => {
    return http.post<APIModel[]>('/v1/token/role/apis', params);
};

// 设置角色的API权限列表
export const roleSetApis = (params: RoleApisModel) => {
    return http.post<string>('/v1/token/role/set/apis', params);
};

// 删除角色接口
export const roleDelete = (params: BaseIDModel) => {
    return http.post<string>('/v1/token/role/delete', params);
};

// API接口列表
export const apiList = (params: BaseListModel) => {
    return http.post<ResultPage<APIModel>>('/v1/token/api/list', params);
};

// 所有API接口列表
export const apiListAll = () => {
    return http.post<APIModel[]>('/v1/token/api/list/all');
};

// 创建Api接口
export const apiCreate = (params: APIModel) => {
    return http.post<APIModel>('/v1/token/api/create', params);
};

// 编辑Api接口
export const apiUpdate = (params: APIModel) => {
    return http.post<APIModel>('/v1/token/api/update', params);
};

// 删除Api接口
export const apiDelete = (params: BaseIDModel) => {
    return http.post<string>('/v1/token/api/delete', params);
};

// 菜单列表
export const menuList = (params: BaseListModel) => {
    return http.post<Menu.MenuOptions[]>('/v1/token/menu/list', params);
};

// 创建菜单接口
export const menuCreate = (params: Menu.MenuOptions) => {
    return http.post<Menu.MenuOptions>('/v1/token/menu/create', params);
};

// 编辑菜单接口
export const menuUpdate = (params: Menu.MenuOptions) => {
    return http.post<Menu.MenuOptions>('/v1/token/menu/update', params);
};

// 删除菜单接口
export const menuDelete = (params: BaseIDModel) => {
    return http.post<string>('/v1/token/menu/delete', params);
};

// 字典分类列表
export const dictTypeList = (params: BaseListModel) => {
    return http.post<DictTypeModel[]>('/v1/token/dict/type/list', params);
};

// 创建字典分类
export const dictTypeCreate = (params: DictTypeModel) => {
    return http.post<DictTypeModel>('/v1/token/dict/type/create', params);
};

// 更新字典分类
export const dictTypeUpdate = (params: DictTypeModel) => {
    return http.post<DictTypeModel>('/v1/token/dict/type/update', params);
};

// 删除字典分类
export const dictTypeDelete = (params: BaseIDModel) => {
    return http.post<string>('/v1/token/dict/type/delete', params);
};

// 字典数据列表
export const dictDataList = (params: RequestDictDataModel) => {
    return http.post<DictDataModel[]>('/v1/token/dict/data/list', params);
};

// 创建字典数据
export const dictDataCreate = (params: DictDataModel) => {
    return http.post<DictDataModel>('/v1/token/dict/data/create', params);
};

// 更新字典数据
export const dictDataUpdate = (params: DictDataModel) => {
    return http.post<DictDataModel>('/v1/token/dict/data/update', params);
};

// 删除字典数据
export const dictDataDelete = (params: { ids: string[] }) => {
    return http.post<string>('/v1/token/dict/data/delete', params);
};

// 操作日志数据列表
export const logDataList = (params: RequestDictDataModel) => {
    return http.post<LogDataModel[]>('/v1/token/log/list', params);
};

// 删除日志数据列表
export const logDataDelete = (params: { ids: string[] }) => {
    return http.post<string>('/v1/token/log/delete', params);
};