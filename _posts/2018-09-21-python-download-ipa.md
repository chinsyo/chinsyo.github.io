---
title: 使用 Python 脚本下载 IPA
subtitle: Python download IPA
date: 2018-09-21 12:00:00
tags:
  - Python
  - iOS
  - 开源
  - 逆向
---

作为开发人员，在实现功能时经常需要参考竞品的实现，除了借鉴开源代码外逆向也是一种可行的办法，对于 iOS 开发而言逆向的第一步便是找到脱壳的 IPA。在早于 12.7 版本的 iTunes 可以方便的搜索 AppStore 和下载导出 IPA，如今本就羸弱且饱受诟病的 iTunes 去掉了这一功能。

兵来将挡，水来土掩。作为补救措施，还可以通过使用越狱的手机自主脱壳和从 PP 助手等软件下载脱壳的 IPA。随着 iOS 愈加开放和安全，完美越狱变得越来越有难度也越来越没必要，使用第三方软件会进一步侵占捉襟见肘的 Mac 硬盘空间，同时又给同步开发环境增加了负担，在这里分享一下使用 Python 脚本解决这个问题。

以 Instagram 为例。访问 PP 助手网页，在 Instagram 应用详情页我们看到「下载越狱版」的字样，这正是我们要寻找的脱壳版 IPA。

![](http://pwj4lonpu.bkt.clouddn.com/25pp-instagram.jpg)

使用 Chrome 开发者工具中的 Inspector 选中该按钮可以看到对应节点的 HTML 源码，如下:

```html
<a href="javascript:void(0);" class="btn-install-x" apptype="app" data-id="596531" data-iid="389801252" appname="Instagram" appversion="71.0" appdownurl="aHR0cDovL3IxMS4yNXBwLmNvbS9zb2Z0LzIwMTgvMTEvMTMvMjAxODExMTNfNTc2NThfMjMzMTg2Mjg4NjAyLmlwYQ==" closetimer="-1" onclick="return ppOneKeySetup(this)" data-stat-act="jb" data-stat-pos="install">下载越狱版</a>
```

源码中 appdownurl 字面看起来应该是下载地址，但同时又不是合法的 URL 链接，熟悉 Base64 编码的同学看到结尾的 == 号不难猜到这是一段 Base64 后的数据，不熟悉的同学可以查看阮一峰老师的博客[Base64笔记](http://www.ruanyifeng.com/blog/2008/06/base64.html)了解。

打开命令行或者任何其他你习惯的 Base64 解码工具，尝试解码 appdownurl。

```bash
$ echo -n "aHR0cDovL3IxMS4yNXBwLmNvbS9zb2Z0LzIwMTgvMTEvMTMvMjAxODExMTNfNTc2NThfMjMzMTg2Mjg4NjAyLmlwYQ==" | base64 -D
http://r11.25pp.com/soft/2018/11/13/20181113_57658_233186288602.ipa
```

不出所料果然是编码后的下载链接，为了方便日后使用将这些步骤简化为一个 Python 脚本，内容如下:

```python
#! /usr/bin/env python3

import requests
import shutil
from lxml.etree import HTML
from base64 import b64decode
from sys import argv

def main():
    apps = argv[1:]
    for app in apps:
        req = requests.get(app)
        sel = HTML(req.content)
        title = sel.xpath('//h2[contains(@class, "app-title")]/text()')[-1]
        encoded = sel.xpath('//a[@class="btn-install-x"]/@appdownurl')[-1]
        decoded = b64decode(encoded).decode('utf8')
        print("%s: %s" % (title, decoded))
        
        resp = requests.get(decoded, stream=True)
        assert(resp.status_code == 200)
        with open('%s.ipa' % title, 'wb') as ipa:
            print('Downloading ipa %s...' % title)
            resp.raw.decode_content=True
            shutil.copyfileobj(resp.raw, ipa)
        print('%s downloaded' % title)

if __name__ == '__main__':
    main()
```

Python 脚本的作用为：解析命令行参数，依次请求传入的页面链接，然后使用 Xpath 获取下载按钮的对应 appdownurl 属性，解码后下载脱壳 IPA 保存到本地。

下载后的脱壳 IPA 任你摆布，可以将后缀名 .ipa 改为 .zip 然后右键点击解压缩，也可以使用 unzip 命令来解压缩。最后使用 class-dump 导出头文件，Instagram 导出的头文件中可以找到 ZZArchive 和 FXBlurView 等知名开源库。

![](http://pwj4lonpu.bkt.clouddn.com/instagram-classdump.png)