# sklearn_templates

Mẫu sklearn (retail / domain predictor). Cần `pandas` + `scikit-learn` để chạy.

- `retail_predictor.py` — dự đoán sales retail (RandomForest)
- `your_domain_predictor.py` — template predictor tùy domain

Chưa import trong `mia_models/__init__.py`. Khi cần: thêm dependency và wire endpoint trong `main_simple.py`.
