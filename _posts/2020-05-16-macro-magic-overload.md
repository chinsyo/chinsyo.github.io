---
title: 宏定义的黑魔法，C语言模拟函数重载
subtitle: Macro Magic - Overload
date: 2020-05-06 12:00:00
tags:
  - C
  - 宏定义
  - 开发
  - 技巧
---

重载（Overload）是编程语言中具有的一项特性，这项特性允许创建数项名称相同但输入类型或个数不同的子程序（少数语言支持的重载函数返回类型不在本文讨论范围）。此特性很容易和面向对象编程中重写（Override）混淆，理解相关概念时需要有所区分。

不难理解，对于以下两种形式的重载，C语言源文件无法通过编译。

1）名称相同，但参数个数不同

```c
int function(int arg1);
int function(int arg1, int arg2);
```

2）名称相同，但参数类型不同

```c
int function(int arg1);
int function(char arg1);
```

第一种情况可以用于模拟高级编程语言的默认参数，是本文讨论的重点。宏定义的展开和替换作用于预编译阶段，可以对常量、类型、代码块以及函数名设置别名。

既然函数名不可以相同，那么有没有可能通过以下方式模拟重载呢？

```c
int function1(int arg1);
int function2(int arg1, int arg2);
#define FUNCTION function1
#define FUNCTION function2
```

显然这样的方式并不奏效，重复的宏定义会覆盖先前的内容。经过一番搜索查阅到以下方式并验证有效。

```c
#define GET_MACRO(_1,_2,_3,NAME,...) NAME
#define FOO(...) GET_MACRO(__VA_ARGS__, FOO3, FOO2, FOO1)(__VA_ARGS__)
int FOO1(int arg1) {
  return arg1;
}
int FOO2(int arg1, int arg2) {
  return arg1 + arg2;
}
int FOO3(int arg1, int arg2, int arg3) {
  return arg1 + arg2 + arg3;
}
```

GCC编译器可以通过-E参数单独进行预编译检查效果，如下。

```bash
FOO(1) => FOO1(1) => 1
FOO(1,2) => FOO2(1,2) => 3
FOO(1,2,3) => FOO3(1,2,3) => 6
```

以三个入参数为例，FOO(1,2,3)首先会替换为GET_MACRO(1,2,3,FOO3,FOO2,FOO1)(1,2,3)。紧接着GET_MACRO(1,2,3,FOO3,FOO2,FOO1)会替换为第3个(从0数起)参数，即FOO3。

FOO的宏定义中，__VA_ARGS__为空时参数会以逗号开始，在C语言中不是有效的语法，因此该方案模拟的重载不支持0个参数的情况。对于GCC编译器，stackoverflow高赞答案有利用##__VA_ARGS__这一拓展语法的适配方式，感兴趣的朋友可以前往查看。

以上虽然模拟了重载参数个数的效果，但存在多处硬编码显然不够优雅，因此很快有人基于google讨论组的方式实现了通用版本。

![](https://cdn.chinsyo.com/img/macro-magic-overload/01.png)

通过__NARG__(__VA_ARGS__)获取参数个数N，然后通过##这一特殊的宏定义和FUNC拼接得到FUNCN作为函数名。以FOO为例，该方案只需要以下一行代码即实现了对FOO传入1~63个参数时会自动关联到FOO1~FOO63。

63个参数限制，我猜测和平台寄存器个数相关，此处可以为不受限制，尽管函数命名都以数字结尾同样丧失了一定的灵活性，我们可以安慰自己「约定优于配置」嘛。😅

如果你的开发环境采用C99及以上标准，也可以通过以下方式实现，核心思想类似。

```c
#include <stdio.h>
#include <order/interpreter.h>

void oneArg(int a) {
    printf("one arg: %d\n", a);
}

void twoArgs(int a, int b) {
    printf("two args: %d %d\n", a, b);
}

void threeArgs(int a, int b, int c) {
    printf("three args: %d %d %d\n", a, b, c);
}

#define ORDER_PP_DEF_8function_list  \
ORDER_PP_CONST(("unused")            \
               (oneArg)              \
               (twoArgs)             \
               (threeArgs))

#define SelectFunction(...) ORDER_PP (                                 \
    8seq_at(8tuple_size(8((__VA_ARGS__))), 8function_list)  \
)

#define Overloaded(...) SelectFunction(__VA_ARGS__)(__VA_ARGS__)

int main(void) {
    Overloaded(42);
    Overloaded(42, 47);
    Overloaded(42, 47, 64);
    return 0;
}
```

C11及以上标准（GCC 4.9起）添加了额外关键字_Generic，可以借助其实现对参数类型的重载，目前我没有相关需求故不再展开介绍。方案如下：

```c
foo_int (int a)  
foo_char (char b)  
foo_float_int (float c , int d)

#define foo(_1, ...) _Generic((_1),                                 \
                            int: foo_int,                           \
                            char: foo_char,                         \
                            float: _Generic((FIRST(__VA_ARGS__,)),  \
                            int: foo_float_int))(_1, __VA_ARGS__)
#define FIRST(A, ...) A
```

第一种方案对参数个数的重载巧妙借助了宏定义的灵活性，通过预编译期替换文本的方式实现了高级编程语言的特性，不得不感叹巧夺天工。

如果你想深入了解这些内容，不妨点击以下参考阅读进行深入学习。

参考阅读：

[1] https://stackoverflow.com/questions/11761703/overloading-macro-on-number-of-arguments

[2] https://stackoverflow.com/questions/479207/how-to-achieve-function-overloading-in-c

[3] https://stackoverflow.com/questions/22505633/static-if-in-c99s-preprocessor/22624852#22624852

[4] https://gustedt.wordpress.com/2010/06/03/default-arguments-for-c99/