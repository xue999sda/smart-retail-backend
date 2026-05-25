# =========================================================================
# Stage 1: 前端静态产物构建阶段 (Build Stage)
# =========================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# 优先拷贝 package 依赖文件以利用 Docker 缓存层
COPY package*.json ./

# 安装全量依赖（包含开发依赖以执行 Vite 编译）
RUN npm ci

# 拷贝前端与后端全部源码
COPY . .

# 执行 Vite 生产编译，将 React 前端产物输出至 dist 文件夹
RUN npm run build

# =========================================================================
# Stage 2: 生产运行阶段 (Production Stage)
# =========================================================================
FROM node:20-alpine AS runner

WORKDIR /app

# 声明生产环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 只拷贝 package 文件以安装精简的生产依赖，规避臃肿体积
COPY package*.json ./

# 只安装生产所需依赖，并全局轻量化安装 tsx 运行时以承载 server.ts 的执行
RUN npm ci --omit=dev && npm install -g tsx

# 拷贝后端入口服务
COPY server.ts ./

# 从 Stage 1 拷贝编译好的前端静态托管 dist 文件夹
COPY --from=builder /app/dist ./dist

# 暴露端口，Render 将根据端口自动做公网反向代理
EXPOSE 3001

# 启动一体化前后端服务进程
CMD ["tsx", "server.ts"]
