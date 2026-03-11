# JWT认证修复说明

## 问题描述

用户在使用配对功能时遇到JWT认证问题：
- 前端正确发送JWT token（在Authorization header中）
- 后端SecurityConfig已配置`/api/**`路径放行（permitAll）
- 但Controller调用`getUserId()`时仍然失败，提示"获取用户ID异常"
- 日志显示："JWT signature does not match locally computed signature"

## 根本原因

系统中存在两套JWT认证机制，使用不同的secret密钥：

### 1. RuoYi原有认证系统（管理后台）
- **过滤器**: `JwtAuthenticationTokenFilter`
- **服务**: `TokenService`
- **密钥**: `token.secret: abcdefghijklmnopqrstuvwxyz`
- **用途**: 管理后台用户认证
- **特点**: 需要Redis存储用户会话

### 2. 小程序认证系统（新增）
- **过滤器**: `WechatJwtAuthenticationFilter`
- **服务**: `JwtTokenProvider`
- **密钥**: `jwt.secret: your-secret-key-change-this-in-production-environment-for-security`
- **用途**: 微信小程序用户认证
- **特点**: 无状态JWT，不依赖Redis

### 冲突原因

两个过滤器都会处理所有请求：
1. `WechatJwtAuthenticationFilter`用`jwt.secret`验证token → 成功
2. `JwtAuthenticationTokenFilter`用`token.secret`验证同一个token → 失败（签名不匹配）

虽然`WechatJwtAuthenticationFilter`成功设置了Security上下文，但`JwtAuthenticationTokenFilter`的错误日志仍然会打印出来，造成困扰。

## 解决方案

### 方案：路径隔离

让两个过滤器各自处理不同的请求路径：
- `WechatJwtAuthenticationFilter` → 只处理 `/api/**`（小程序请求）
- `JwtAuthenticationTokenFilter` → 跳过 `/api/**`，处理其他请求（管理后台）

### 修改1: WechatJwtAuthenticationFilter

添加路径检查，只处理小程序API请求：

```java
@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException
{
    try
    {
        // 只处理小程序API请求（/api/**）
        String requestURI = request.getRequestURI();
        if (!requestURI.startsWith("/api/"))
        {
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = getTokenFromRequest(request);
        if (StringUtils.hasText(token) && tokenProvider.validateToken(token))
        {
            // ... 设置Security上下文
        }
    }
    catch (Exception ex)
    {
        logger.error("Could not set user authentication in security context", ex);
    }
    filterChain.doFilter(request, response);
}
```

### 修改2: JwtAuthenticationTokenFilter

添加路径检查，跳过小程序API请求：

```java
@Override
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
        throws ServletException, IOException
{
    // 跳过小程序API请求（/api/**），这些请求由WechatJwtAuthenticationFilter处理
    String requestURI = request.getRequestURI();
    if (requestURI.startsWith("/api/"))
    {
        chain.doFilter(request, response);
        return;
    }
    
    LoginUser loginUser = tokenService.getLoginUser(request);
    // ... 原有逻辑
}
```

### 修改3: SecurityConfig

调整过滤器顺序，让WechatJwtAuthenticationFilter优先执行：

```java
// 添加微信小程序 JWT filter（优先处理小程序请求）
.addFilterBefore(wechatJwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
// 添加JWT filter（处理管理后台请求）
.addFilterBefore(authenticationTokenFilter, UsernamePasswordAuthenticationFilter.class)
```

### 修改4: PartnershipController

恢复使用标准的JWT认证方式：

```java
@PostMapping("/generate-invite")
public AjaxResult generateInvite()
{
    Long userId = getUserId();  // 从Security上下文获取
    // ...
}
```

## 修改的文件

### 后端

1. **WechatJwtAuthenticationFilter.java**
   - 路径: `RuoYi-Vue/ruoyi-framework/src/main/java/com/ruoyi/framework/security/filter/WechatJwtAuthenticationFilter.java`
   - 修改: 
     - 添加路径检查，只处理`/api/**`
     - 添加`HashSet` import，修复类型错误
     - 设置Security上下文

2. **JwtAuthenticationTokenFilter.java**
   - 路径: `RuoYi-Vue/ruoyi-framework/src/main/java/com/ruoyi/framework/security/filter/JwtAuthenticationTokenFilter.java`
   - 修改: 添加路径检查，跳过`/api/**`

3. **SecurityConfig.java**
   - 路径: `RuoYi-Vue/ruoyi-framework/src/main/java/com/ruoyi/framework/config/SecurityConfig.java`
   - 修改: 调整过滤器顺序

4. **PartnershipController.java**
   - 路径: `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/controller/PartnershipController.java`
   - 修改: 移除临时的`@RequestParam userId`参数，恢复使用`getUserId()`方法

