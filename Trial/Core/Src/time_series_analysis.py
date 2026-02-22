"""
Time-series trend evaluation utilities (in-memory only).

Purpose:
- Apply Kalman filtering to smooth anomalies/outliers.
- Evaluate trend direction/strength from filtered data.
- Keep this logic outside database writes (evaluation-time only).
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Sequence, Tuple


@dataclass
class KalmanConfig:
    process_noise: float = 1e-2
    measurement_noise: float = 4e-1
    initial_error: float = 1.0
    anomaly_sigma_threshold: float = 3.0


@dataclass
class TrendResult:
    direction: str
    slope: float
    confidence: float
    anomaly_count: int
    points_used: int


@dataclass
class SeriesAnalysis:
    timestamps: List[int]
    raw_values: List[float]
    filtered_values: List[float]
    anomaly_indices: List[int]
    trend: TrendResult


def _to_float(value: Any) -> Optional[float]:
    try:
        if value is None:
            return None
        return float(value)
    except (TypeError, ValueError):
        return None


def _extract_metric(record: Dict[str, Any], metric_key: str) -> Optional[float]:
    # Supports both flattened and nested sensor payloads.
    if metric_key in record:
        return _to_float(record.get(metric_key))

    sensor = record.get("sensor")
    if isinstance(sensor, dict):
        return _to_float(sensor.get(metric_key))

    return None


def _extract_ts(record: Dict[str, Any]) -> Optional[int]:
    ts = record.get("ts")
    try:
        if ts is None:
            return None
        return int(ts)
    except (TypeError, ValueError):
        return None


def kalman_filter(values: Sequence[float], cfg: KalmanConfig) -> Tuple[List[float], List[int]]:
    """Returns (filtered_values, anomaly_indices)."""
    if not values:
        return [], []

    x = float(values[0])
    p = float(cfg.initial_error)

    filtered: List[float] = []
    anomalies: List[int] = []

    for i, z in enumerate(values):
        # Predict
        p_pred = p + cfg.process_noise
        x_pred = x

        # Innovation
        innovation = z - x_pred
        innovation_var = p_pred + cfg.measurement_noise
        innovation_std = max(innovation_var, 1e-9) ** 0.5

        is_anomaly = abs(innovation) > (cfg.anomaly_sigma_threshold * innovation_std)
        if is_anomaly:
            anomalies.append(i)

        # Downweight anomalous measurements
        r_eff = cfg.measurement_noise * (6.0 if is_anomaly else 1.0)

        # Update
        k = p_pred / (p_pred + r_eff)
        x = x_pred + k * innovation
        p = (1.0 - k) * p_pred

        filtered.append(x)

    return filtered, anomalies


def _linear_slope(xs: Sequence[float], ys: Sequence[float]) -> float:
    n = len(xs)
    if n < 2:
        return 0.0

    x_mean = sum(xs) / n
    y_mean = sum(ys) / n

    num = sum((x - x_mean) * (y - y_mean) for x, y in zip(xs, ys))
    den = sum((x - x_mean) ** 2 for x in xs)
    if den == 0:
        return 0.0
    return num / den


def evaluate_trend(timestamps: Sequence[int], filtered_values: Sequence[float], anomaly_count: int) -> TrendResult:
    n = min(len(timestamps), len(filtered_values))
    if n < 3:
        return TrendResult(
            direction="stable",
            slope=0.0,
            confidence=0.0,
            anomaly_count=anomaly_count,
            points_used=n,
        )

    ts0 = timestamps[0]
    xs = [max(0.0, (t - ts0) / 3600.0) for t in timestamps[:n]]  # hours from start
    ys = list(filtered_values[:n])

    slope = _linear_slope(xs, ys)

    # Scale confidence from slope magnitude and anomaly ratio.
    y_span = max(ys) - min(ys)
    slope_strength = min(1.0, abs(slope) / max(0.1, y_span / max(1.0, xs[-1] - xs[0])))
    anomaly_penalty = min(0.6, anomaly_count / max(1.0, n))
    confidence = max(0.0, min(1.0, slope_strength * (1.0 - anomaly_penalty)))

    if abs(slope) < 0.01:
        direction = "stable"
    elif slope > 0:
        direction = "up"
    else:
        direction = "down"

    return TrendResult(
        direction=direction,
        slope=slope,
        confidence=confidence,
        anomaly_count=anomaly_count,
        points_used=n,
    )


def analyze_metric_history(
    history: Sequence[Dict[str, Any]],
    metric_key: str,
    cfg: Optional[KalmanConfig] = None,
) -> SeriesAnalysis:
    """
    Analyze a metric from historical records in memory.

    Expected record examples:
    - {"ts": 1739990000, "sensor": {"temperature": 31.2}}
    - {"ts": 1739990000, "temperature": 31.2}
    """
    cfg = cfg or KalmanConfig()

    parsed: List[Tuple[int, float]] = []
    for rec in history:
        ts = _extract_ts(rec)
        val = _extract_metric(rec, metric_key)
        if ts is None or val is None:
            continue
        parsed.append((ts, val))

    parsed.sort(key=lambda x: x[0])

    timestamps = [t for t, _ in parsed]
    raw_values = [v for _, v in parsed]

    filtered_values, anomaly_indices = kalman_filter(raw_values, cfg)
    trend = evaluate_trend(timestamps, filtered_values, anomaly_count=len(anomaly_indices))

    return SeriesAnalysis(
        timestamps=timestamps,
        raw_values=raw_values,
        filtered_values=filtered_values,
        anomaly_indices=anomaly_indices,
        trend=trend,
    )


# Example usage (evaluation-only, no DB writes):
#
# docs = [
#   {"ts": 1739990000, "sensor": {"temperature": 30.2}},
#   {"ts": 1739990300, "sensor": {"temperature": 30.4}},
#   {"ts": 1739990600, "sensor": {"temperature": 45.0}},  # anomaly spike
# ]
# result = analyze_metric_history(docs, "temperature")
# print(result.trend)
