# Tools by Athul

Four generative tools (Pattern, Form, Flare, Pin) behind one team password, with personal and shared team presets. Runs entirely on Vercel.

## What's in this folder

| File | What it does |
|---|---|
| `index.html` | Home page with the four tool cards |
| `pattern.html`, `form.html`, `flare.html`, `pin.html` | The tools |
| `login.html` | The password screen |
| `assets/ui.css` | Shared black, minimal look |
| `middleware.js` | The gatekeeper. Sends anyone without the password to the login screen |
| `api/login.js`, `api/logout.js` | Checks the password, signs people in and out |
| `api/presets.js` | Saves, lists and deletes team presets in Vercel Blob |
| `package.json`, `vercel.json` | Settings Vercel reads when it publishes the site |

## Setup, step by step

1. **Put the folder on GitHub.** On github.com, click **New repository**, name it `tools-by-athul`, keep it **Private**, and create it. On the next screen, choose **uploading an existing file**, drag in everything from this folder (not the folder itself), and click **Commit changes**.
2. **Import it into Vercel.** On vercel.com, click **Add New → Project**, pick the `tools-by-athul` repository, and click **Import**. Leave the framework as **Other** and don't change any build settings.
3. **Set the team password.** Before deploying, open **Environment Variables** on that same screen. Add the name `TEAM_PASSWORD` and type the password you want the team to use. Then click **Deploy**.
4. **Turn on team presets.** Open the project, go to the **Storage** tab, click **Create** and choose **Blob**. If it asks, pick **Private**. Connect it to this project for all environments. This adds a secret key (`BLOB_READ_WRITE_TOKEN`) for you.
5. **Redeploy** so the site picks up the storage key: **Deployments → ⋯ on the latest → Redeploy**.
6. Open your site's address, enter the password, and share both with the team.

## Everyday use

- **Change the password:** Settings → Environment Variables → edit `TEAM_PASSWORD`, then redeploy. Everyone has to sign in again.
- **Update a tool:** replace its file on GitHub. Vercel republishes automatically.
- **Presets:** *Mine* stay in each person's browser (Export/Import to back them up). *Team* presets live in Blob, so everyone sees them. Each team preset shows who saved it, and deleting asks twice.

## Notes

- Vercel's free Hobby plan is for personal, non-commercial use. For agency work, check whether you need Pro.
- If team presets won't save and the Blob store was created as Public, add an environment variable `BLOB_ACCESS` with the value `public` and redeploy.
