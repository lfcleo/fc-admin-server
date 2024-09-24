import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { ElMessageBox, ElNotification } from "element-plus";
import { AxiosCanceler } from "./utils/axiosCancel";
import { ResultData } from "./utils/models";
import { useAuthStore } from "@/store/modules/auth";
import { useMenuStore } from "@/store/modules/menu";
import encryptionTool from '@/utils/encryption'
import router from "@/router";

//可设置公共请求头，会追加到headers中,如有需要
const publicHeaders = {
    Type: "Web",
    Encryption: import.meta.env.VITE_REQUEST_ENCRYPTION_KEY ? "true" : "false"
}

const config = {
    baseURL: import.meta.env.VITE_VUE_API_BASEURL as string,
    // 设置超时时间
    timeout: import.meta.env.VITE_TIMEOUT as number,
    // 跨域时候允许携带凭证
    withCredentials: true
};

export interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
    cancel?: boolean;
}

//FIX 多个API同时401时疯狂弹窗BUG
let MessageBox_401_show = false

const axiosCanceler = new AxiosCanceler();

let HeaderToken = 'Token'   //response header token，用于更改本地token

class RequestHttp {
    service: AxiosInstance;
    public constructor(config: AxiosRequestConfig) {
        // instantiation
        this.service = axios.create(config);

        /**
         * @description 请求拦截器
         * 客户端发送请求 -> [请求拦截器] -> 服务器
         * token校验(JWT) : 接受服务器返回的 token,存储到 vuex/pinia/本地储存当中
         */
        this.service.interceptors.request.use(
            (config: CustomAxiosRequestConfig) => {
                const authStore = useAuthStore();
                // 重复请求不需要取消，在 api 服务中通过指定的第三个参数: { cancel: false } 来控制
                config.cancel ??= true;
                if (MessageBox_401_show) {  //如果有401弹窗，取消此次请求。
                    axiosCanceler.removePending(config)
                }
                config.cancel && axiosCanceler.addPending(config);
                if (authStore.token) {
                    config.headers[import.meta.env.VITE_TOKEN_NAME] = authStore.token
                }
                Object.assign(config.headers, publicHeaders)

                config.data ??= {}
                //公共参数时间戳
                var timestamp: number = config.data['timestamp'] && config.data['timestamp'] > 0 ? config.data['timestamp'] : new Date().getTime();
                //公共参数版本号
                var version = import.meta.env.VITE_VUE_VERSION
                // 执行队列中的函数，config.data是string类型
                if (typeof config.data == "string") {
                    config.data = JSON.parse(config.data)   //转为json类型
                    timestamp = config.data['timestamp']    //设置时间戳
                }
                // 判断是否需要请求加密
                if (import.meta.env.VITE_REQUEST_ENCRYPTION_KEY && !config.data['encryptData']) {
                    const timeIV = (timestamp * 1000).toString()
                    // 判断是否是上传文件类型
                    if (config.data instanceof FormData) {
                        //设置加密请求参数
                        const dir = config.data.get("director") as string
                        config.data.delete("director")
                        config.data.get("encryptData") ?? config.data.append("encryptData", encryptionTool.AES.encrypt(dir, import.meta.env.VITE_REQUEST_ENCRYPTION_KEY, timeIV))
                    } else {
                        const jsonStr = JSON.stringify(config.data)
                        config.data = {}
                        //设置加密请求参数
                        config.data['encryptData'] = encryptionTool.AES.encrypt(jsonStr, import.meta.env.VITE_REQUEST_ENCRYPTION_KEY, timeIV)
                    }
                }
                //判断如果是上传文件，设置Content-Type为multipart/form-data
                if (config.data instanceof FormData) {
                    config.headers["Content-Type"] = "multipart/form-data"
                    //上传文件添加公共参数
                    config.data.get("timestamp") ?? config.data.append("timestamp", timestamp.toString())
                    config.data.get("version") ?? config.data.append("version", version)
                } else {
                    //添加公共请求参数
                    config.data['timestamp'] = timestamp
                    config.data!['version'] = version
                }
                return config;
            },
            (error: AxiosError) => {
                return Promise.reject(error);
            }
        );

        /**
         * @description 响应拦截器
         *  服务器换返回信息 -> [拦截统一处理] -> 客户端JS获取到信息
         */
        this.service.interceptors.response.use(
            async (response: AxiosResponse & { config: CustomAxiosRequestConfig }) => {
                const { data, config } = response;
                axiosCanceler.removePending(config);
                //判断返回header中是否有token，有的话更新本地token
                if (response.headers[HeaderToken.toLowerCase()] !== undefined) {
                    useAuthStore().token = response.headers[HeaderToken.toLowerCase()]
                }
                //判断数据是否加密,加密要对数据做解密处理
                if (response.headers["encryption"] && response.headers["encryption"] == "true") {
                    var ivKey = ""
                    // 判断是否是上传文件类型
                    if (config.data instanceof FormData) {
                        const timestamp = config.data.get("timestamp") as string
                        ivKey = (parseInt(timestamp, 10) * 1000).toString()
                    } else {
                        config.data = JSON.parse(config.data)   //转为json类型
                        ivKey = (config.data["timestamp"] * 1000).toString()
                    }
                    var decryptData = encryptionTool.AES.decrypt(data.data as string, import.meta.env.VITE_REQUEST_ENCRYPTION_KEY, ivKey)
                    data.data = this.parseDecryptValue(decryptData)
                }
                //判断响应状态码
                switch (data.code) {
                    case 200:                       //200--响应成功，返回正常数据
                        return Promise.resolve(data)

                    case 401:                       //401--登录失效,重新登录
                        return this.logout(data)

                    case 402:                       //402--token过期，重新刷新token
                        const data402 = await this.service.post('v1/token/auth/refresh', { "token": useAuthStore().refreshToken })
                        useAuthStore().token = data402.data
                        return this.service(config)

                    case 403:                       //402--账户停用，需联系管理员处理
                        return this.logout(data)

                    case 410:                       //410--管理员信息更新，重新获取管理员信息
                        const data410 = await this.service.post('v1/token/auth/info', {})
                        useAuthStore().userInfo = data410.data
                        return this.service(config)

                    case 411:                       //411--管理员角色信息更新，重新登录
                        // return this.logout(data)
                        //获取用户信息
                        // const info411 = await this.service.post('v1/token/auth/info', {})
                        // useAuthStore().userInfo = info411.data
                        //获取动态路由和权限

                        // const menu411 = await this.service.post('v1/token/auth/menu', {})
                        // useMenuStore().list = menu411.data.menu
                        // useMenuStore().permissions = menu411.data.permissions
                        // window.location.reload();//刷新页面
                        // return Promise.reject("管理员角色信息有更新");
                        return this.reload411()

                    case 412:                       //412--管理员密码更新，重新登录
                        return this.logout(data)

                    default:                        //其它请求错误
                        ElNotification.error({
                            title: '请求错误',
                            message: data.message || `Status:${data.code}，未知错误！`
                        });
                        return Promise.reject(data);
                }
            },
            async (error: AxiosError) => {
                const { response } = error;
                // 请求超时 && 网络错误单独判断，没有 response
                if (error.message.indexOf("timeout") !== -1) ElNotification.error("请求超时！请您稍后重试");
                if (error.message.indexOf("Network Error") !== -1) ElNotification.error("网络错误！请您稍后重试");
                // 根据服务器响应的错误状态码
                if (response) ElNotification.error("服务器错误");
                // 服务器结果都没有返回(可能服务器错误可能客户端断网)，断网处理:可以跳转到断网页面
                if (!window.navigator.onLine) router.replace("/500");
                return Promise.reject(error);
            }
        );
    }

