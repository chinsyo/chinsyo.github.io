---
title: FRP 内网穿透——随时随地SSH连接家中的树莓派
subtitle: FRP - SSH Connect Raspberry Pi Anywhere
date: 2019-08-10 12:00:00
tags:
  - FRP
  - 树莓派
---

树莓派（Raspberry Pi）是为计算机编程教育设计的廉价电脑，只有信用卡大小。

久闻树莓派盛名，第一次动购买的念头是看了 Kitten Yang 基于 Home Assistant 搭建智能家居的博文后，但装修时最终采用了小米智能家居的整体方案（目前已经使用一年有余，今后会专门写一篇使用体验）。今年上半年做了一些贴近硬件的软件开发，萌生了探索硬件的念头，遂购入树莓派。

我选购的是彼时最新型号树莓派3B+，最新发布的树莓派4有着不俗的性能提升。回顾折腾树莓派的过程，有几点经验分享：

1. 网线和HDMI视频线不是必须的，将系统烧录到SD卡后，配置 Wi-Fi 连接功能和SSH功能。然后使用同一局域网的电脑`ping raspberrypi.local`获得IP地址，使用ZSH（或手机使用Termius）连接到树莓派。
2. 风扇的噪音比较大，可以选择铝合金外壳来改善散热或通过三极管调节风扇风速减小噪音。
3. 默认的APT源下载速度比较慢，建议换成清华或中科大的源。
4. APT源中的golang版本比较老，需要通过APT安装golang后再下载新版本源码自行编译。

树莓派买来后我主要用在以下几方面：

1. 搭建SAMBA文件共享服务，当一个简易的NAS，备份了一些照片和文件。
2. 搭建Aria2+YAAW配合VLC的简易影视系统，用来看了几部电影，印象最深刻的当属《泰坦尼克号》。
3. 将一些格式转换的任务丢给FFmpeg慢慢执行。
4. 定时运行一些简易的定时脚本。

当然，就像「盖Kindle 面更香」一样，树莓派最主要的用途还是吃灰。

贸易战的消息此起彼伏，对美国，大家的态度多是忌惮和愤恨兼而有之。最近更是曝出Github受到美国出口管理条例的管制，无故停用了几个伊朗开发者的账号。

就像华为有HarmonryOS作为Android备胎那样，我决定部署一个自己的Git服务，不使用GitHub也不依托云主机，树莓派刚好派上用场。

说干就干，摆在眼前的第一个问题是，我的宽带是移动冰淇淋套餐赠送的家庭宽带，没有公网IP。解决方案主要有三个：

* 花生壳等DDNS解析
* Ngrok
* FRP

付费服务花生壳不考虑，Ngrok免费版不支持自定义域名，这次决定挑没玩过的FRP下手。

FRP是Fast Reverse Proxy的缩写，一款支持TCP/UDP快速反向代理的开源软件，可以很方便的内网穿透。和花生壳、Ngrok等不同，FRP客户端和服务端的控制权都在自己手中，这也意味着你需要准备一台有公网IP的VPS运行服务端程序。

好巧不巧，腾讯云99元/年的AMD主机我刚好有一台在吃灰。首先分别查看服务器和树莓派的系统架构。

```bash
# Server
$ uname -a
Linux VM-0-2-ubuntu 4.4.0-148-generic #174-Ubuntu SMP Tue May 7 12:20:14 UTC 2019 x86_64 x86_64 x86_64 GNU/Linux
# Raspberry Pi
$ uname -a
Linux raspberrypi 4.19.57-v7+ #1244 SMP Thu Jul 4 18:45:25 BST 2019 armv7l GNU/Linux
```

访问FRP的[release页面](https://github.com/fatedier/frp/releases)查看对应架构的最新版下载地址，在服务器和树莓派分别下载并解压。

```bash
$ mkdir -p app/install & cd app/install
$ wget https://github.com/fatedier/frp/releases/download/v0.28.2/frp_0.28.2_linux_arm.tar.gz
$ tar -zxvf frp_0.28.2_linux_arm.tar.gz 
$ sudo mv frp_0.28.2_linux_arm /usr/local/frp
```

以上步骤服务器和树莓派一致，上面的示例是针对树莓派3B+的armv7l架构，服务器注意替换为amd64的下载链接。

接下来需要修改配置文件，树莓派配置文件为frpc.ini，服务器配置文件为frps.ini，对应C/S架构中的服务端和客户端。服务器采用默认配置，树莓派将表示服务器地址的`x.x.x.x`替换为实际地址。

```ini
# frps.ini
[common]
bind_port = 7000
# frpc.ini
[common]
server_addr = x.x.x.x
server_port = 7000
[ssh]
type = tcp
local_ip = 127.0.0.1
local_port = 22
remote_port = 6000
```

接着切换到上面的工作路径`/usr/local/frp`，服务端执行`./frps -c frps.ini`，树莓派执行`./frpc -c ./frpc.ini`。

电脑打开ZSH，或手机打开Termius，`ssh -oPort=6000 pi@x.x.x.x`测试我们的连接。注意这里pi代表在树莓派上的用户名，而x.x.x.x代表服务器的IP地址，正常情况下这个时候你会看到熟悉的Linux登录成功提示。

可我没有，转念一想，应该是防火墙的问题。前往腾讯云的控制台，在安全组中添加以下两条：

```
0.0.0.0/0 TCP:6000
0.0.0.0/0 TCP:7000
```

再次测试ssh连接，终于见到了熟悉的Linux登录成功提示。

到此为止已经实现了随时随地SSH连接家中的树莓派，通过下面的命令可以后台运行并记录日志。

```bash
# Server
nohup ./frps -c ./frps.ini > frps.log 2>&1 &
# Raspberry Pi
nohup ./frpc -c ./frpc.ini > frpc.log 2>&1 &
```

出于安全考虑，可以在服务器和树莓派的配置文件中增加token字段，服务器和树莓派的token字段需要保持一致。建议生成随机数或伪随机数，我最终采用的是`date | md5 | head -c 8`的输出结果。

由于暴躁的我常常出于无法忍受树莓派的噪音而关机，有必要将FRP加入开机启动。

首先创建service：

```bash
sudo vi /etc/systemd/system/frpc.service
# /etc/systemd/system/frpc.service
[Unit]
Description=frpc
After=network.target
[Service]
TimeoutStartSec=30
WorkingDirectory=/usr/local/frp
ExecStart=/usr/local/frp/frpc -c /usr/local/frp/frpc.ini
Restart=on-failure
[Install]
WantedBy=multi-user.target
```

服务器和树莓派配置过程相同，服务器只需要将frpc替换为frps即可。

```bash
# 刷新服务
sudo systemctl deamon-reload
# 允许开机启动
sudo systemctl enable frpc.service
# 运行服务
sudo systemctl start frpc.service
# 查看状态
sudo systemctl status frpc.service
```

到这里开机启动也设置完毕了，树莓派远程吃灰的玩法等你开发。:)