# 在线工具集合

基于 Next.js 构建的实用在线工具集合。

## 功能列表

### 聚水潭工具
- 组装聚水潭上送数据
- 组装聚水潭数据并格式化
- 聚水潭订单Json格式化

### 数据库工具
- SQL表格数据转JSON（支持带边框和无边框格式）

### 格式化工具
- JSON格式化
- JavaScript格式化
- HTML格式化

### 时间工具
- 时间戳转换（支持秒/毫秒、本地时间、ISO时间格式）

### 编码工具
- Base64加解密（支持文本和图片）
- AES加解密

## 安装和运行

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

访问 http://localhost:3000 查看应用。

## 技术栈

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Web Crypto API (用于AES加解密)

