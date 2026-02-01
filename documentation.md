
# 📄 Onboarding & Documentation

## 📌 GitHub (**Synchronizing** code)

### If you're starting a new task:

1. Open your terminal and run:
   ```bash
   git checkout main
   git pull
   git checkout -b "name-of-your-task"
   git push
   ```
2. Git will likely return an error after the first `push`. Copy and run:
   ```bash
   git push --set-upstream origin name-of-your-task
   ```

### If you're continuing a task:

1. Make sure you're on your branch:
   ```bash
   git branch
   ```
2. Pull changes only if you **have no uncommitted changes**:
   ```bash
   git pull
   ```

### Saving progress with commits:
```bash
git commit -m "name of your changes"
git push
```

### When the task is finished – Create a PR:

1. Go to [GitHub repository](https://github.com/carlosedm10/SyncRoad)
2. Create a Pull Request
3. Make sure your branch is up to date. If there are conflicts, contact an admin.
4. Copy the URL of the PR and send it to the team.
5. Wait for review and approval.

🎉 Work done, great job!

---

## 🐳 Docker (Starting the engine)

1. Make sure the Docker app is running.
2. If new packages were installed:
   ```bash
   make build
   ```
3. Otherwise:
   ```bash
   make start
   ```
4. When you're done coding for the day:
   ```bash
   make stop
   ```
5. Then turn off the Docker app.

---

## 📦 Imports (Adding new libraries)

### Backend:

```bash
make connect-to-backend
poetry add package_name
# then in another terminal:
make build
```

### Frontend:

```bash
npm install "name-of-the-library"
make build
```

---

## 🛢️ Database

1. Connect to the database:
   ```bash
   make connect-to-database
   ```
2. SQL operations:
   - Show all tables:
     ```sql
     \dt
     ```
   - View all users:
     ```sql
     SELECT * FROM users;
     ```
   - Exit DB terminal: `Ctrl + D`

3. If you've changed any model fields:

   a. Delete the whole DB:
   ```sql
   DO $$ DECLARE
       r RECORD;
   BEGIN
       FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
           EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
       END LOOP;
   END $$;
   ```

   b. Create a new user via the API at:
   👉 [http://localhost:8000/docs#/](http://localhost:8000/docs#/)

---

## 🛠️ Tools and Extra Documentation

- 📁 Repositorio: [GitHub](https://github.com/carlosedm10/SyncRoad)
- 🧩 Schemas: [Excalidraw](https://excalidraw.com/#room=1bf53c95c768375c7d3d,QdrI9qpe4KwayOQ2x53t-A)
- 📹 Loom Tutorials:
  - [Commits](https://www.loom.com/share/2e640a6fbd6d400f8e3a0d1e6af2da31?sid=9119439d-0092-4ab3-99fb-e1ef65559ac9)
  - [Backend Logs](https://www.loom.com/share/da24912beab4472d9c3c4b6650cf2827?sid=40dbf7e2-c1ae-42e5-8f34-9ad0747d1cfe)
  - [Merge Branch](https://www.loom.com/share/aabea4f7df5b4826baddb6db56f73cc5?sid=fbc9edb3-5334-49d2-abf9-03a80266789e)
  - [Fix Merge Conflicts](https://www.loom.com/share/6f22c760b8784254bdead58461b16326?sid=2ad7a2d7-8a0c-440e-a648-f6102d8567c0)

---

🎉 **Happy Coding!**
