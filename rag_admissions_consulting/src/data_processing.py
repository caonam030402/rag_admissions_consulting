import json
import csv
import re

json_path = ""
csv_path = ""


def clean_title(title):
    if not isinstance(title, str):
        return ""
    return re.sub(r"\s+", " ", title).strip()


def is_header(text):
    return isinstance(text, str) and text.strip().lower().startswith("header:")


def is_date(text):
    # Nhận diện các dòng chỉ là ngày tháng (dd/mm/yyyy, dd/mm/yy, d/m/yyyy, d/m/yy)
    return bool(re.match(r"^\d{1,2}/\d{1,2}/\d{2,4}$", text.strip()))


with open(json_path, "r", encoding="utf-8") as f:
    data = json.load(f)

with open(csv_path, "w", encoding="utf-8", newline="") as csvfile:
    writer = csv.writer(csvfile)
    writer.writerow(["Text"])
    for entry in data:
        title = clean_title(entry.get("title", ""))
        content = entry.get("content", [])
        filtered = []
        if isinstance(content, list):
            for c in content:
                c_text = str(c).strip()
                if not c_text or is_header(c_text) or is_date(c_text):
                    continue
                filtered.append(c_text)
        else:
            c_text = str(content).strip()
            if c_text and not is_header(c_text) and not is_date(c_text):
                filtered.append(c_text)
        # Gộp title + content
        if filtered:
            text = title + " " + " ".join(filtered) if title else " ".join(filtered)
            # Xóa tất cả xuống dòng, tab, nhiều khoảng trắng thành 1 khoảng trắng
            text = re.sub(r"[\n\r\t]+", " ", text)
            text = re.sub(r"\s+", " ", text)
            writer.writerow([text.strip()])

print(f"Đã xuất dữ liệu, mỗi entry 1 dòng, không khoảng trắng thừa, ra {csv_path}")
