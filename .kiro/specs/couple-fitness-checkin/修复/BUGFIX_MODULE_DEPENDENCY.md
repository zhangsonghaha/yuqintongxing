# Bugfix: 模块依赖问题 - 将小程序认证移到框架

## 问题
编译错误：`程序包com.ruoyi.web.security不存在`

根本原因：
- `ruoyi-framework` 模块无法访问 `ruoyi-admin` 模块中的类
- `ruoyi-framework` 和 `ruoyi-admin` 是独立的模块，`ruoyi-framework` 不依赖 `ruoyi-admin`
- 在 `SecurityConfig`（框架中）中导入 `com.ruoyi.web.security.JwtAuthenticationFilter` 导致编译失败

## 解决方案

### 1. 将小程序认证类移到框架中

#### 创建 JwtTokenProvider 在框架中
**文件**: `RuoYi-Vue/ruoyi-framework/src/main/java/com/ruoyi/framework/security/JwtTokenProvider.java`

- 完整复制原始实现
- 用于生成和验证小程序 JWT 令牌
- 支持 7 天过期时间和 30 天刷新令牌

#### 创建 WechatJwtAuthenticationFilter 在框架中
**文件**: `RuoYi-Vue/ruoyi-framework/src/main/java/com/ruoyi/framework/security/filter/WechatJwtAuthenticationFilter.java`

- 完整复制原始实现，重命名为 `WechatJwtAuthenticationFilter`
- 处理小程序的 JWT 令牌验证
- 从 Authorization header 中提取令牌

### 2. 更新框架的 SecurityConfig

#### 更新导入
```java
import com.ruoyi.framework.security.filter.WechatJwtAuthenticationFilter;
```

#### 注入小程序过滤器
```java
@Autowired
private WechatJwtAuthenticationFilter wechatJwtAuthenticationFilter;
```

#### 在过滤器链中添加
```java
.addFilterBefore(wechatJwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
```

### 3. 更新 ruoyi-admin 中的导入

#### AuthServiceImpl
```java
// 从
import com.ruoyi.web.security.JwtTokenProvider;

// 改为
import com.ruoyi.framework.security.JwtTokenProvider;
```

### 4. 删除旧文件

删除了以下文件（已移到框架中）：
- `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/security/JwtTokenProvider.java`
- `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/security/JwtAuthenticationFilter.java`

## 修改的文件

1. **创建**:
   - `RuoYi-Vue/ruoyi-framework/src/main/java/com/ruoyi/framework/security/JwtTokenProvider.java`
   - `RuoYi-Vue/ruoyi-framework/src/main/java/com/ruoyi/framework/security/filter/WechatJwtAuthenticationFilter.java`

2. **修改**:
   - `RuoYi-Vue/ruoyi-framework/src/main/java/com/ruoyi/framework/config/SecurityConfig.java`
   - `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/service/impl/AuthServiceImpl.java`

3. **删除**:
   - `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/security/JwtTokenProvider.java`
   - `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/security/JwtAuthenticationFilter.java`

## 验证步骤

1. **清除 Maven 缓存**:
   ```bash
   cd RuoYi-Vue
   mvn clean
   ```

2. **重新编译**:
   ```bash
   mvn compile
   ```

3. **启动应用**:
   ```bash
   mvn spring-boot:run
   ```

## 预期结果
✅ 编译成功，没有模块依赖错误
✅ 小程序认证 API 可以正常工作
✅ 框架和 admin 模块都能访问小程序认证类

## 架构改进

**之前**:
```
ruoyi-admin (包含小程序认证)
  ├── JwtTokenProvider
  ├── JwtAuthenticationFilter
  └── AuthService

ruoyi-framework (无法访问 ruoyi-admin)
  └── SecurityConfig (导入失败)
```

**之后**:
```
ruoyi-framework (包含小程序认证)
  ├── JwtTokenProvider
  ├── WechatJwtAuthenticationFilter
  └── SecurityConfig (可以访问)

ruoyi-admin (使用框架中的认证)
  ├── AuthService (导入框架中的 JwtTokenProvider)
  └── AuthController
```

## 状态
✅ **FIXED** - 模块依赖问题已解决，小程序认证类已移到框架中
