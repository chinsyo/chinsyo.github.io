---
title: 学会 Git, 看这篇就够了(1)
subtitle: Learn Git the hard way 1
date: 2019-04-14 12:00:00
tags:
  - Git
  - 开发
---

## 前言

抱着共同学习，分享心得的心态，我完成了《macOS 下好用的命令行》系列文章，在书写过程中我不断回顾和反思，不可避免的陷入困扰。简单的列举命令会不会太基础？具体的讲解思路会不会太具体？自去年起公众号新账户不再开放留言权限，在无法得到有效反馈的前提下，本系列文章会做一些新的尝试和转变。

从《师说》受到启发，「师者，传道授业解惑也」，面对新的知识或领域，要快速切入才能满足进度需要，要深入了解才能迎合成长需要。作为 Git 这门知识的学生，希望在共同学习的过程中本系列文章起到了解惑、授业、传道的路线图，文章会围绕使用、原理和拓展阅读的思路进行展开。由于水平有限，内容不可避免的有所纰漏和谬误，欢迎通过公众号聊天窗口向我反馈。

相信大家都有毕业论文的经历，面对需要反复修改的内容，我们不可避免的复制粘贴多份文档，在文件名后追加不同的后缀区分文件。这种方式极大的占用了硬盘空间，同时在存储介质（如 U 盘）损坏时会带来难以估量的损失，学习好版本控制的知识，这些问题都可以迎刃而解，在我看来版本控制的知识并不局限于代码托管，而是一门通用领域的知识。

建议大家通过命令行完成 Git 的使用，以下摘录一段 Git 最权威的教材《Pro Git》的原书内容阐释原因。

> Git 有多种使用方式。 你可以使用原生的命令行模式，也可以使用 GUI 模式，这些 GUI 软件也能提供多种功能。 在本书中，我们将使用命令行模式。 这是因为首先，只有在命令行模式下你才能执行 Git 的 所有命令，而大多数的 GUI 软件只实现了 Git 所有功能的一个子集以降低操作难度。 如果你学会了在命令行下如何操作，那么你在操作 GUI 软件时应该也不会遇到什么困难，但是，反之则不成立。 此外，由于每个人的想法与侧重点不同，不同的人常常会安装不同的 GUI 软件，但所有人一定会有命令行工具。
> 
> 《Pro Git 第二版》


## 正文

### 初识 Git

Git 是一个分布式版本控制系统(Version Control System, 简称 VCS)，由 Linux 之父 Linus Torvalds 开发，源代码开放并托管在 https://github.com/git/git。

不同于 SVN 等集中式版本控制系统，Git 可以脱离远程仓库离线运行，其拥有强大的 非线性分支管理系统，这意味着 Git 可以快速高效的管理从个人微型规模项目到 Linux 内核这种超大规模项目。

此外，Git 和 SVN 等其他 VCS 对待数据的方式也不同。其他系统以文件变更列表的方式存储信息，将保存的信息看作是一组基本文件和每个文件随时间积累的差异。示意图如下：

Git 在保存项目状态时会对全部文件制作快照并保存快照的索引，如果文件没有修改则不再重新存储该文件，只保留指向之前所存储文件的链接。示意图如下：

### 安装 Git

在 macOS 系统中可以通过 which git 查询是否已经安装 Git。如果电脑上安装有 Xcode 通常意味着已经安装，否则我们可以通过 xcode-select --install 进行安装包含 Git 在内的开发套件，还可以通过 Homebrew 来安装和更新 Git，Homebrew 的安装方式较之前者能够更及时的更新版本从而享受新版本带来的中文界面等特性。

```bash
# 检查是否安装 git
# 输出 /usr/bin/git 则为系统自带的 git
# 输出 /usr/local/bin/git 则为 Homebrew 安装的 git
which git 
# 通过 xcode 命令行开发套件安装 git
xcode-select --install 
# 通过 Homebrew 安装 git
brew install git
```

### 配置 Git 基本信息

完成安装后我们需要对 Git 进行一些必要的配置，Git 内置了 config 子命令读写配置变量，可以添加不同选项来改变配置的影响范围。如 git config --system 对应系统范围内所有用户的 Git 配置，这一配置文件通常位于 /etc/gitconfig;  --global 对应当前用户范围内所有仓库的 Git 配置，配置文件通常位于 ~/.gitconfig；--local 对应当前仓库的 Git 配置，配置文件通常位于 .git/config；每一个级别覆盖上一级别的配置，即仓库的 Git 配置文件覆盖用户 Git 配置文件，用户 Git 配置文件覆盖系统 Git 配置文件，不指定配置范围时默认为仓库 Git 配置。

Git 在每一次提交都会使用你的用户名和邮箱信息，我们通过以下命令来完成设置：

```bash
git config --global user.name "Chenxiao"
git config --global user.email foobar@gmail.com
```

要检查配置，可以通过以下两种方式：

```bash
git config --list
cat ~/.gitconfig
```

也可以进入编辑模式预览和修改配置：

```bash
git config --edit
```

Git 通过上述的配置来标识和区分用户身份，关于身份认证的更多相关知识后续篇幅会介绍，本篇文章暂不涉及。

### 基础操作

前面提到，Git 可以快速高效安全的管理个人微型项目，同时支持脱离远程仓库离线运行。仓库(repository)也叫版本库，是指由 Git 进行版本控制的目录，通常对应我们的一个项目，创建一个仓库的步骤很简单。

