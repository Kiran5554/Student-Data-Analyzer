# Cognitive Skills & Student Performance Dashboard

## Project Overview

This project analyzes the relationship between cognitive skills and student assessment performance using a synthetic dataset. It includes:
- A reproducible data generator
- Jupyter Notebook for EDA, modeling, clustering, and insights
- An interactive Next.js dashboard for visualization and exploration

## Repo Structure

```
repo-root/
├─ dashboard/                  # Next.js app (existing folder)
├─ notebooks/
│  └─ analysis.ipynb
├─ data/
│  ├─ students.csv             # generated dataset
│  └─ students_with_clusters.csv
├─ models/
│  └─ pipeline.pkl
├─ scripts/
│  └─ generate_students.py
├─ requirements.txt
├─ README.md
├─ .gitignore
```

## Setup & Usage

### 1. Generate Dataset

```bash
python scripts/generate_students.py --n 1000 --seed 42
```

### 2. Run Jupyter Notebook

```bash
pip install -r requirements.txt
jupyter notebook notebooks/analysis.ipynb
```

### 3. Run Dashboard Locally

```bash
cd dashboard
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.



