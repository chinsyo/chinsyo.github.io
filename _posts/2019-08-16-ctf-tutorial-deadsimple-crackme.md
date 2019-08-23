---
title: CTF入门——从攻破简单CrackMe开始
subtitle: CTF Tutorial, DeadSimple CrackMe
date: 2019-08-16 12:00:00
tags:
  - CTF
  - 逆向
  - 安全
---

也许你还不知道什么是CTF和RE(Reverse Engineer 逆向工程)，但你可能已经被韩商言和李现刷屏了几个轮回，最近人气和口碑双丰收的电视剧《亲爱的 热爱的》对CTF这个安全领域的概念做了全民科普。

某天我家那位不知防火墙是何物的人民教师和我闲聊时问起CTF，作为网安公司的研发工程师既诧异又欣慰，诧异的是CTF早于信息安全本身走近大众，欣慰的是在格子衫和秃头怪的调侃声中，电视剧居然率先为这个行业正名。

CTF(Capture The Flag 夺旗赛)是信息安全技术竞赛的一种形式，而逆向工程是信息安全技术的一个范畴，国内知名安全论坛看雪主办的KCTF就是由CrackMe攻防大赛发展而来。

CrackMe是一类供人尝试破解的程序，攻击者和发布者就软件保护和破解展开较量，通常以输入通过软件校验注册码为目标。

由于本职工作iOS研发工程师的缘故，本次示例以macOS系统为例。首先我们需要找到攻破的目标即CrackMe程序，访问 https://reverse.put.as/crackmes/ 找到页面最下方的DeadSimple进行下载，从未知来源下载软件要记得校验摘要和查杀病毒，下面是DeadSimple的摘要信息和查杀结果。

