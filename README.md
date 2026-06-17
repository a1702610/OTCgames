# OTC Training Game — Setup Guide

<img width="1694" height="1128" alt="image" src="https://github.com/user-attachments/assets/bd047e2b-1153-45b6-b102-7674dd7ef72c" />




This guide will walk you through getting the app running on your computer for the first time.

---

## What You Need First

Before starting, you need to install two free programs. You only need to do this once.

### 1. Install Git
Git is what lets you download (clone) the project from GitHub.

- Go to **https://git-scm.com/downloads**
- Download the version for Windows
- Run the installer — click Next through all the steps, the defaults are fine

### 2. Install Node.js
Node.js is what runs the app on your computer.

- Go to **https://nodejs.org**
- Download the **LTS** version (the left button — "Recommended For Most Users")
- Run the installer — click Next through all the steps, the defaults are fine

---

## Step 1 — Clone the Repository

"Cloning" means downloading a copy of the project to your computer.

1. Open **File Explorer** and navigate to where you want to save the project (e.g. your Desktop or Documents). Note the app will work quicker if it is saved onto your local operating system rather than the university network drive.
2. Click on the address bar at the top of File Explorer, type `cmd`, and press **Enter** — this opens a Command Prompt in that folder
3. Copy and paste the following command, then press **Enter**:

```
git clone https://github.com/a1702610/OTCgames.git
```

4. Wait for it to finish — it will download the app and all medication images (~1.4 GB, may take a few minutes depending on your internet)
5. When done, you will see a new folder called `OTCgames` has appeared

---

## Step 2 — Install Dependencies

This downloads the small code packages the app needs to run. You only need to do this once after cloning.

1. Open the `OTCgames` folder
2. Click on the address bar at the top of File Explorer, type `cmd`, and press **Enter**
3. Type the following and press **Enter**:

```
npm install
```

4. Wait for it to finish (usually under a minute)

---

## Step 3 — Run the App

From now on, this is all you need to do to start the app:

1. Open the `OTCgames` folder
2. Double-click **start.bat**
3. A terminal window will open — wait until you see a message saying the server is running
4. Your browser will open automatically with the app

To stop the app, just close the terminal window.

---

## About the Medication Image Library

All medication images are stored inside the project folder at:
```
OTCgames\public\medications\
```

These images are included in the repository, so they download automatically when you clone. You do not need to set anything up separately.

The image library is managed by one person (Jimit). When new products are added or images are updated, they run a sync script on their machine and push the changes to GitHub. Everyone else just pulls to get the update (see below).

---

## Updating — When New Code or Images Are Available

If you are told that the app or image library has been updated, you do not need to re-clone the whole project. Just pull the latest changes:

1. Open the `OTCgames` folder
2. Click on the address bar at the top of File Explorer, type `cmd`, and press **Enter**
3. Type the following and press **Enter**:

```
git pull
```

4. Git will download only the files that changed — this may take a moment if many images were updated
5. Once it finishes, start the app as normal with **start.bat**

---

## Troubleshooting

**"git is not recognized"**
Git is not installed or your computer needs a restart after installing it. Re-install Git from https://git-scm.com/downloads, restart your computer, then try again.

**"npm is not recognized"**
Node.js is not installed or your computer needs a restart after installing it. Re-install Node.js from https://nodejs.org, restart your computer, then try again.

**The browser opens but shows a blank page or an error**
Make sure you opened the app via `start.bat` and not by double-clicking `index.html` directly. The app must be run through the terminal.

**Images are not showing (grey placeholder boxes)**
Run `git pull` to make sure you have the latest image library, then restart the app via `start.bat`.
