"""注意力权重计算核心（core 层）。

职责：输入文本 → 输出指定层/头的注意力权重矩阵 [seq_len, seq_len]。
纯函数，不依赖 HTTP。与 api 层解耦。

模型接入点：`_model` 与 `_tokenizer` 懒加载 HuggingFace 模型。
双模型策略见 ARCHITECTURE.md §9。
"""
import logging
import os

logger = logging.getLogger(__name__)

# === 国内网络镜像（ARCHITECTURE.md §9）：未显式设置时默认走镜像，避免 HF 官方超时 ===
if not os.environ.get("HF_ENDPOINT"):
    os.environ["HF_ENDPOINT"] = "https://hf-mirror.com"

# === 双模型策略（ARCHITECTURE.md §9） ===
# 默认模型：中文 BERT（镜像确认存在，CPU 可跑，保证评委复现）
DEFAULT_MODEL = "uer/roberta-base-finetuned-jd-binary-chinese"
# 可选增强模型：通过环境变量 ATTENTION_MODEL 切换
ENHANCED_MODEL = "bert-base-chinese"
MODEL_NAME = os.environ.get("ATTENTION_MODEL", DEFAULT_MODEL)
_model = None
_tokenizer = None


def _load_model():
    """懒加载模型。按双模型策略从环境变量读取模型名。"""
    global _model, _tokenizer
    if _model is not None:
        return _model, _tokenizer
    logger.info("加载模型: %s", MODEL_NAME)
    try:
        from transformers import AutoModel, AutoTokenizer
        _tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
        _model = AutoModel.from_pretrained(MODEL_NAME, output_attentions=True)
        _model.eval()
    except Exception as e:
        raise RuntimeError(f"模型加载失败 ({MODEL_NAME}): {e}")
    return _model, _tokenizer


def compute_attention(text: str, layer: int = 0, head: int = 0, temperature: float = 1.0) -> dict:
    """计算指定层/头的注意力权重。

    Returns:
        {tokens: list[str], weights: list[list[float]], shape: [num_heads, seq, seq],
         layer: int, head: int}
    """
    model, tokenizer = _load_model()

    import torch

    inputs = tokenizer(text, return_tensors="pt")
    with torch.no_grad():
        outputs = model(**inputs, output_attentions=True)

    # attentions: tuple of (batch, num_heads, seq, seq)，每个层一个
    attentions = outputs.attentions
    if layer >= len(attentions):
        raise ValueError(f"layer {layer} 超出模型层数 {len(attentions)}")

    attn_layer = attentions[layer][0]  # (num_heads, seq, seq)
    if head >= attn_layer.shape[0]:
        raise ValueError(f"head {head} 超出模型头数 {attn_layer.shape[0]}")

    head_weights = attn_layer[head]  # (seq, seq)

    # 注意力输出已经是概率。log(p) 可还原与原始 logits 只相差一个行常数，
    # 因此 softmax(log(p) / T) 等价于对 logits 做温度缩放，并保持每行归一化。
    if temperature != 1.0:
        head_weights = torch.softmax(
            torch.log(head_weights.clamp_min(1e-12)) / temperature,
            dim=-1,
        )

    weights = head_weights.tolist()
    weights = [[round(float(v), 6) for v in row] for row in weights]

    tokens = tokenizer.convert_ids_to_tokens(inputs["input_ids"][0])
    tokens = [t.replace("##", "") for t in tokens]

    return {
        "tokens": tokens,
        "weights": weights,
        "shape": list(head_weights.shape),
        "layer": layer,
        "head": head,
        "temperature": temperature,
    }
