import argparse
import os
import numpy as np
import pandas as pd
from faker import Faker

# Set up Faker for name generation
fake = Faker()

# Default class groups
CLASS_GROUPS = ["10A", "10B", "10C", "11A", "11B", "12A"]


def generate_students(n=1000, seed=42, out_path="data/students.csv"):
    np.random.seed(seed)
    Faker.seed(seed)
    data = []
    for i in range(n):
        student_id = i + 1
        name = fake.name()
        class_group = np.random.choice(CLASS_GROUPS)
        comprehension = np.clip(np.random.normal(70, 15), 0, 100)
        attention = np.clip(np.random.normal(65, 18), 0, 100)
        focus = np.clip(np.random.normal(68, 17), 0, 100)
        retention = np.clip(np.random.normal(66, 16), 0, 100)
        engagement_time = np.clip(np.random.normal(180, 40), 30, 300)
        # Weighted sum for assessment_score + noise
        score = (
            0.25 * comprehension +
            0.20 * attention +
            0.20 * focus +
            0.20 * retention +
            0.15 * (engagement_time / 3) +
            np.random.normal(0, 8 + 0.1 * abs(70 - comprehension))
        )
        assessment_score = np.clip(score, 0, 100)
        data.append([
            student_id, name, class_group, comprehension, attention, focus, retention, engagement_time, assessment_score
        ])
    df = pd.DataFrame(data, columns=[
        "student_id", "name", "class", "comprehension", "attention", "focus", "retention", "engagement_time", "assessment_score"
    ])
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    df.to_csv(out_path, index=False)
    print(f"Generated {n} students to {out_path}")


def main():
    parser = argparse.ArgumentParser(description="Generate synthetic student dataset.")
    parser.add_argument("--n", type=int, default=1000, help="Number of students (default: 1000)")
    parser.add_argument("--seed", type=int, default=42, help="Random seed (default: 42)")
    parser.add_argument("--out", type=str, default="data/students.csv", help="Output CSV path")
    args = parser.parse_args()
    generate_students(n=args.n, seed=args.seed, out_path=args.out)

if __name__ == "__main__":
    main()
