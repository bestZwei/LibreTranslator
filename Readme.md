# LibreTranslator

LibreTranslator 是一个基于 React 的翻译工具，支持多个免费翻译接口，默认使用 **Google 翻译**（无需密钥，开箱即用）。用户可以在界面右上角切换翻译接口、选择源语言和目标语言，输入文本并获取翻译结果。

### 功能

- 内置多个免费翻译接口：Google 翻译（默认）、DeepLX、LibreTranslate、MyMemory
- 可在界面随时切换翻译接口，选择会被记住
- 支持多种语言的翻译
- 友好的用户界面（待完善）

### 技术栈

- **前端**: React
- **样式**: CSS
- **API**: 多接口（Google / DeepLX / LibreTranslate / MyMemory）

### 部署

#### 1、使用 Cloudflare Pages 部署

1. Fork 本仓库。
2. 登录到 [Cloudflare](https://www.cloudflare.com/) ，在 Cloudflare Dashboard 中，选择 "Pages"。
3. 点击 "Create a Project"。
4. 连接到您的 GitHub 存储库，并选择该项目。
5. 在 "Configure your build" 步骤中，使用以下设置：
   - **Framework preset**: 
   - **Build command**: `npm run build`
   - **Build directory**: `build`
6. 点击 "Save and Deploy"。

#### 2、使用 Vercel 部署

1. Fork 本仓库。
2. 登录到 Vercel，点击 "New Project"。
3. 连接到您的 GitHub 存储库，并选择该项目。
4. Vercel 会自动检测到您使用的是 React 项目。您可以使用默认设置。
5. 点击 "Deploy"。

#### 3、使用腾讯 EdgeOne Pages 部署

您也可以通过 [腾讯 EdgeOne Pages](https://edgeone.ai/pages) 一键部署 LibreTranslator：

[![Use EdgeOne Pages to deploy](https://cdnstatic.tencentcs.com/edgeone/pages/deploy.svg)](https://edgeone.ai/pages/new?repository-url=https%3A%2F%2Fgithub.com%2Fbestzwei%2FLibreTranslator)

点击上方按钮即可在 EdgeOne Pages 部署本项目。  
您可以在部署控制台中根据需要调整构建设置和环境变量。

#### 所有部署方式都要配置环境变量

> 默认接口为 **Google 翻译**，无需任何密钥即可直接使用。只有使用其它接口时才需要配置对应的地址。

1. **REACT_APP_DEFAULT_PROVIDER（可选）**: 默认翻译接口

   可设为 `google` / `deeplx` / `libretranslate` / `mymemory`，不设置或为空时默认 `google`。

2. **REACT_APP_GOOGLE_API_URL（可选）**: Google 翻译接口地址

   默认 `https://translate.googleapis.com`，一般无需修改。

3. **REACT_APP_DEEPLX_API_URL**: `https://api.deeplx.org/<api-key>`  ，不带 `/translate`

   用于 DeepLX 接口。仅当切换到 DeepLX 时才需要。`<api-key> `可以从 https://connect.linux.do/ 获取。

   或者你是Pro用户，参考 [DeepLx文档 ](https://deeplx.owo.network/endpoints/pro.html)使用 `/v1` 请求 ，`https://api.deeplx.org/v1`

4. **REACT_APP_LIBRETRANSLATE_URL（可选）**: LibreTranslate 接口地址

   默认 `https://translate.argosopentech.com`，可替换为自建或其它公共实例。

5. **REACT_APP_MYMEMORY_API_URL（可选）**: MyMemory 接口地址

   默认 `https://api.mymemory.translated.net`，无需密钥即可使用（有免费调用额度限制）。

6. **REACT_APP_PASSWORD（可选）**: 访问密码

   用于存储访问口令，限制其他人使用你部署的翻译网页。

7. **NODE_OPTIONS**:`--openssl-legacy-provider`   

   这个变量用于配置 Node.js 的选项，通常用于解决某些依赖包的兼容性问题，不设置则可能部署失败。

8. **REACT_APP_API_TOKEN（可选）**：按需修改，如果你是**自建的DeepLx服务**，参考请求链接是 `REACT_APP_DEEPLX_API_URL/translate?token=REACT_APP_API_TOKEN`，填写这两个环境变量。


---

### 贡献

欢迎任何形式的贡献！请提交问题或拉取请求。
