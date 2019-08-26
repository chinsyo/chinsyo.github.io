---
title: CTF入门——从编写简单KeygenMe开始
subtitle: CTF Tutorial, DeadSimple KeygenMe
date: 2019-08-17 12:00:00
tags:
  - CTF
  - 逆向
  - 安全
---

在前一篇文章《CTF入门——从攻破简单CrackMe开始》中介绍了如何通过填充nop编辑可执行文件的二进制内容绕过校验逻辑，本文会进一步介绍如何通过反汇编代码倒推出注册码生成逻辑，编写一个注册机程序。

注册码生成程序也称为 KeygenMe ，通常 CTF 比赛中相关题目爆破得分最低，获得一组注册码次之，注册机得分最高。

回顾查看符号表寻找切入点的步骤，细心的读者想必会有疑问，-[AppDelegate check:] 和 -[AppDelegate checkCode:forName:] 看起来都有可能是校验注册码，为什么我选择了从前者入手呢？

```bash
$ nm -arch i386 DeadSimple 
00001d13 t -[AppDelegate check:]
00001daa t -[AppDelegate checkCode:forName:]
00003020 S .objc_class_name_AppDelegate
         U .objc_class_name_NSObject
         U _NSApplicationMain
         U _NSBeep
         U _NSRunAlertPanelRelativeToWindow
...
```

逆向工程是一种产品设计技术再现过程，本例中用户和产品的交互是通过图形界面进行的。Objective-C 语言中冒号后跟着方法的参数，点击按钮这个交互在 macOS 平台通常通过 Action-Target 模式添加且参数只有一个触发交互的图形控件，由此猜测前者是按钮点击事件。


因此通过 -[AppDelegate checkCode:forName:] 入手同样有效，但是需要对反汇编的逻辑进行倒推，难度较之前会有提升，同时也是本篇的练习目标。

首先还原 check: 和 checkCode:forName: 两者的关系，我们不妨假设前者调用后者并采用后者的返回值决定正确提示或是蜂鸣报错。


对两个函数的开始和结束分别设置断点，结束断点的地址可以由反汇编获得。

```bash
$ lldb DeadSimple
(lldb) target create "DeadSimple"
Current executable set to 'DeadSimple' (i386).
(lldb) di -n "-[AppDelegate check:]"
DeadSimple`-[AppDelegate check:]:
DeadSimple[0x1d13] <+0>:   pushl  %ebp
...
DeadSimple[0x1da4] <+145>: leave  
DeadSimple[0x1da5] <+146>: jmp    0x4045                    ; symbol stub for: NSBeep
(lldb) di -n "-[AppDelegate checkCode:forName:]"
DeadSimple`-[AppDelegate checkCode:forName:]:
DeadSimple[0x1daa] <+0>:   pushl  %ebp
...
DeadSimple[0x1ea4] <+250>: leave  
DeadSimple[0x1ea5] <+251>: retl
```

得出check:的起始地址为0x1d13，返回地址为0x1da5。checkCode:forName的起始地址为0x1daa，返回地址为0x1ea5。对起始地址和返回地址分别加断点。

```bash
(lldb) br s -n "-[AppDelegate check:]"
Breakpoint 1: where = DeadSimple`-[AppDelegate check:], address = 0x00001d13
(lldb) br s -a 0x1da5
Breakpoint 2: address = 0x00001da5
(lldb) br s -n "-[AppDelegate checkCode:forName:]"
Breakpoint 3: where = DeadSimple`-[AppDelegate checkCode:forName:], address = 0x00001daa
(lldb) br s -a 0x1ea5
Breakpoint 4: address = 0x00001ea5
```

接下来运行程序查看断点触发的顺序，运行之前我们猜想的执行顺序如下图。

