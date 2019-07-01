---
title: macOS 好用的命令行(1)
subtitle: Useful commandline in macOS 1
date: 2019-04-08 12:00:00
tags:
  - 命令行
  - macOS
  - 开源
---

macOS 是 Apple 旗下 Mac 系列电脑搭载的操作系统，它以 Mach 内核为基础，加入了 Unix 的 BSD 实现。提供了丰富的命令行程序。

我在使用过程中积累了一些使用经验，开源发布在 [GitHub](https://github.com/chinsyo/commandline)，如果想进一步了解这些命令，可以在使用 man 或 -h 查询参数含义。

由于很多命令会隐含英语缩写，下文会适当标明一些缩写方便记忆和理解。

* 关机重启
```bash
# 重启电脑
sudo reboot
sudo shutdown -r now
# 关闭电脑
sudo shutdown -h now
sudo shutdown -h 10
```

* 防止电脑进入休眠
```bash
# 3600 为 1 小时的秒数, 可修改为其他值
caffeinate -u -t 3600
```

* 后台任务相关
```bash
# nohup = no hangup (不挂断，忽略终端的 SIGHUP), 终端退出后继续运行
# & 表示在后台运行, sleep 100 可以替换为需要运行的命令
nohup sleep 100 &
# 查看后台任务
jobs
# fg = foreground（前台）, 将序号为 1 的任务从后台转为前台
fg %1
```

* DNS 相关操作
```bash
# 清除 DNS 缓存
sudo killall -HUP mDNSResponder; 
# 查询每个网络连接的 DNS 设置
IN=$(networksetup -listallnetworkservices | awk '{if (NR>1) print $0 ";"}');
while IFS=";" read -ra SERVICES; do
    for i in "${SERVICES[@]}"; do
        echo "${i} DNS Servers:"
        networksetup -getdnsservers "${i}"
    done
done <<< "$IN"
```

* 环境变量
```bash
printenv # 打印系统环境变量
set KEY=VALUE # 设置环境变量
unuset KEY # 删除环境变量
export KEY=VALUE # 导出环境变量
source FILEPATH # 读取并执行文件, 对当前 shell 可见
```

* 日期相关操作
```bash
# 查看当前月份日历
cal 
# 查看指定月份日历
cal 1 2019 
# 查看当前日期
date 
```

* 系统信息
```bash
# 当前系统信息
# Darwin shawn-imac.local 18.2.0 Darwin Kernel Version 18.2.0: Thu Dec 20 20:46:53 PST 2018; root:xnu-4903.241.1~1/RELEASE_X86_64 x86_64
uname -a 
# 当前系统内核版本
# 18.2.0
uname -r 
# 当前 OSX 版本信息
# ProductName:  Mac OS X
# ProductVersion:  10.14.3
# BuildVersion:  18D109
sw_vers 
```

* 获取CPU信息
```bash
# cpu核心数
sysctl -a | grep -Eo "core_count:(.+?)$" 
# cpu品牌
sysctl -n machdep.cpu.brand_string 
```

* 安全选项
```bash
# 配置系统安全策略
# 启用后可以调试系统应用
csrutil disable; 
csrutil enable;
# macOS 10.12 以后，开启该选项才可以「允许任何来源」的安装包
sudo spctl --master-disable
```

* WIFI 操作
```bash
# 首先设置 airport 工具的软链接
sudo ln -s /System/Library/PrivateFrameworks/Apple80211.framework/Versions/Current/Resources/airport /usr/local/bin/airport
# 将 airport 工具所在目录追加到 PATH 环境变量，以便直接使用
export $PATH="/usr/local/bin:$PATH"
# 扫描 WIFI
airport -s
# 查看当前连接的 WIFI 名称
airport -I | awk '/ SSID/ {print substr($0, index($0, $2))}'
# 查看当前连接的 WIFI 内网 IP
ipconfig getifaddr en0
# 查看当前连接的 WIFI 外网 IP
curl ipecho.net/plain; echo
# 加入 WIFI
networksetup -setairportnetwork en0 WIFI_SSID WIFI_PASSWORD
```

* SSH 连接
```bash
# 生成 SSH 连接的密钥对
ssh-keygen -t rsa;
# 将公钥上传到指定服务器, 实现免密码登录
ssh-copy-id -i ~/.ssh/id_rsa.pub USERNAME@HOSTADDR;
# 创建 config 文件
touch ~/.ssh/config;
# 填写 alias, host, user. 此后可以直接通过 ssh alias 连接
echo -e "Host ALIAS\n    HostName HOSTADDR\n    User USERNAME" >> ~/.ssh/config; 
```

* 编码相关
```bash
# 查看输入文本的 MD5 摘要
md5 -xs "Hello world!"
# 对输入内容 base64 编码, tr -d \\n 为删除 echo 的换行符号
echo "hello" | tr -d \\n | base64
# 对输入内容 base64 解码
echo "aGVsbG8=" | tr -d \\n | base64 -D
# 转换文本格式
textutil -convert html file.ext
# 转换音频格式
afconvert input.mp3 rintone.m4r -f m4af
```

* 网络开发相关
```bash
# 查询域名的过期时间
whois baidu.com | grep Expiry | sed -n "s/Registry Expiry Date://p" || echo "No matching result"
# 查询当前连接设备的 UDID
system_profiler SPUSBDataType | sed -n -e '/iPad/,/Serial/p' -e '/iPhone/,/Serial/p'
# 创建虚拟网卡
rvictl -s UDID
# 查询虚拟网卡列表
rvictl -l
# 销毁虚拟网卡
rvictl -x UDID
# 使用 tcpdump 查看当前虚拟网卡的网络数据
sudo tcpdump -i rvi0 -AAl
```