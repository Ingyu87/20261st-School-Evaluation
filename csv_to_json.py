# -*- coding: utf-8 -*-
"""CSV 파일의 모든 데이터를 빠짐없이 JSON으로 추출하는 스크립트"""

import csv
import json
import os
from pathlib import Path
from datetime import datetime


def read_csv_complete(filepath: Path) -> dict:
    """CSV 파일을 완전히 읽어 구조화된 dict로 반환"""
    with open(filepath, "r", encoding="utf-8-sig", newline="") as f:
        # 먼저 raw content도 보존
        raw_content = f.read()

    with open(filepath, "r", encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        all_rows = list(reader)

    if not all_rows:
        return {
            "source_file": filepath.name,
            "source_path": str(filepath),
            "extracted_at": datetime.now().isoformat(),
            "total_rows": 0,
            "header_row_count": 0,
            "data_row_count": 0,
            "column_count": 0,
            "headers": [],
            "records": [],
            "raw_rows": [],
        }

    headers = all_rows[0]
    data_rows = all_rows[1:]

    records = []
    for row_idx, row in enumerate(data_rows, start=2):
        padded_row = list(row)
        if len(padded_row) < len(headers):
            padded_row.extend([""] * (len(headers) - len(padded_row)))

        record = {}
        for i in range(len(padded_row)):
            key = headers[i] if i < len(headers) else f"_extra_column_{i}"
            record[key] = padded_row[i]
        for i in range(len(padded_row), len(headers)):
            record[headers[i]] = ""

        record["_row_number"] = row_idx
        record["_raw_cell_count"] = len(row)
        records.append(record)

    # 통계: 빈 셀 vs 데이터 셀
    total_cells = sum(len(r) for r in all_rows)
    non_empty_cells = sum(1 for r in all_rows for cell in r if cell.strip())

    return {
        "source_file": filepath.name,
        "source_path": str(filepath),
        "extracted_at": datetime.now().isoformat(),
        "file_size_bytes": filepath.stat().st_size,
        "encoding": "utf-8-sig",
        "total_rows_in_file": len(all_rows),
        "header_row_count": 1,
        "data_row_count": len(data_rows),
        "column_count": len(headers),
        "total_cells": total_cells,
        "non_empty_cells": non_empty_cells,
        "headers": headers,
        "header_details": [
            {
                "index": i,
                "name": h,
                "length": len(h),
            }
            for i, h in enumerate(headers)
        ],
        "records": records,
        "raw_rows": all_rows,
    }


def main():
    base_dir = Path(__file__).parent
    csv_files = sorted(base_dir.glob("*.csv"))

    if not csv_files:
        print("CSV 파일을 찾을 수 없습니다.")
        return

    output_dir = base_dir / "json_output"
    output_dir.mkdir(exist_ok=True)

    all_results = {
        "extraction_summary": {
            "extracted_at": datetime.now().isoformat(),
            "total_csv_files": len(csv_files),
            "output_directory": str(output_dir),
        },
        "files": [],
    }

    for csv_path in csv_files:
        print(f"처리 중: {csv_path.name}")
        result = read_csv_complete(csv_path)

        # 개별 JSON 파일 저장
        safe_name = csv_path.stem.replace(" ", "_")
        json_path = output_dir / f"{safe_name}.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)

        print(f"  -> 행: {result['data_row_count']}, 컬럼: {result['column_count']}, "
              f"셀(비어있지않음): {result['non_empty_cells']}")
        print(f"  -> 저장: {json_path.name}")

        all_results["files"].append({
            "source_file": result["source_file"],
            "json_output": json_path.name,
            "data_row_count": result["data_row_count"],
            "column_count": result["column_count"],
            "non_empty_cells": result["non_empty_cells"],
        })

    # 통합 JSON도 저장
    combined_path = output_dir / "all_csv_data.json"
    combined_data = {
        "extraction_summary": all_results["extraction_summary"],
        "files": [],
    }
    for csv_path in csv_files:
        combined_data["files"].append(read_csv_complete(csv_path))

    with open(combined_path, "w", encoding="utf-8") as f:
        json.dump(combined_data, f, ensure_ascii=False, indent=2)

    print(f"\n통합 JSON 저장: {combined_path.name}")
    print("완료!")


if __name__ == "__main__":
    main()