    /**
     * @description 常用请求方法封装
     */
    get<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
        return this.service.get(url, { params, ..._object });
    }
    post<T>(url: string, params?: object | string, _object = {}): Promise<ResultData<T>> {
        return this.service.post(url, params, _object);
    }
    put<T>(url: string, params?: object, _object = {}): Promise<ResultData<T>> {
        return this.service.put(url, params, _object);
    }
    delete<T>(url: string, params?: any, _object = {}): Promise<ResultData<T>> {
        return this.service.delete(url, { params, ..._object });
    }
    download(url: string, params?: object, _object = {}): Promise<BlobPart> {
        return this.service.post(url, params, { ..._object, responseType: "blob" });
    }

    /**
     * @description 退出登录，跳转登录页面重新登录
     */
    private logout(data: any): Promise<any> {
        if (!MessageBox_401_show) {
            MessageBox_401_show = true
            useAuthStore().$reset();
            ElMessageBox.alert(data.data, '提示', {
                type: 'error',
                center: true,
                confirmButtonText: '重新登录',
                showClose: false,
                beforeClose: (_action, _instance, done) => {
                    MessageBox_401_show = false
                    done()
                }
            }).then(() => {
                router.replace({ path: '/login' });
            }).catch(() => { })
        }
        return Promise.reject(data);
    }

    /**
    * @description 重新获取用户动态菜单和管理权限，并刷新页面
    */
    private async reload411() {
        const menu411 = await this.service.post('v1/token/auth/menu', {})
        useMenuStore().list = menu411.data.menu
        useMenuStore().permissions = menu411.data.permissions
        ElMessageBox.alert("当前账号菜单/权限有更新，需刷新页面。请刷新后重新操作", '提示', {
            type: 'error',
            center: true,
            confirmButtonText: '立即刷新',
            showClose: false,
            beforeClose: (_action, _instance, done) => {
                MessageBox_401_show = false
                done()
            }
        }).then(() => {
            window.location.reload();//刷新页面
        }).catch(() => { })
    }

    /**
     * @description 解密后的数据类型转换，
     */
    private parseDecryptValue(data: string): any {
        try {
            // 尝试将字符串解析为 JSON  
            const json = JSON.parse(data);
            return json;
        } catch (e) {
            // 如果解析失败，则检查是否为布尔值字符串  
            if (data === 'true') return true;
            if (data === 'false') return false;

            // 检查是否为数字字符串  
            const number = Number(data);
            if (!Number.isNaN(number)) return number;

            // 默认返回原字符串  
            return data;
        }
    }
}

export default new RequestHttp(config);
