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

### 4. Deploy to Vercel

- Push your repo to GitHub
- Connect to [Vercel](https://vercel.com/import)
- Set up project (no env vars needed by default)
- Deploy and share the public link

## Findings Summary

*To be filled by students after analysis.*

## Submission Checklist

- [ ] Dataset generated and committed (`data/students.csv`)
- [ ] Notebook runs end-to-end and exports PNGs/models
- [ ] Dashboard displays all required charts, table, and insights
- [ ] Model artifacts saved in `models/`
- [ ] Clusters/personas visible in dashboard
- [ ] README and SUBMISSION.md completed
- [ ] Deployed to Vercel and public URL provided

## Deadline

**Submission deadline:** `YYYY-MM-DDTHH:MM:SS+05:30` (update as instructed)

---

For detailed submission and branch/PR instructions, see `SUBMISSION.md`.
"# Student-Data-Analyzer" 
