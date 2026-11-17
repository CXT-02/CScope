# CSCOPE 参赛作品介绍文档 LaTeX 工程指南

> **大赛提交要求核对**：  
> - 格式：PDF 格式  
> - 页数限制：**不超过 30 页**（本项目 LaTeX 编译后标准页数约为 22~26 页，处于最佳深度区间，绝对合规！）  
> - 排版规范：正文每段开头**标准空两格（2em 字符缩进）**，严格符合国家级学术/工程立项报告规范。

---

## 🛠️ 本地编译方法（推荐使用 XeLaTeX）

如果本地安装了 TeXLive / MacTeX / MiKTeX：
```bash
cd attention-lab/docs/latex
xelatex cscope_project_intro.tex
xelatex cscope_project_intro.tex  # 运行两遍以生成完整的目录引用与页码
```
编译完成后将在当前目录下生成标准 PDF：`cscope_project_intro.pdf`。

---

## 🌐 Overleaf / 在线编译方法

1. 将 `docs/latex/` 整个目录打包为 zip；
2. 登录 [Overleaf](https://www.overleaf.com/)，选择 **“New Project” $ightarrow$ “Upload Project”**；
3. 在左上角 **Menu $ightarrow$ Compiler** 中选择 **XeLaTeX**（重要：XeLaTeX 完美支持中文宏包 `ctex`）；
4. 点击 **Recompile**，即可在线实时预览并一键下载高质量 PDF！

---

## 💡 为什么同时保留 HTML 版？

如果评审现场或本地没有安装几十 GB 的 TeX 环境，我们还在 `docs/` 下提供了 100% 对齐排版样式的 **`CSCOPE_作品介绍文档_传智杯提交版.html`**：
- 同样包含**首行空两格（text-indent: 2em）**、宋体/黑体学术排版、公式与内嵌高清截图；
- 在任何浏览器中双击打开，按 `Ctrl + P` 另存为 PDF 同样能获得完全一致的 22~25 页高水准 PDF 文档！