![](http://pwj4lonpu.bkt.clouddn.com/deadsimple-memory-graph.jpg)

```bash
Process 13850 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 1.1
    frame #0: 0x00001d13 DeadSimple`-[AppDelegate check:]
DeadSimple`-[AppDelegate check:]:
->  0x1d13 <+0>: pushl  %ebp
    0x1d14 <+1>: movl   %esp, %ebp
    0x1d16 <+3>: pushl  %esi
    0x1d17 <+4>: pushl  %ebx
Target 0: (DeadSimple) stopped.
(lldb) c
Process 13850 resuming
Process 13850 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 3.1
    frame #0: 0x00001daa DeadSimple`-[AppDelegate checkCode:forName:]
DeadSimple`-[AppDelegate checkCode:forName:]:
->  0x1daa <+0>: pushl  %ebp
    0x1dab <+1>: movl   %esp, %ebp
    0x1dad <+3>: subl   $0x28, %esp
    0x1db0 <+6>: movl   0x3008, %eax
Target 0: (DeadSimple) stopped.
(lldb) c
Process 13850 resuming
Process 13850 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 6.1
    frame #0: 0x00001ea5 DeadSimple`-[AppDelegate checkCode:forName:] + 251
DeadSimple`-[AppDelegate checkCode:forName:]:
->  0x1ea5 <+251>: retl   
    0x1ea6:        addb   %al, (%eax)
    0x1ea8:        addb   %al, (%eax)
    0x1eaa:        addb   %al, (%eax)
Target 0: (DeadSimple) stopped.
(lldb) c
Process 13850 resuming
Process 13850 stopped
* thread #1, queue = 'com.apple.main-thread', stop reason = breakpoint 5.1
    frame #0: 0x00001da5 DeadSimple`-[AppDelegate check:] + 146
DeadSimple`-[AppDelegate check:]:
->  0x1da5 <+146>: jmp    0x4045                    ; symbol stub for: NSBeep
DeadSimple`-[AppDelegate checkCode:forName:]:
    0x1daa <+0>:   pushl  %ebp
    0x1dab <+1>:   movl   %esp, %ebp
    0x1dad <+3>:   subl   $0x28, %esp
Target 0: (DeadSimple) stopped.
```

断点触发顺序和我们猜想的一致，分析校验逻辑需要熟悉汇编语言，这时祭出我们的神器 Hopper，站在巨人的肩膀上继续。

通常进行静态分析之前需要对应用脱壳，本例没有加壳所以可以直接分析。

![](http://pwj4lonpu.bkt.clouddn.com/deadsimple-hopper-hex.jpg)

拖入 Hopper 依次点击1、2后查看反汇编代码，和在 lldb 中执行 disassemble 结果基本一致，这时点击3可以查看生成的伪代码。

![](http://pwj4lonpu.bkt.clouddn.com/deadsimple-hopper-psedo.jpg)

生成的伪代码已经非常接近真实代码的流程，根据上下文可以推断出返回类型是 BOOL，arg2 和 arg3 应该是 NSString 类型。



cvtsi2sd是将DWORD(4字节)整型数转换为浮点型数，cvttsd2si则反之，sqrtsd是开方运算。前往 https://www.felixcloutier.com/x86/ 查看指令详情。



对照伪代码写出Objective-C的代码，得出结论注册码有以下几个要求:

* 注册码应该为使用连字符连接的两个数字
* 连字符的后半部分数字应该为前半部分数字的平方
* 连字符的前半部分数字应该为 name 字符串 ascii 编码的数值之和

```objc
- (BOOL)checkCode:(NSString *)code forName:(NSString *)name {
    NSArray *comps = [code componentsSeparatedByString:@"-"];
    if (comps.count == 2) {
        int headValue = [[comps objectAtIndex:0] intValue];
        NSString *tailString = [comps objectAtIndex:1];
        int tailValue = [tailString intValue];
        if (sqrtf((float)tailValue) == (float)headValue) {
            int i = 0;
            while (i < tailString.length) {
                i += 1;
                headValue -= ([name characterAtIndex:i] & 0xffff);
            }
        } else {
            return false;
        }
    }
    return false;
}
```

对照着校验逻辑，不难编写出注册码生成程序。

```python
#! /usr/bin/env python3
from sys import argv
from functools import reduce
def strsum(name):
    nums = [ord(c) for c in list(name)]
    return reduce(lambda x,y: x+y, nums)
if __name__ == '__main__':
    assert len(argv) > 1, "用户名不能为空"
    name = argv[1]
    v1 = strsum(name)
    print("{}: {}-{}".format(name, v1, v1*v1))
```

运行我们的注册码生成程序，复制控制台输出。

```bash
$ python3 deadsimple-keygen.py "chenxiao"
chenxiao: 847-717409
```

将控制台的输出填入输入框，点击 Check 校验。

![](http://pwj4lonpu.bkt.clouddn.com/deadsimple-ui-input.jpg)

显示正确，撒花！🎉

![](http://pwj4lonpu.bkt.clouddn.com/imgdeadsimple-ui-success.jpg)


以上分析的流程同样适用于现实中的软件激活，不过切记遵守法律法规。最后附一张安全专家tk教主的某乎答案自我惕励。

![](http://pwj4lonpu.bkt.clouddn.com/deadsimple-tk.jpg)