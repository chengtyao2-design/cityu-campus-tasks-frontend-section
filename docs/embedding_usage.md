# 向量嵌入和 FAISS 索引使用指南

## 概述

本项目实现了基于 BGE-small-zh-v1.5 模型的中文文本向量嵌入和 FAISS 索引系统，支持语义搜索和相似度匹配。

## 核心组件

### 1. app/services/embedder.py
- **TextChunker**: 文本分块器，支持 400-700 字符分块，80-120 字符重叠
- **EmbeddingService**: 嵌入服务，使用 BGE-small-zh-v1.5 模型
- **FAISSIndexManager**: FAISS 索引管理器，支持构建、保存、加载索引

### 2. scripts/build_index.py
- CLI 工具，用于构建和测试 FAISS 索引
- 支持从 JSONL/JSON 数据构建索引
- 内置测试功能，验证相似度阈值

## CLI 使用方法

### 基本构建索引
```bash
python scripts/build_index.py --data data/task_kb.jsonl --output indices/task_index
```

### 构建并测试索引
```bash
python scripts/build_index.py --data data/task_kb.jsonl --output indices/task_index --test
```

### 仅测试现有索引
```bash
python scripts/build_index.py --test-only --index indices/task_index --top-k 4 --min-similarity 0.35
```

### 自定义参数
```bash
python scripts/build_index.py \
  --data data/task_kb.jsonl \
  --output indices/custom_index \
  --model BAAI/bge-small-zh-v1.5 \
  --chunk-size 600 \
  --overlap 120 \
  --test \
  --top-k 5 \
  --min-similarity 0.4
```

### 自定义测试查询
```bash
python scripts/build_index.py \
  --test-only \
  --index indices/task_index \
  --queries "图书馆在哪里" "如何使用实验室" "学生活动安排" \
  --verbose
```

## 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `--data/-d` | 知识库数据文件路径 | 必需 |
| `--output/-o` | 输出索引路径（不含扩展名） | `data/index` |
| `--model/-m` | 嵌入模型名称 | `BAAI/bge-small-zh-v1.5` |
| `--chunk-size` | 文本分块大小 | `550` |
| `--overlap` | 分块重叠大小 | `100` |
| `--test` | 构建后测试索引 | `False` |
| `--test-only` | 仅测试现有索引 | `False` |
| `--index/-i` | 测试用索引路径 | 必需（测试时） |
| `--top-k` | 返回结果数量 | `4` |
| `--min-similarity` | 最小相似度阈值 | `0.35` |
| `--queries` | 自定义测试查询 | 内置查询 |
| `--verbose/-v` | 详细输出 | `False` |

## 输出文件

构建索引后会生成两个文件：
- `{output_path}.faiss`: FAISS 索引文件
- `{output_path}.json`: 元数据文件（包含文本块、来源、元数据）

## 测试验证

### 内置测试查询
1. "图书馆在哪里"
2. "如何使用实验室设备"
3. "学生活动中心的开放时间"
4. "计算机科学课程"
5. "校园安全规定"

### 验收标准
- ✅ 可重复构建：多次运行产生相同结果
- ✅ 相似度阈值：top_k=4 结果相似度 ≥0.35
- ✅ 索引持久化：生成 .faiss 和 .json 文件
- ✅ 文本分块：400-700 字符，80-120 重叠

## 示例输出

```
🔧 开始构建索引
数据文件: data/task_kb.jsonl
输出路径: indices/task_index
模型: BAAI/bge-small-zh-v1.5
分块大小: 550 重叠: 100
============================================================
✅ 索引构建完成: indices/task_index.faiss

🧪 开始测试索引...
✅ 查询: 图书馆在哪里
   找到 1 个结果 最高相似度: 0.459
   [1] 0.459 - 校园导览要点：1. 香港城市大学成立于1984年...

📊 测试总结
==================================================
总查询数: 5
成功查询数: 5
成功率: 100.0%
平均相似度: 0.540
相似度阈值: 0.35
✅ 测试通过: 满足相似度要求

🎉 操作完成!
```

## 编程接口

### 使用 EmbeddingService
```python
from app.services.embedder import EmbeddingService

# 初始化服务
service = EmbeddingService()

# 构建索引
texts = ["文本1", "文本2", "文本3"]
sources = ["source1", "source2", "source3"]
metadata = [{"key": "value"}, {}, {}]

index = service.build_index_from_texts(texts, sources, metadata)

# 保存索引
index_path, metadata_path = service.save_index("my_index")

# 加载索引
service.load_index("my_index")

# 搜索
results = service.search("查询文本", top_k=5)
```

## 故障排除

### 常见问题

1. **模型下载失败**
   - 检查网络连接
   - 设置 HuggingFace 镜像：`export HF_ENDPOINT=https://hf-mirror.com`

2. **内存不足**
   - 减少 chunk_size 参数
   - 使用更小的模型

3. **路径错误**
   - 确保输出目录存在
   - 使用绝对路径

4. **相似度过低**
   - 检查数据质量
   - 调整 min_similarity 阈值
   - 增加文本分块重叠

### 性能优化

- 使用 GPU：安装 `faiss-gpu` 替代 `faiss-cpu`
- 批量处理：增大批处理大小
- 索引优化：对大数据集使用 IVF 索引

## 依赖要求

见 `requirements_embedding.txt`:
```
sentence-transformers>=2.2.0
faiss-cpu>=1.7.0
numpy>=1.21.0
torch>=1.9.0