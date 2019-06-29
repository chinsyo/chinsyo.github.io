---
title: Apple 推出全新加密开发框架 CryptoKit
subtitle: Apple introduce new framework CryptoKit
date: 2019-06-10 12:00:00
tags:
  - 苹果
  - 简讯
  - 安全
---

CryptoKit 旨在安全高效的执行加解密操作，极大的减少加解密需要编写的模板代码。目前文档显示仅支持 Swift，ObjC 仍然需要使用更加底层的 Security 和 CommonCrypto。 

1. 依托 Swift 简洁的语法，新框架生成 256bit 的对称密钥仅需一行代码（在之前的官方文档中需要至少 7 行）。 
2. 同时新框架还提供了包括 AES GCM 和 Chacha20 在内的 AEAD 加密算法，摆脱 OpenSSL 和 libsodium 指日可待。 
3. 另外，CryptoKit 提供了包括 Curve25519 在内的更多椭圆曲线算法，有望突破以前文档明确的 Secure Enclave 最大支持保存 256bit 密钥限制。 

科技媒体普遍认为这次更新释放了 iOS 对数字货币硬件钱包的利好。 

官方视频：[https://developer.apple.com/videos/play/wwdc2019/709](https://developer.apple.com/videos/play/wwdc2019/709)

官方文档：[https://developer.apple.com/documentation/cryptokit](https://developer.apple.com/documentation/cryptokit)