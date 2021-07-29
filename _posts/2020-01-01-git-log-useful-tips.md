---
title: Git日志的一些使用技巧
subtitle: Git log usefule tips
date: 2020-01-01 12:00:00
tags:
  - Git
  - 日志
  - 开发
  - 技巧
---

2020年1月1日，各位读者新年快乐！本次更新一些《Pro Git》中记录的日志小技巧。

### 统计贡献者的代码提交次数

```bash
git shortlog -sne
```

shortlog是用于简化log输出的命令，可以方便的汇总展示不同提交者的提交日志。 参数含义如下:

```bash
-s 只输出提交次数，不输出相应提交的日志。
-n 按照提交次数排序，不指定该参数则按照贡献者字母顺序。
-e 同时显示提交者的email地址。
```

### 制作版本更新的简报

```bash
git shortlog --no-merges BRANCH --not PREV_TAG
```

这个命令的作用为输出自指定tag之后该分支提交内容的简报。

### 查看引用的改动记录

```bash
git reflog show master@{one.week.ago}
```

和log的区别在于，reflog会展示所有造成引用变化的记录，比如rebase操作。

### 查询分支的提交合并情况

- 查询experiment分支未合并到master分支的提交
```bash
git log master..experiment
```
- 查询本地未提交的记录
```bash
git log origin/master..HEAD
```
此处的HEAD可以省略，git使用HEAD代替空语法。
- 查询两个以上的分支提交合并情况
```bash
git log feature1 feature2 --not develop
```
以上命令的作用为检查没有同步合并到develop分支的feature1和feature2提交。
- 查询两个分支不共有的提交
```bash
git log --left-right master...experiment
```
--left-right会显示每个提交处于哪一侧的分支，对于发版前的检查非常有效。
