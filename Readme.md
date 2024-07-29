
# LibreTranslator

LibreTranslator 是一个基于 React 的翻译工具，利用 DeepLx API 提供快速和准确的翻译服务。用户可以选择源语言和目标语言，输入文本并获取翻译结果。

### 功能

- 支持多种语言的翻译
- 友好的用户界面（待完善）

### 技术栈

- **前端**: React
- **样式**: CSS
- **API**: DeepL API

### 项目结构

```
/pdeeplx
├── /public
│   ├── index.html
│   └── styles.css
├── /src
│   ├── App.js
│   ├── index.js
│   └── styles.css
└── package.json
```



## 部署

#### 使用 Cloudflare Pages 部署

1. 登录到 [Cloudflare](https://www.cloudflare.com/) 并创建一个帐户（如果没有）。
2. 在 Cloudflare Dashboard 中，选择 "Pages"。
3. 点击 "Create a Project"。
4. 连接到您的 GitHub 存储库，并选择该项目。
5. 在 "Configure your build" 步骤中，使用以下设置：
   - **Framework preset**: `Create React App`
   - **Build command**: `npm run build`
   - **Build directory**: `build`
6. 点击 "Save and Deploy"。

#### 使用 Vercel 部署

1. 登录到 [Vercel](https://vercel.com/) 并创建一个帐户（如果没有）。
2. 点击 "New Project"。
3. 连接到您的 GitHub 存储库，并选择该项目。
4. Vercel 会自动检测到您使用的是 React 项目。您可以使用默认设置。
5. 点击 "Deploy"。

---

### 贡献

欢迎任何形式的贡献！请提交问题或拉取请求。
