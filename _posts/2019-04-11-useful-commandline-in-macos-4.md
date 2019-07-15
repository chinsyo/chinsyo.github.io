---
title: macOS 好用的命令行(4)
subtitle: Useful commandline in macOS 4
date: 2019-04-11 12:00:00
tags:
  - 命令行
  - macOS
  - 开源
---

在前文中，我补充了一些按功能分类的命令，并介绍了更新 Shell 配置，文件描述符及重定向的知识，组合命令的注意事项，以及综合运用前三篇内容实现查询系统 DNS 设置的命令行程序。在阅读本篇文章之前可以访问以下链接回顾：

Mac OSX 下好用的命令行(1)

Mac OSX 下好用的命令行(2)

Mac OSX 下好用的命令行(3)

文章发出后收到了一些反馈，这里摘录出来作为参考。

本文是 Mac OSX 命令行系列近期更新的最后一篇，后续会对这一系列文章中涉及的命令按照使用频率和场景重新整理，并按照从入门到进阶的步骤介绍，以便给入门的读者一份完整的学习路线，对于有一定经验的命令行使用者，也能更方便的定位到自己感兴趣的内容。

本篇将补充一些本系列文章前作遗漏的相关命令和 Mac OSX 的几个独有命令。

一、补充的命令

(1)使用 alias 设置命令别名后可以通过 unalias 删除别名。

(2)使用 mkdir 创建目录后，除了通过 rm -r 递归删除外，还可以通过 rmdir 删除目录，rmdir 是 Remove Directory 的缩写。

(3)Mac OSX 内置了多个 Shell, 通过 cat /etc/shells 可以查看当前可以使用的 Shell。

```bash
cat /etc/shells
# /bin/bash
# /bin/csh
# /bin/ksh
# /bin/sh
# /bin/tcsh
# /bin/zsh
```

有三种方式显示当前正在使用的 Shell：

```bash
# 打印全局 SHELL 变量
echo $SHELL
env | grep SHELL 
# $0 表示正在运行的程序, 在 Shell 中执行即为当前使用的 Shell
echo $0
```

如果要修改当前使用的 Shell，则可以通过以下命令：

```bash
chsh -s /bin/csh
```

(4)Shell 支持类似 SQL 语句中的 join 查询，效果如下：

```bash
cat FILE1
# 1 yi
# 2 er
# 3 san
cat FILE2
# 1 one
# 2 two
# 3 three
join FILE1 FILE2
# 1 yi one
# 2 er two
# 3 san three
```

(5)在运行某些服务时，偶尔会遇到端口已经占用。我们可以通过 lsof 命令查看占用的端口，lsof 是 List Open Files 的缩写，由于 Unix 哲学中一切皆文件，故而占用的端口即占用的文件，以常见的 80 端口为例：

```bash
sudo lsof -i :80
```

(6)当我们需要在远程和本地之间同步文件时，可以通过 rsync 命令实现，rsync 是 Remote Sync 的缩写。这个命令可以很好的应用于同步配置或导出日志等场景：

```bash
rsync linode:/home/server.log ~/Desktop/server.log
```

二、独有的命令

这里的独有是指 Mac OSX 无需额外安装，而 Linux 在没有额外安装时不具有的命令。是我通过 macOS 10.14 和 Ubuntu 16.04 对比的结果，其他系统或版本可能有所差异。

Mac OSX 许多独有的命令主要功能为系统运维或软件开发，这里尽可能的挑选方便日常使用的命令，开发运维后续会抽空撰写专门的文章介绍。

(1)让 Mac 说话
```bash
# 基础用法
say "Hello World"
# 指定嗓音, 朗读文本文件内容并输出到音频文件 
say -v Alex -f file.txt -o "output.m4a"
# 组合其他命令使用, 清除 DNS 缓存, 完成后语音提示
sudo killall -HUP mDNSResponder; say "DNS cache flushed."
```

(2)生成截图

可以通过 -T 设置以秒为单位的延迟，-t 指定输出的格式，-P 通过预览应用打开，默认截图保存在桌面。

