from datasets import load_dataset
import json
import re
from pathlib import Path

OUTPUT_FILE = "russian_female_names.json"


def normalize_name(name: str) -> str:
    """
    Нормализация имени:
    - убираем пробелы
    - приводим к Title Case
    - убираем лишние символы
    """
    name = name.strip()
    name = re.sub(r"[^А-Яа-яЁё\-]", "", name)
    return name.capitalize()


def main():
    print("Loading dataset rustemgareev/russian-names...")
    dataset = load_dataset("rustemgareev/russian-names", split="train")

    print(f"Total records: {len(dataset)}")

    names_set = set()
    names_list = []

    for record in dataset:
        name = record.get("name_cyrl")
        gender = record.get("gender")

        if not name or gender != "f":
            continue

        normalized = name

        if normalized not in names_set:
            names_set.add(normalized)
            names_list.append(normalized)


    output_path = Path(OUTPUT_FILE)
    with output_path.open("w", encoding="utf-8") as f:
        json.dump(names_list, f, ensure_ascii=False, indent=2)

    print(f"Saved to {output_path.resolve()}")


if __name__ == "__main__":
    main()
