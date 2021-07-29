---
title: 宏定义的黑魔法，C语言模拟命名参数
subtitle: Macro Magic - Named Parameter
date: 2020-10-23 12:00:00
tags:
  - C
  - 宏定义
  - 开发
  - 技巧
---

今天翻阅代码时偶然看到函数调用传入命名参数，初看以为是C语言新标准的某个语法，探究了一下源码。PoC代码如下:

![](https://cdn.chinsyo.com/img/macro-magic-named-parameter/01.png)

代码很简单无需展开探讨，主要思路为通过宏定义将命名参数构造为预先定义好的结构体，留意几个细节即可。

1. 模拟实现的命名参数支持默认参数，这是由C语言结构体自身语法支持的
2. 定义和已知函数同名的宏定义会发生覆盖，因此宏定义要放在函数声明之后
3. 为了支持多文件共同参与编译的开发场景，因此要在函数声明前撤销宏定义

Readability is reliability, 可读性即可靠性。C语言作为上古遗物，简洁但完备的语法，兼顾了开发效率和运行效率，同时和操作系统结合紧密，时至今日仍然焕发着蓬勃的生机。