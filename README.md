
### 试衣商城前端

需要配置nginx代理转发

```
    location /api/ {
        proxy_pass http://localhost:4001; # 将请求转发到4000端口的Node.js服务
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    location /public/ {
        proxy_pass http://localhost:4001; # 转发到4000端口
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        rewrite ^/public(.*) $1 break;
    }
```

http块需要配置最大允许大小：

```
http {
    ...
    client_max_body_size 10m;  # 将值设置为10兆字节
    ...
}

```


开发改动点确认列表：
组别下拉选择改输入 后续有时间可改成下拉选择
角色筛选目前为单选 出于工时考虑 后续有时间可改成多选
登录态5天改为24小时

将来开发功能：
删除角色前校验该角色是否有用户（无论用户是否启用禁用）
禁用角色的同时禁用其下所有用户
角色操作权限在后端做判断


### 对webAV的修改

WebAV\packages\av-cliper\src\sprite\base-sprite.ts 40行

删除#号，暴露time属性

pnpm run build 构建后替换项目node_modules\@webav\av-cliper\dist