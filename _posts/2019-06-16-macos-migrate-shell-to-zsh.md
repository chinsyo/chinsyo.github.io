---
title: macOS Catalina 替换默认 Shell 为 zsh
date: 2019-06-16 12:00:00
tags:
  - 苹果
  - 简讯
  - 命令行
  - macOS
---

WWDC19 发布了 macOS Catalina 预览版操作系统，除了功能更新外还将默认登录 shell 和交互 shell 由 bash 改为 zsh。 

作为类 Unix 系统，macOS 包含了 Bourne Shell 和它的继任者 bash（Bourne Again Shell 的缩写）。外界猜测这是由于 bash 不够现代化，加之新版本 bash 使用的 GPLv3 协议。 macOS Mojave 及更早的系统中仍然采用 bash 作为默认 shell，并且 bash 在 Catalina 系统仍然可用。不过按照 Apple 的一贯作风，早用早享受，晚用没折扣。

zsh 和 bash 很大程度上兼容，尽管如此，还是建议在脚本开头加上 #! /bin/zsh 指定使用的 shell。转向 zsh 更容易拥有可扩展、可定制的 shell 环境，当初吸引我转向 zsh 的也是 oh-my-zsh 项目展示的强大的插件和优雅的主题，大家不妨按照教程配置体验一次「你从未体验过的船新版本」。 

（吐槽 
最近在读的《C陷阱与缺陷》和《C专家编程》都提到了 Bourne Shell 作者使用宏将 C 语言的语法改造成贴近 Algo 语法的故事，并且表达了一致的嗤之以鼻。我对此也嗤之以鼻。