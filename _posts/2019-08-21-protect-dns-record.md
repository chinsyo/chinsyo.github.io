---
title: 记一次域名劫持的诊断与抢救
subtitle: Protect DNS record
date: 2019-08-21 12:00:00
tags:
  - 服务器
  - 域名
  - DNS
  - GitHub
  - Google
---

身体抱恙，请假休息。闲来无事打开 Google 检查下博客收录情况，因为使用了 Analytics 服务所以有印象收录页面大概40个左右。

在搜索栏输入`site:chinsyo.com`，今天发现搜索结果有些异常，居然足足有 8 页数据。

![](http://pwj4lonpu.bkt.clouddn.com/trouble-google-whole.png)

事出反常必有妖，当翻到第 3 页尾部的时候发现了端倪。我的域名怎么会出现俄文搜索结果，而且是一个我从未开放的子域名，莫非是恶意 SEO？

点击搜索结果，地址栏出现的确实是我的域名。

![](http://pwj4lonpu.bkt.clouddn.com/trouble-screenshot-subdomain.png)

看来这次确实摊上事了，先确定一下这个子域名都劫持了什么内容，截图留证。同理在搜索栏输入`site:cahtong.chinsyo.com`。

![](http://pwj4lonpu.bkt.clouddn.com/trouble-google-subdomain.png)

大概浏览一遍搜索结果，还好没有违法信息，稍微缓和一口气。

这时回想整个事件，我的域名 2015 年注册，期间一直绑定在`name.com`账号下，接触到`namesilo.com`后发现价格有不小的优惠，于是转移到了`namesilo.com`账号下。那么会是转移后 DNS Server 设置错误吗？

![](http://pwj4lonpu.bkt.clouddn.com/trouble-dns-server.png)

急忙登录账号检查，并没有异常。难道是 DNS Pod 的记录被篡改了？鉴于腾讯的一贯尿性……

![](http://pwj4lonpu.bkt.clouddn.com/trouble-dns-record.png)

DNS 记录也是正常的，108~111 都是 GitHub 的 IP，这下犯难了，先查一下子域名的 DNS 记录再说。

```bash
$ nslookup cahtong.chinsyo.com
Server:		192.168.50.1
Address:	192.168.50.1#53

Non-authoritative answer:
Name:	cahtong.chinsyo.com
Address: 185.199.109.153
Name:	cahtong.chinsyo.com
Address: 185.199.108.153
```

子域名的结果也指向 GitHub 的 IP，暂时没有定位到问题，Google 搜索 GitHub Pages 域名劫持没有找到有效信息。

回想整个流程发现 DNS 记录有两条泛解析指向 GitHub，而 GitHub Pages 是通过在仓库根目录设置 CNAME 文件绑定域名，整个流程是没有权限校验的。搜索 GitHub Pages 自定义域名官方也没有给出具体的设置方式，这和我的记忆有出入，记忆中 108~111 的 IP 地址是官方教程提供的。

第三方教程大多通过`CNAME记录`指向自己的`chinsyo.github.io`域名，而不是直接修改`A记录`指向 GitHub Pages 的 IP。在修改 DNS 记录的时候才发现同一类型 DNSPod 只支持添加两条记录，这也验证了我为什么添加了两条`@`的`A记录`之后仍然添加了两条`*`的`A记录`。

找到问题后解决就容易多了，首先删除目前的 DNS 记录并添加`chinsyo.github.io`的`CNAME记录`，顺便把当初自信 DNS 记录不会变才设置的 TTL 从 43200(12小时) 复原回 300(5分钟) 的默认值。

修改完成后由于 TTL 值很大所以不会立即生效，执行 `ping`, `nslookup`, `traceroute` 仍会看到缓存的结果。可以多尝试清除 DNS 记录后重试，清除方法如下。

```bash
$ sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder;
```

大概半小时后再次访问`cahtong.chinsyo.com`已经无法解析，接下来需要从 Google 删除无关的搜索结果，避免博客被降权。中间有个小插曲，搜索了百度、必应、360相关引擎发现我的域名，包括被污染和未污染的子域名都没有收录。呃……也算帮我删除结果省事了吧……

一番搜索之后找到 Google 提供的删除页面。

![](http://pwj4lonpu.bkt.clouddn.com/trouble-google-removal.png)

同样的，这里也有一个小插曲。Google 提供了三种删除申请，分别是过期内容报告，违法内容投诉和站长主动删除。第一反应当然是站长主动删除，然而我只认证了根域名，而 Google 将根域名和子域名视为不同权限。为了避免违法内容影响到权重，并且现在被污染的子域名已经无法访问，只好退而求其次选择了过期内容报告。

截止这篇博客发布，申请仍然处于悲催的待定中。域名四年多的时间里使用错误的配置随我辗转`name.com`和`namesilo.com`，到头来是四年前的 DNS 配置错误，信息安全果然容不得半点马虎，另外千万不要轻信百度来的野生教程。

各位读者如果持有域名，也务必检查一下自己的 DNS 设置是否正确。躺着也中枪的腾讯这次是真的被冤枉了。