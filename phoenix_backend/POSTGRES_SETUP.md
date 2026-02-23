# PostgreSQL Setup for Phoenix Backend

## 1. Install PostgreSQL

**Download:** https://www.postgresql.org/download/windows/

- Run the installer
- Set a password for the `postgres` user (remember it!)
- Default port: 5432 (keep it)

## 2. Update Config (if your password is different)

Edit `config/dev.exs` — change `password` if you didn't use `postgres`:

```elixir
config :phoenix_backend, PhoenixBackend.Repo,
  username: "postgres",
  password: "postgres",   # ← Change if you used a different password
  hostname: "localhost",
  database: "phoenix_backend_dev",
  ...
```

## 3. Create the Database

In Command Prompt (from `phoenix_backend` folder):

```cmd
cd c:\Users\Akhil\campus-transport\phoenix_backend
mix deps.get
mix ecto.create
```

If `mix ecto.create` succeeds, you're done.

## 4. Start the Server

```cmd
mix phx.server
```

Visit http://localhost:4000

---

## Troubleshooting

**"password authentication failed"** — Your PostgreSQL password doesn't match. Update `config/dev.exs` with your actual password.

**"could not connect to server"** — PostgreSQL service isn't running. In Windows Services, start "postgresql-x64-16" (or similar).
