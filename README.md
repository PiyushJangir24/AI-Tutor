# AI-Tutor
Autonomous AI Tutor Orchestrator

## Quick Demo (Video Solution Assets)

Video materials live in `video/`:
- `video/outline.txt` — chapter outline
- `video/script.txt` — narration script (~5 min)
- `video/captions.vtt` — captions
- `video/checklist.txt` — recording checklist
- `video/slides.html` — title card (open in a browser)
- `video/mock-server.js` — zero-dependency mock API

### Run locally

In two terminals:

Terminal A (mock API):

```bash
cd frontend
npm install  # first run only
npm run mock:api
```

Terminal B (frontend):

```bash
cd frontend
npm run dev
```

Then open `http://localhost:5173`. The frontend is configured via `frontend/.env.local` to call `http://localhost:8000`.

### What to show in the recording
- Adjust `Teaching Style`, `Emotional State`, and `Mastery Level`
- Type a prompt like: "Please make notes about the solar system"
- Toggle `Hidden Trace`
- Click `Run Note Maker`, then `Run Flashcard Generator`
- (Optional) Stop the mock API to show the error banner

Refer to `video/checklist.txt` for step-by-step guidance.
