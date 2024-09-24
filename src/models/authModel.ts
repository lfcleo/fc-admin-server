// 用户登录请求参数模型
export interface AuthRequestModel {
    username: string;
    password: string;
    code?: string;
    auto: boolean;
    timestamp?: number;
}

// Auth返回数据模型，返回token和用户信息
export interface AuthModel {
    refreshToken: string;
    token: string;
    userInfo: UserInfoModel;
}

// 管理员模型
export interface UserInfoModel {
    id?: number;
    mobile: string;
    email: string;
    name: string;
    avatar: string;
    sex: number;
    roles?: string[];
};

// 动态路由和权限模型
export interface MenuPermissionsModel {
    menu: Menu.MenuOptions[];
    permissions: string[];
}


// 任务模型
export interface TaskModel {
    id: string;
    taskName: string;
    type: string;
    result: string;
    state: string;
    stateName: string;
    createDate: string;
}

// 消息模型
export interface MsgModel {
    id: number;
    type: string;
    avatar: string;
    title: string;
    describe: string;
    link: string;
    time: string;
}

// 修改密码请求模型
export interface FormPwdModel {
    usePassword: string;
    newPassword: string;
    timestamp: number;
};

// 字典数据请求模型
export interface DictKeyModel {
    key: string;
};