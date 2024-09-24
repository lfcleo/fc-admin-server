import http from "@/api";
import { AuthRequestModel, AuthModel, MenuPermissionsModel, UserInfoModel, FormPwdModel, DictKeyModel } from "@/models/authModel";
import { DictDataModel } from "@/models/setting";

// 用户账号密码登录
export const authLogin = (params: AuthRequestModel) => {
    return http.post<AuthModel>('/v1/auth/login', params);
};

// 发送验证码
export const authVerificationCode = (params: { username: string }) => {
    return http.post<string>('/v1/auth/verification_code', params);
};

// 用户手机号验证码登录
export const authLoginMobile = (params: AuthRequestModel) => {
    return http.post<AuthModel>('/v1/auth/login/mobile', params);
};

// 退出登录
export const authLogout = () => {
    return http.post('/v1/token/auth/logout');
};

// 获取菜单列表及权限
export const authMenu = () => {
    return http.post<MenuPermissionsModel>('/v1/token/auth/menu');
};

// 更改信息
export const authUpdateInfo = (params: UserInfoModel) => {
    return http.post<UserInfoModel>('/v1/token/auth/update/info', params);
};

// 更改密码
export const authUpdatePwd = (params: FormPwdModel) => {
    return http.post<string>('/v1/token/auth/update/pwd', params);
};

// 获取字典数据
export const authDict = (params: DictKeyModel) => {
    return http.post<DictDataModel[]>('/v1/token/auth/dict', params);
};

// 用户上传文件接口
export const authUpload = (params: FormData) => {
    return http.post<string>('/v1/token/auth/upload', params, { cancel: false });
};