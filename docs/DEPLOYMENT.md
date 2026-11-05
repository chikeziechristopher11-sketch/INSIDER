# Getting the live site actually working

The code on `main` is fixed and ready. Three things still need to happen in the
**Vercel dashboard** — none of this can be done from GitHub or from code, it needs
whoever has access to the `insider` Vercel project.

## 1. Fix the Root Directory setting

This is the most important step. Right now the deployed site is missing its
backend entirely (`/api/*` returns 404) because Vercel is building from the wrong
folder.

1. Go to [vercel.com](https://vercel.com) and open the **insider** project.
2. Go to **Settings → Build and Deployment**.
3. Find **Root Directory**.
4. Clear it completely (leave it blank) so it points at the repo root.
5. Click **Save**.

## 2. Add the Groq API key

Without this, the interview room runs a basic fallback instead of the real AI.

1. Same project → **Settings → Environment Variables**.
2. Add a new variable:
   - **Key**: `GROQ_API_KEY`
   - **Value**: (Marvellous's Groq API key — from [console.groq.com](https://console.groq.com))
   - **Environments**: check Production and Preview
3. Click **Save**.

Nothing else is required — every other setting has a safe default.

## 3. Redeploy

Environment variable and Root Directory changes don't apply to deployments that
already happened.

1. Go to the **Deployments** tab.
2. Click the **⋯** menu on the latest deployment.
3. Click **Redeploy**.

(Or just push any new commit to `main` — that triggers a fresh deploy automatically
once the settings above are saved.)

## 4. Confirm it worked

Once the redeploy finishes, check these two URLs:

- `https://insider-gules.vercel.app/api/health` should return
  `"groq":"configured"` (not `"missing"`, and not a 404 page).
- `https://insider-gules.vercel.app/interview.html` — pick any company and role,
  and you should hear a real spoken question and get a real, adaptive follow-up
  based on what you actually say. If it repeats the same handful of scripted
  questions no matter what you answer, the API key step didn't take — double
  check step 2.

If `/api/health` still 404s after a redeploy, step 1 (Root Directory) is the one
that didn't save — go back and re-check it.
