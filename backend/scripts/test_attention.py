"""端到端验证：真实模型计算 attention 权重。

验证 compute_attention 在加载真实模型后能返回合理权重。
不依赖 HTTP，直接调用 core 层。
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.attention import compute_attention

result = compute_attention(text="我喜欢学习深度学习", layer=0, head=0)

out_path = r"D:\2026年传智杯\attention-lab\backend\_attention_test.json"
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("tokens:", result["tokens"])
print("shape:", result["shape"])
print("rows:", len(result["weights"]))
print("sample row0:", result["weights"][0])
print("written to", out_path)