```bash
# 首先创建一个空目录
mkdir learning-git
# 切换工作路径到创建好的空目录
cd learning-git 
# 在当前目录创建 git 仓库
git init
```

正常情况下你会看到包含「已初始化」或「initialized」的提示，是否显示中文取决于你的 Git 版本和语言设置，初始化成功后在仓库根目录下会生成一个 .git 的隐藏文件，现在不需要关注它的作用。和其他编程语言一样，我们以 Hello World 的例子开始。

```bash
# 在 git 仓库中, 创建一个文本 文件
echo "Hello world" >> greeting.txt
```

到目前为止，我们还没有对 greeting.txt 进行版本控制，Git 中有工作区和暂存区的概念，创建文件的操作发生在工作区，接下来查看增加了 greeting.txt 之后的工作区状态。

```bash
# 查看工作区状态
git status
```

输出内容显示我们有一个未跟踪的文件 greeting.txt 并提示我们通过 git add greeting.txt 添加到暂存区。Git 有三种文件状态，分别是已修改、已暂存和已提交，上面创建文件的步骤对于当前仓库是一次修改，所以 greeting.txt 目前是已修改状态。

```bash
# 将 greeting.txt 添加到暂存区
git add greeting.txt
# 将暂存区的文件提交
git commit -m 'add greeting.txt'
```

将修改的文件添加到暂存区，暂存区的文件会作为下次提交的输入变更为已修改状态。git commit -m 后面的内容是本次提交描述，会出现在仓库的提交日志中，通过命令查看：

```bash
git log
```

提交日志会通过 Git 的默认编辑器（通常是 vi）显示，内容包括作者、日期、描述、分支和由算法生成的摘要。恭喜你完成了第一次 Git 的基本流程，按 q 键退出 vi 编辑器。

回顾使用 Git 进行版本控制的基本流程，包括【1】修改文件【2】查看工作区状态【3】将工作区处于已修改的文件添加到暂存区【4】将暂存取文件提交。

如果只有创建而没有修改，版本控制便失去了它存在的意义，提交之后回过头看创建的文件，「Hello world」的 w 改成大写似乎更大气磅礴，盘他。通过你习惯的编辑器打开并修改 greeting.txt，接着查看工作区有什么变化。

```bash
git status
```

类似的，提示 greeting.txt 文件发生了变化。我们仍然可以通过 git add 和 git commit 提交文件，不过也有另外两种更简便的方式提交文件改动：

```bash
# 第一种, 将本目录下所有已修改的文件添加到暂存区, 然后提交
git add .; git commit -m 'update world to World';
# 第二种, 提交本目录下所有已修改d饿w嗯见到暂存取并提交
git commit -am 'update world to World'
```

第二种方式只能用于有 Git 版本记录的文件，不适用于首次添加的文件。完成本小节的学习后已经具备了 Git 的基础知识和基础操作，实际开发过程中我们往往需要面临团队写作，为了应对电脑故障通常也会有远程仓库。

### 配置连接

上述的操作都在本地仓库执行，本系列接下来的文章会涉及多人协作的内容，进一步学习之前我强烈建议你注册一个 GitHub 账号。2008 年上线的 GitHub 网站是一个采用 Git 作为版本控制系统的代码托管平台，Hub 有集线器和中心的含义，GitHub 是 Git 开源工具的衍生商业网站，免费账户足够我们日常开发使用，类似网站还有 GitLab，Bitbucket 等。在这些产品中 GitHub 目前规模最大，应用最广泛，并在 2018 年被拥抱开源的微软收购。注册的步骤本文不再赘述，请完成注册后继续进行阅读下面的内容。

我们可以通过 ssh 和 https 两种方式认证 Github 和 GitLab 远程仓库，首先介绍更为安全的 ssh 方式。

```bash
# 首先检查是否已经存在 ssh 密钥, 输出有内容并且邮箱一致则跳过生成密钥
ls ~/.ssh | grep id_rsa.pub 
# 生成连接 ssh 的非对称密钥, 邮箱需和上面 git config user.email 一致
# 过程中提示需要输入内容时一路回车即可
ssh-keygen -t rsa -C 'foobar@gmail.com'
# 复制公钥到剪贴板
cat ~/.ssh/id_rsa.pub | pbcopy 
# 登录 GitHub 或 GitLab 网页, 找到 ssh 密钥设置粘贴密钥到剪贴板
# 通过以下命令测试 ssh 连接检查密钥配置是否正确
ssh -T git@github.com
```

通过 https 连接则要简单的多，在 clone 和 push 时如果 Git 地址为 https:// 开头，会提示你输入账户密码。通过配置 https 可以实现和 ssh 等效的免密连接，由于 ssh 密钥认证的方式比 https 密码认证的方式更安全，加之凭证存储不属于 Git 的基本操作，以下设置 https 免密连接的内容在不需要或不理解的情况下可以先行跳过。通过下列命令查看 Git 关联的认证方式：

```bash
git config --system credential.helper
```

在 macOS 环境下，可以通过 git credential-osxkeychain 存储和删除登录凭证（$ 是命令行提示符，无需输入）：

```bash
# 使用 https 连接首次输入密码后会保存到钥匙链, 以后不必再输入
$ git credential-osxkeychain store 
host=github.com
protocol=https
> [Press Return]
```

``` bash
$ git credential-osxkeychain erase 
host=github.com
protocol=https
> [Press Return]
```

接下来的文章会涉及多人协作和远程仓库，可以在 https://github.com/chinsyo/learning-git 访问本系列文章同步更新的代码仓库，也欢迎 follow 我并 star 该项目。