### 前端

5. **partnership/index.js**
   - 路径: `couple-fitness-weapp/pages/partnership/index.js`
   - 修改: 
     - `acceptRequest`: 使用路径参数 `/accept/{id}`
     - `rejectRequest`: 使用路径参数 `/reject/{id}`
     - `dissolvePartnership`: 使用`request.del()`

## JWT认证流程

### 小程序请求流程（/api/**）

```
小程序 -> POST /api/partnership/generate-invite
         Header: Authorization: Bearer {jwt_token}
         
1. WechatJwtAuthenticationFilter:
   - 检查路径: /api/partnership/generate-invite ✓
   - 提取token
   - 用jwt.secret验证token ✓
   - 从token获取userId
   - 创建LoginUser对象
   - 设置到Security上下文 ✓
   
2. JwtAuthenticationTokenFilter:
   - 检查路径: /api/partnership/generate-invite
   - 跳过处理（直接放行）✓
   
3. PartnershipController:
   - 调用getUserId()
   - SecurityUtils从上下文获取LoginUser ✓
   - 返回userId
   - 执行业务逻辑 ✓
```

### 管理后台请求流程（非/api/**）

```
管理后台 -> GET /system/user/list
           Header: Authorization: {admin_token}
           
1. WechatJwtAuthenticationFilter:
   - 检查路径: /system/user/list
   - 不是/api/**，跳过处理 ✓
   
2. JwtAuthenticationTokenFilter:
   - 检查路径: /system/user/list
   - 不是/api/**，继续处理 ✓
   - 用token.secret验证token
   - 从Redis获取LoginUser
   - 设置到Security上下文 ✓
   
3. Controller:
   - 正常处理请求 ✓
```

## 配置说明

### JWT配置（application.yml）

```yaml
# 管理后台token配置
token:
  header: Authorization
  secret: abcdefghijklmnopqrstuvwxyz
  expireTime: 30

# 小程序JWT配置
jwt:
  secret: your-secret-key-change-this-in-production-environment-for-security
  expiration: 604800000      # 7天
  refresh-expiration: 2592000000  # 30天
```

### Security配置

```java
.authorizeHttpRequests((requests) -> {
    // 小程序所有 API 放行（开发阶段）
    requests.antMatchers("/api/**").permitAll()
    // ...
})
// 添加微信小程序 JWT filter（优先处理小程序请求）
.addFilterBefore(wechatJwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
// 添加JWT filter（处理管理后台请求）
.addFilterBefore(authenticationTokenFilter, UsernamePasswordAuthenticationFilter.class)
```

## 测试步骤

1. **启动后端服务**
   ```bash
   cd RuoYi-Vue/ruoyi-admin
   mvn spring-boot:run
   ```

2. **测试小程序登录**
   - 打开微信开发者工具
   - 进入登录页面
   - 使用测试账号登录
   - 检查Storage中是否保存了token

3. **测试配对功能**
   - 进入配对页面
   - 点击"生成邀请码"
   - 检查Network请求：
     - 请求URL: `/api/partnership/generate-invite`
     - 请求Header: `Authorization: Bearer {token}`
     - 响应状态: 200
     - 响应数据: 包含邀请码

4. **检查日志**
   - 应该只看到：`Set authentication for user: {userId}`
   - 不应该再看到：`JWT signature does not match`错误

## 验证成功标志

✅ 小程序登录成功，获取token  
✅ 配对页面可以生成邀请码  
✅ 后端日志没有JWT签名错误  
✅ 所有配对API正常工作  
✅ 管理后台登录不受影响  

## 注意事项

1. **路径隔离**
   - 小程序API必须以`/api/`开头
   - 管理后台API不能以`/api/`开头
   - 两套系统完全隔离

2. **Token格式**
   - 小程序: `Authorization: Bearer {jwt_token}`
   - 管理后台: `Authorization: {admin_token}`（无Bearer前缀）

3. **密钥管理**
   - 两个系统使用不同的JWT密钥
   - 生产环境应该使用强密钥
   - 从环境变量或配置中心读取

4. **开发环境**
   - 当前`/api/**`路径完全放行
   - 生产环境建议根据需求调整权限

## 后续优化建议

1. **统一认证**
   - 考虑统一使用一套JWT系统
   - 通过claims区分用户类型

2. **权限控制**
   - 为小程序API添加细粒度权限
   - 实现基于角色的访问控制

3. **监控告警**
   - 记录认证失败日志
   - 监控异常token使用
   - 设置告警阈值

4. **安全增强**
   - 添加请求签名验证
   - 实现防重放攻击
   - 添加请求频率限制

