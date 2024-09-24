// 列表请求参数模型
export interface BaseListModel {
    page: number;
    pageSize: number;
}

// ID请求参数模型
export interface BaseIDModel {
    id?: number;
    createdAt?: string;
}