![](http://pwj4lonpu.bkt.clouddn.com/imgdeadsimple-virscan.jpg)

（吐槽一下腾讯，原本打算选择腾讯哈勃的扫描结果，可我一个macOS程序居然给我扫出C盘路径和写入注册表……拜拜了您呐。）

先双击运行程序看看效果，不出意外会弹出两个弹窗，分别如图。

![](http://pwj4lonpu.bkt.clouddn.com/imgdeadsimple-developer-warning.jpg)

首先提示不是通过AppStore下载，并且没有经过开发者证书签名。

![](http://pwj4lonpu.bkt.clouddn.com/imgdeadsimple-update-warning.jpg)

接着提示尚未针对您的Mac优化，这是因为CrackMe程序不包含当前x86_64的架构。

前往 系统偏好设置->安全与隐私 允许安装，如下图，点击「仍要打开」。如果你的页面没有「允许从以下位置下载的应用」或运行时提醒「文件已损坏」，请参考 https://baijiahao.baidu.com/s?id=1594877309704492558&wfr=spider&for=pc 进行设置。

![](http://pwj4lonpu.bkt.clouddn.com/imgdeadsimple-setting.jpg)

启动后界面包含Name和Code两个输入框，和常见的激活界面相似。

![](http://pwj4lonpu.bkt.clouddn.com/imgdeadsimple-ui-empty.jpg)

这时随便输入一些信息，如123，123。校验失败会听到错误提示音。

让我们开动起来尝试攻破第一个CrackMe，首先切换到可执行文件的工作路径，以桌面为例，路径为 ~/Desktop/DeadSimple.app/Contents/MacOS ，查看符号表寻找切入点。

```bash
$ file DeadSimple
DeadSimple: Mach-O universal binary with 2 architectures: [i386:Mach-O executable i386] [ppc:Mach-O executable ppc]
DeadSimple (for architecture i386):  Mach-O executable i386
DeadSimple (for architecture ppc):  Mach-O executable ppc
$ uname -m
x86_64
```

当前系统架构x86_64，而可执行文件架构为i386和ppc，可见这个CrackMe年久失修，ppc是苹果在采用intel处理器之前使用的IBM PowerPC架构，所以软件是以i386兼容模式运行的。

```bash
$ nm -arch i386 DeadSimple 
00001d13 t -[AppDelegate check:]
00001daa t -[AppDelegate checkCode:forName:]
00003020 S .objc_class_name_AppDelegate
         U .objc_class_name_NSObject
         U _NSApplicationMain
         U _NSBeep
         U _NSRunAlertPanelRelativeToWindow
0000200c D _NXArgc
00002008 D _NXArgv
         U ___CFConstantStringClassReference
         U ___keymgr_dwarf2_register_sections
00002000 D ___progname
         U __cthread_init_routine
00001d04 t __dyld_func_lookup
00001000 A __mh_execute_header
00001c16 t __start
         U _atexit
00002058 S _catch_exception_raise
0000205c S _catch_exception_raise_state
00002060 S _catch_exception_raise_state_identity
00002064 S _clock_alarm_reply
00002068 S _do_mach_notify_dead_name
0000206c S _do_mach_notify_no_senders
00002070 S _do_mach_notify_port_deleted
00002074 S _do_mach_notify_send_once
00002078 S _do_seqnos_mach_notify_dead_name
0000207c S _do_seqnos_mach_notify_no_senders
00002080 S _do_seqnos_mach_notify_port_deleted
00002084 S _do_seqnos_mach_notify_send_once
00002004 D _environ
         U _errno
         U _exit
         U _mach_init_routine
00001d0a t _main
         U _objc_msgSend
00002088 S _receive_samples
00001cf8 t dyld_stub_binding_helper
00001bec T start
```

macOS 平台编程语言 Objective-C 使用中括号表示方法，中括号前+表示类方法，-表示实例方法。看样子 -[AppDelegate check:] 就是我们要找的入手点，lldb挂载调试。

```bash
$ lldb DeadSimple 
(lldb) target create "DeadSimple"
Current executable set to 'DeadSimple' (i386).
(lldb)
```

根据前一步推理，查看对应的反汇编代码。

```bash
(lldb) di -n "-[AppDelegate check:]"
DeadSimple`-[AppDelegate check:]:
DeadSimple[0x1d13] <+0>:   pushl  %ebp
DeadSimple[0x1d14] <+1>:   movl   %esp, %ebp
DeadSimple[0x1d16] <+3>:   pushl  %esi
DeadSimple[0x1d17] <+4>:   pushl  %ebx
DeadSimple[0x1d18] <+5>:   subl   $0x20, %esp
DeadSimple[0x1d1b] <+8>:   movl   0x8(%ebp), %esi
DeadSimple[0x1d1e] <+11>:  movl   0x3000, %eax
DeadSimple[0x1d23] <+16>:  movl   0x8(%esi), %edx
DeadSimple[0x1d26] <+19>:  movl   %eax, 0x4(%esp)
DeadSimple[0x1d2a] <+23>:  movl   %edx, (%esp)
DeadSimple[0x1d2d] <+26>:  calll  0x405e                    ; symbol stub for: objc_msgSend
DeadSimple[0x1d32] <+31>:  movl   0xc(%esi), %edx
DeadSimple[0x1d35] <+34>:  movl   %eax, %ebx
DeadSimple[0x1d37] <+36>:  movl   0x3000, %eax
DeadSimple[0x1d3c] <+41>:  movl   %edx, (%esp)
DeadSimple[0x1d3f] <+44>:  movl   %eax, 0x4(%esp)
DeadSimple[0x1d43] <+48>:  calll  0x405e                    ; symbol stub for: objc_msgSend
DeadSimple[0x1d48] <+53>:  movl   %ebx, 0xc(%esp)
DeadSimple[0x1d4c] <+57>:  movl   %eax, 0x8(%esp)
DeadSimple[0x1d50] <+61>:  movl   0x3004, %eax
DeadSimple[0x1d55] <+66>:  movl   %esi, (%esp)
DeadSimple[0x1d58] <+69>:  movl   %eax, 0x4(%esp)
DeadSimple[0x1d5c] <+73>:  calll  0x405e                    ; symbol stub for: objc_msgSend
DeadSimple[0x1d61] <+78>:  testb  %al, %al
DeadSimple[0x1d63] <+80>:  je     0x1d9f                    ; <+140>
DeadSimple[0x1d65] <+82>:  movl   0x4(%esi), %eax
DeadSimple[0x1d68] <+85>:  movl   $0x0, 0x10(%esp)
DeadSimple[0x1d70] <+93>:  movl   $0x0, 0xc(%esp)
DeadSimple[0x1d78] <+101>: movl   $0x2018, 0x8(%esp)        ; imm = 0x2018 
DeadSimple[0x1d80] <+109>: movl   %eax, 0x14(%esp)
DeadSimple[0x1d84] <+113>: movl   $0x2028, 0x4(%esp)        ; imm = 0x2028 
DeadSimple[0x1d8c] <+121>: movl   $0x2038, (%esp)           ; imm = 0x2038 
DeadSimple[0x1d93] <+128>: calll  0x404a                    ; symbol stub for: NSRunAlertPanelRelativeToWindow
DeadSimple[0x1d98] <+133>: addl   $0x20, %esp
DeadSimple[0x1d9b] <+136>: popl   %ebx
DeadSimple[0x1d9c] <+137>: popl   %esi
DeadSimple[0x1d9d] <+138>: leave  
DeadSimple[0x1d9e] <+139>: retl   
DeadSimple[0x1d9f] <+140>: addl   $0x20, %esp
DeadSimple[0x1da2] <+143>: popl   %ebx
DeadSimple[0x1da3] <+144>: popl   %esi
DeadSimple[0x1da4] <+145>: leave  
DeadSimple[0x1da5] <+146>: jmp    0x4045                    ; symbol stub for: NSBeep
(lldb)
```

输出的信息很长，鉴于可能不是每位读者都十分熟悉汇编语言，这里做简要的补充。retl表示返回，movl表示赋值，je(jump equal)表示当前一条指令的对比结果相同时跳转到指定地址继续执行，否则按顺序向下继续执行。

所以，简要的了解这段汇编的执行顺序后，发现这段汇编程序只有一个分支判断。

```bash
DeadSimple[0x1d63] <+80>:  je     0x1d9f      
```

再观察分支的执行情况，不难看出0x1d9f地址执行的是恢复栈底并蜂鸣报错。

所以，绕过这个检查的方式之一就是跳过0x1d63的判断逻辑。在汇编语言中，nop指令表示no operation即不做操作，opcode为0x90。je 0x1d63的下一条指令地址为0x1d65，0x1d65-0x1d63=2，所以我们接下来要做的就是对0x1d63开始的2个字节填充0x90。

使用vi以二进制方式打开可执行文件。

```bash
$ vi -b DeadSimple
```

![](http://pwj4lonpu.bkt.clouddn.com/imgdeadsimple-vi-text.jpg)

放眼望去满是^和@组成的符号，这是因为二进制文件不是有效的ascii可视字符，在vi输入:%!xxd 进入hex编辑模式，这下顺眼多了。

![](http://pwj4lonpu.bkt.clouddn.com/imgdeadsimple-vi-hex.jpg)

在vi中移动光标到0x1d63对应的地址（搜索1d60，然后向后数3字节即6个hex字符），将 74 3a 修改为 90 90。输入:%xxd -r 退出hex模式并保存文件。

这时再次运行软件，随便输入内容，可以看到成功提示弹窗。

![](http://pwj4lonpu.bkt.clouddn.com/imgdeadsimple-ui-success.jpg)

友情提示，修改完毕二进制后可以重新查看反汇编检验修改的结果再运行程序，由于篇幅不再展开。下一篇将围绕如何倒推校验逻辑，编写一个注册码生成程序。