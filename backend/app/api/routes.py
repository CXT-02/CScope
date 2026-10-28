"""HTTP 路由层。只放路由，不含业务逻辑（见 ARCHITECTURE.md §4）。

依赖注入 core 计算服务，保持 api 层与 core 层解耦。
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

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
    """模型未配置时的占位权重（示意数据），保持接口形状一致。"""
    tokens = list(req.text)
    n = len(tokens)
    weights = [[0.0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            weights[i][j] = round(1.0 / n, 4)
    return {"tokens": tokens, "weights": weights, "shape": [1, n, n], "layer": req.layer, "head": req.head}
