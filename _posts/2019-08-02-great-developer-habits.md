---
title: "[翻译] WWDC19 Session 239 - 开发良策"
subtitle: Great Developer Habits
date: 2019-08-02 12:00:00
tags:
  - 苹果
  - iOS
  - 翻译
---

尝试翻译了 WWDC19 的 Session 239: Great Developer Habits。[视频链接](https://developer.apple.com/videos/play/wwdc2019/239/)

### 组织项目

![](http://pwj4lonpu.bkt.clouddn.com/239_great_developer_habits_organize.jpg)

- 项目内容按功能分组
- 项目布局与文件一致
- 拆解复杂Storyboard
- 保持项目的持续更新
- 丢掉废弃的注释代码
- 定位警告的根本原因

### 版本管理

![](http://pwj4lonpu.bkt.clouddn.com/239_great_developer_habits_track.jpg)

- 务必要使用版本管理
- 保持提交内容的精巧
- 书写有效的提交信息
- 善用缺陷和特性分支

### 文档注释

![](http://pwj4lonpu.bkt.clouddn.com/239_great_developer_habits_document.jpg)

- 注释攸关未来还能否理解
- 好的注释提供背景和意图
- 使用具有描述性的变量名
- 包含文档

### 单元测试

![](http://pwj4lonpu.bkt.clouddn.com/239_great_developer_habits_unittests.jpg)

- 务必要书写单元测试
- 每次提交前运行测试
- 构建持续集成的基础

### 动态分析

![](http://pwj4lonpu.bkt.clouddn.com/239_great_developer_habits_analyze.jpg)

- 使用 Network Link Conditioner 模拟弱网环境
- 使用 Sanitizer 和 Checker 防范常见问题
- 使用 Debug Gauges 衡量软件表现和能耗
- 使用 Instruments 定位问题根源

### 代码评审

![](http://pwj4lonpu.bkt.clouddn.com/239_great_developer_habits_evaluate.jpg)

- 将代码评审引入实践
- 理解每行代码
- 运行代码，检查运行结果
- 检查单元测试用例并运行
- 校对风格、拼写和语法

### 代码解耦

![](http://pwj4lonpu.bkt.clouddn.com/239_great_developer_habits_decouple.jpg)

- 按功能分割代码
- 在不同应用间复用代码
- Extension 使用 Framework 减小体积
- 和社区分享你的代码成果
- 文档性命攸关，务必为 Framework 写好文档

### 依赖管理

![](http://pwj4lonpu.bkt.clouddn.com/239_great_developer_habits_manage.jpg)

- 审慎的使用开源项目作为依赖
- 透彻的理解所依赖的开源项目
- 确保依赖中用户隐私得到尊重
- 规划依赖不再维护的预备方案