可以通过 -i 命令表示手动选择截图范围，按 Esc 退出，截图时按下空格键则选取窗口而非具体区域，按下 control 键则截图内容将复制到剪贴板。
```bash
screencapture -T 3 -t jpg -P screenshot.jpg
screencapture -i screenshot.png
```

(3)生成唯一标识符
```bash
uuidgen 
# 8AB208A3-E858-4A8B-8845-4ECD05A6CA6D
```

(4)管理密码和密钥
```bash
# 修改 Wi-Fi 的密码
security find-generic-password -D "AirPort network password" -a "SSID" -gw
# 查找可用的代码签名的证书
security find-identity -v -p codesigning
```

(5)压缩和解压缩

由于大部分人初次接触的电脑操作系统都是 Windows，加之 WinRar 的普及，造成发送给 Mac OSX 的 rar 格式文件需要额外安装解压软件才能打开，这里介绍几个关于压缩和解压缩的命令，建议大家采用 zip 这个跨平台的开源格式。

```bash
# 压缩文件
zip -r foo.zip foo
# 解压文件
unzip foo.zip 
# 查找当前目录下的 C 语言的头文件和源文件, 并压缩
find . -name "*.[ch]" -print | zip source -@
```

在 Linux 下也常用 tar 命令打包文件，Unix 系统不以后缀名区分文件格式，注明格式方便下载者区分。

```bash
# 只打包不压缩
tar -cvf log.tar server.log
# 打包后，以 gzip 压缩 
tar -zcvf log.tar.gz server.log
# 打包后，以 bzip2 压缩 
tar -jcvf log.tar.bz2 server.log
# 查阅压缩包内有哪些文件
tar -ztvf log.tar.gz
# 解压到指定目录
tar -zxvf log.tar.gz -C DIRECTORY
```

一旦你不巧的收到了 rar 格式的压缩包，可以通过 Homebrew 安装 unrar 命令进行解压，由于不是系统内置命令在此不做展开。

(6)通过命令行更新软件

```bash
# 列举所有可供更新的软件
softwareupdate -l
# 安装更新, 完成后重启
softwareupdate -ia --restart
# 查看软件更新历史
softwareupdate --history
```

(7)读写设置

和 iOS 类似，Mac OSX 的设置项也通过 plist 格式保存在文件系统中，可以通过 defaults 命令增删改查，通常修改结束后使用 killall 命令重启相关程序以生效，对于具体的某个应用需要给出 bundle id，对于全局设置可以使用 NSGlobalDomain 或缩写 -g，如果不指定，则输出所有用户设置，可以通过 defaults domains 查询所有可用的域。

增改使用 write 子命令，删除使用 delete 子命令，查询使用 find，read 和 read-type 子命令。

以下列举我知道的几个非常有用的设置项目：

```bash
# 修改按键触发的最短间隔
defaults write -g KeyRepeat -int 0.02
# 显示隐藏文件
defaults write com.apple.finder AppleShowAllFiles -bool TRUE;
killall Finder;
# 预览功能允许选中
defaults write com.apple.finder QLEnableTextSelection -bool TRUE;
killall Finder;
# 减少透明特效
defaults write com.apple.universalaccess reduceTransparency -bool TRUE;
# 恢复默认透明效果
defaults write com.apple.universalaccess reduceTransparency -bool FALSE;
# 修改 Launchpad 的图标大小
defaults write com.apple.dock springboard-rows -int 7;
defaults write com.apple.dock springboard-columns -int 8;
defaults write com.apple.dock ResetLaunchPad -bool TRUE;
killall Dock;
```

(8)发送邮件

```bash
echo "MAIL CONTENT" | mail -s subject receiver@gmail.com
```

三、附言

作为一个全职 iOS 应用开发人员，命令行的使用经验主要源于日常积累，最近高产的内容输出帮我回顾了使用经验，也发现了自己这些知识不够全面和系统的问题。命令行的系列暂时告一段落，下一系列会更新 Git 的使用基础，经验和技巧。