#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CSCOPE 2026传智杯 · 参赛作品自动化纯净化打包脚本
-----------------------------------------------
功能：
1. 自动过滤庞大的 node_modules, .venv, .git, .runtime 等临时缓存目录；
2. 包含完整的前端源码、后端源码、核心技术文档（README, 项目报告, 答辩大纲, 视频脚本）；
3. 生成体积小巧、解压即用的比赛官方提交标准压缩包。
"""

import os
import zipfile
import shutil
from datetime import datetime

# 排除的目录名与文件名
IGNORE_DIRS = {
    'node_modules',
    '.git',
    '.venv',
    'venv',
    '__pycache__',
    '.runtime',
    '.vscode',
    '.idea',
    'dist'
}

IGNORE_EXTENSIONS = {
    '.pyc',
    '.pyo',
    '.pyd',
    '.log',
    '.DS_Store'
}

def package_project():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    parent_dir = os.path.dirname(root_dir)
    
    timestamp = datetime.now().strftime('%Y%m%d_%H%M')
    output_filename = f"CSCOPE_2026传智杯_参赛作品源码包_{timestamp}.zip"
    output_path = os.path.join(parent_dir, output_filename)

    print(f"==================================================")
    print(f" 开始打包 CSCOPE 传智杯参赛作品源码包...")
    print(f" 根目录: {root_dir}")
    print(f" 输出路径: {output_path}")
    print(f"==================================================")

    file_count = 0
    total_size = 0

    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for current_root, dirs, files in os.walk(root_dir):
            # 过滤不需要的目录
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith('.')]
            
            for file in files:
                ext = os.path.splitext(file)[1].lower()
                if ext in IGNORE_EXTENSIONS:
                    continue
                if file.startswith('.') and file != '.gitignore':
                    continue

                full_path = os.path.join(current_root, file)
                # 计算在 zip 中的相对路径
                rel_path = os.path.relpath(full_path, root_dir)
                zip_archive_path = os.path.join("CScope", rel_path)

                zipf.write(full_path, zip_archive_path)
                file_count += 1
                total_size += os.path.getsize(full_path)

    mb_size = round(total_size / (1024 * 1024), 2)
    zip_mb_size = round(os.path.getsize(output_path) / (1024 * 1024), 2)

    print(f"\n[✓] 打包完成！")
    print(f" - 归档文件数: {file_count} 个")
    print(f" - 原文件体积: {mb_size} MB")
    print(f" - 压缩包体积: {zip_mb_size} MB （极度轻量，无冗余 node_modules）")
    print(f" - 压缩包文件: {output_path}")
    print(f"==================================================")

if __name__ == '__main__':
    package_project()
