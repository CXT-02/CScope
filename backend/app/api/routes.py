"""HTTP 路由层。只放路由，不含业务逻辑（见 ARCHITECTURE.md §4）。

依赖注入 core 计算服务，保持 api 层与 core 层解耦。
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
import math
import re

from app.core.attention import compute_attention

router = APIRouter()


class AttentionRequest(BaseModel):
    text: str = Field(..., min_length=1, description="输入文本")
    layer: int = Field(0, ge=0, description="层索引（0-based）")
    head: int = Field(0, ge=0, description="头索引")
    temperature: float = Field(1.0, gt=0.0, description="温度参数")


@router.get("/health")
def health():
    """健康检查，供前端降级探测。"""
    return {"status": "ok", "service": "cscope-backend"}


@router.post("/attention")
def attention(req: AttentionRequest):
    """获取指定层/头的注意力权重矩阵。"""
    try:
        data = compute_attention(
            text=req.text,
            layer=req.layer,
            head=req.head,
            temperature=req.temperature,
        )
    except (NotImplementedError, RuntimeError, ValueError) as e:
        # 模型未配置/加载失败/参数越界：返回降级结构，标注 source='sample'
        return {
            "status": "degraded",
            "source": "sample",
            "data": _sample_response(req),
            "message": str(e),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"status": "ok", "source": "live", "data": data}


def _sample_response(req: AttentionRequest):
    """模型不可用时生成随输入参数变化的模拟权重，保持离线交互有效。"""
    tokens = re.findall(r"[A-Za-z0-9]+|[\u4e00-\u9fff]|[^\s]", req.text)[:14]
    tokens = tokens or ["请", "输", "入", "文", "本"]
    n = len(tokens)
    depth = min(req.layer, 11) / 11
    weights = []
    for i in range(n):
        scores = []
        for j in range(n):
            distance = abs(i - j)
            locality = math.exp(-distance / (1.1 + depth * 3.2)) * (1.2 - depth * 0.45)
            self_focus = 0.8 - depth * 0.35 if i == j else 0
            direction = ((req.head % 4) - 1.5) * (j - i) * 0.045
            echo = 0.65 + depth if tokens[i] == tokens[j] and i != j else 0
            seed = sum((index + 1) * ord(char) for index, char in enumerate(f"{req.text}|{req.layer}|{req.head}|{i}|{j}"))
            variation = (seed % 1000) / 1000 * (0.55 + depth * 0.55)
            scores.append(max(0.01, locality + self_focus + direction + echo + variation))
        powered = [math.exp((score - max(scores)) / req.temperature) for score in scores]
        total = sum(powered)
        weights.append([round(value / total, 6) for value in powered])
    return {"tokens": tokens, "weights": weights, "shape": [1, n, n], "layer": req.layer, "head": req.head, "temperature": req.temperature}
