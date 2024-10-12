<div align="center">

<img src="https://mock.fcadmin.fun/web/img/logo.png" width="120px" height="120px"/>

<p align="center" style="margin-top:20px">
	<a href="https://v3.vuejs.org/" target="_blank">
		<img src="https://img.shields.io/badge/vite-5.x-blue" alt="Vite">
	</a>
	<a href="https://v3.vuejs.org/" target="_blank">
		<img src="https://img.shields.io/badge/Vue.js-3.x-green" alt="Vue">
	</a>
	<a href="https://element-plus.org/#/zh-CN/component/changelog" target="_blank">
		<img src="https://img.shields.io/badge/element--plus-latest-blue" alt="element plus">
	</a>
</p>

<h1>FC-Admin-Server</h1>

</div>

## 前言

自[FC-Admin](https://github.com/lfcleo/fc-admin)上线后，有小伙伴添加了我的微信，提出能否出一版能与服务端交互的权限管理版本，基于此[FC-Admin-Server](https://github.com/lfcleo/fc-admin-server)出炉开源。方便服务端开发人员快速使用。

## 功能

- [ ] 邮箱登录/手机号登录
- [ ] 管理员信息修改
- [ ] JWT鉴权
- [ ] 无感刷新Token
- [ ] casbin API接口鉴权
- [ ] 网络请求响应加密（视频介绍待录制）
- [ ] 菜单管理（视频介绍待录制）
- [ ] 接口管理（视频介绍待录制）
- [ ] 角色管理（视频介绍待录制）
- [ ] 用户管理（视频介绍待录制）
- [ ] 字典管理（视频介绍待录制）
- [ ] 操作日志（视频介绍待录制）
- [ ] 刷新权限（视频介绍待录制）

## 配套的后端服务项目

**Go语言** 

- https://github.com/lfcleo/fc-admin-server-go （作者：[L](https://github.com/lfcleo)）

## 开启本地服务器体验

如果没有后端开发技能，想体验项目可根据以下步骤进行操作。已有后端服务则无须进行此步骤。

[FC-Admin-Server](https://github.com/lfcleo/fc-admin-server)是前后端分离项目，作者使用Go语言开发了一版服务端，同时也希望有后端大佬们可以开发开源其它后端语言版本，如Java，PHP，Python...（统一下项目名称格式，fc-admin-server-xxx。例如：fc-admin-server-java，fc-admin-server-php，fc-admin-server-python等，可联系作者在此文档中贴出您的开源地址。）

> 准备

服务端应用程序的运行需要安装`redis`（作者版本:7.2.4）和`mysql`（作者版本:8.3.0）。安装教程请自行百度/谷歌。运行程序前一定要先启动`redis`和`mysql`服务。

在`mysql`中，创建`fc_admin`数据库。（数据库类型：CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci）

项目根目录下的`server.zip`文件，是编译后压缩的服务端文件，移动到其它文件夹下解压，解压后的`server`文件夹里面有3个文件夹，根据自己电脑操作系统，进行操作。

以MacOS操作系统为例，接下来的操作是在解压后的`server/Mac`文件夹下进行的。（Windows和Linux一样，在解压后的`server/Windows`文件夹和`server/Linux`文件夹下进行）

编辑器打开`server/Mac/config.yaml`文件，此文件为程序运行的配置文件，每一项配置都有注释说明，根据实际情况填写。主要配置`httpPort 端口号`，`database 数据库配置`，`redis 配置`。**账号密码等不要填错了**。

> MacOS操作系统

使用终端程序，cd进入到解压后的`Mac`文件夹中，执行

```shell
./main
```

> Windows操作系统

使用cmd命令行程序，cd进入到解压后的`Windows`文件夹中，执行

```shell
main.exe
```

> Linux操作系统

进入到解压后的`Linux`文件夹中，执行

```shell
./main
```

> 启动成功

以MacOS为例

启动成功后，在终端会显示如下信息
```
2024/10/07 10:41:58 Hello, Http服务正在启动中...
[GIN-debug] [WARNING] Running in "debug" mode. Switch to "release" mode in production.
 - using env:	export GIN_MODE=release
 - using code:	gin.SetMode(gin.ReleaseMode)

[GIN-debug] POST   /v1/auth/login            --> fc-admin-server-go/routers/v1.Login (6 handlers)
...
[GIN-debug] HEAD   /web/*filepath            --> github.com/gin-gonic/gin.(*RouterGroup).createStaticHandler.func1 (4 handlers)
```

> 启动失败

可根据终端显示的信息排查，大部分是操作权限问题或者是`config.yaml`文件配置信息填写错了，仔细对照注释检查。

# 安装教程（Install）

同[FC-Admin](https://github.com/lfcleo/fc-admin)一样

例如启动本地服务
```
npm run dev
```

浏览器打开`http://localhost:2801`

超级管理员账号：admin@admin.com

超级管理员手机号：18888888888

超级管理员密码：Qwe123

即可体验。