
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
