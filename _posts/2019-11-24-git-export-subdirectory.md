---
title: 如何下载Git项目的指定子目录
subtitle: How to export git specific subdirectory?
date: 2019-11-24 12:00:00
tags:
  - Git
  - GitHub
  - GitLab
  - OpenSSL
  - 开发
  - 技巧
---

最近工作内容涉及加密算法日益变多，趁周末休息准备动手写几个OpenSSL 的项目加强学习，OpenSSL 项目很大，即使按照我在之前文章提过的方法 `git clone --depth 1` 或是下载压缩包也需要不少的时间和空间。

在查阅一些资料后了解到有几个方式可以实现只下载特定目录的效果，需要注意网上一些教程和问答的做法其实仍然是下载整个项目，但只 checkout 特定目录，这种方式并不能有效的改善下载时间和硬盘空间。

经过验证以下三种方式有效:

### 通过第三方工具 GitZip, DownGit 等

搜索关键字即可找到相应的工具，前者有对应的 Chrome/Firefox 插件。

### 对于 GitHub 项目

GitHub 项目查看文件的时候路径中通常会有 tree/master 的部分，将这部分替换为 trunk 即为对应的 svn 地址，便可以通过 svn 命令导出或检出。

```bash
svn ls https://github.com/openssl/openssl.git/trunk/demos
```

通过以上命令检查对应地址的文件是否正确，然后有两个选择：导出(export)或是检出(checkout)，区别在于前者仅导出文件，后者保留 svn 提交记录。Git 项目的 svn 记录由 cvs2svn 自动生成，实测使用 export 更快。

```bash
svn export https://github.com/openssl/openssl.git/trunk/demos
```

### 对于非 GitHub 项目

上面的方式经过验证在 Gitlab 无效，是 GitHub 的独有特性。对于非 GitHub 项目可以使用 git-archive 实现效果，经验证 GitHub 未开放 git-archive 权限。

```bash
git archive --verbose --format tar --remote  git@gitlab.com:chinsyo/sample.git HEAD subdir > subdir.tar
```

我几乎不会为了一个小功能安装图形化工具，也极少使用 GitHub 之外的代码网站，尤其是 GitHub 开放了免费的 private repo 之后。因此对我个人而言使用频率最高的方式依次是2、3、1，顺便吐槽一下 OpenSSL 项目大到 octotree 插件半天加载不出来项目结构。图片

希望以上内容对你有用。