FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY requirements.txt pyproject.toml ./
RUN python -m pip install --no-cache-dir -r requirements.txt

COPY fraud_detection ./fraud_detection
RUN mkdir -p /app/artifacts/candidates

CMD ["python", "-m", "fraud_detection", "serve"]
