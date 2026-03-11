# Bugfix: Spring Security Bean 冲突

## 问题
启动应用时出现 Bean 冲突错误：
```
ConflictingBeanDefinitionException: Annotation-specified bean name 'securityConfig' 
for bean class [com.ruoyi.framework.config.SecurityConfig] conflicts with existing, 
non-compatible bean definition of same name and class [com.ruoyi.web.config.SecurityConfig]
```

## 根本原因
- RuoYi 框架中已经存在 `com.ruoyi.framework.config.SecurityConfig`
- 我们在 `com.ruoyi.web.config.SecurityConfig` 中创建了另一个同名的配置类
- Spring 无法决定使用哪一个，导致冲突

## 解决方案

### 1. 删除冲突的配置类
删除了 `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/config/SecurityConfig.java`

### 2. 修改框架的 SecurityConfig
在 `RuoYi-Vue/ruoyi-framework/src/main/java/com/ruoyi/framework/config/SecurityConfig.java` 中：

#### 添加导入
```java
import com.ruoyi.web.security.JwtAuthenticationFilter;
```

#### 注入小程序 JWT 过滤器
```java
/**
 * 小程序 JWT 认证过滤器
 */
@Autowired
private JwtAuthenticationFilter jwtAuthenticationFilter;
```

#### 添加小程序 API 放行规则
在 `authorizeHttpRequests` 中添加：
```java
// 小程序认证相关 API
.antMatchers(HttpMethod.POST, "/api/auth/wechat-login").permitAll()
.antMatchers(HttpMethod.POST, "/api/auth/refresh-token").permitAll()
```

#### 在过滤器链中添加小程序 JWT 过滤器
```java
// 添加小程序 JWT filter
.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
```

## 修改的文件
1. **删除**: `RuoYi-Vue/ruoyi-admin/src/main/java/com/ruoyi/web/config/SecurityConfig.java`
2. **修改**: `RuoYi-Vue/ruoyi-framework/src/main/java/com/ruoyi/framework/config/SecurityConfig.java`

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
✅ 应用启动成功，没有 Bean 冲突错误
✅ 小程序认证 API (`/api/auth/wechat-login`, `/api/auth/refresh-token`) 可以匿名访问
✅ 其他 API 需要有效的 JWT 令牌

## 架构说明
- **RuoYi 框架 SecurityConfig**: 管理整个应用的安全配置
- **小程序 JwtAuthenticationFilter**: 处理小程序的 JWT 令牌验证
- **框架 JwtAuthenticationTokenFilter**: 处理后台管理系统的令牌验证
- 两个过滤器可以共存，分别处理不同的认证方式

## 状态
✅ **FIXED** - Bean 冲突已解决，小程序认证集成到框架中
