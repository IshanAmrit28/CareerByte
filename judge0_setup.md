# How to Self-Host Judge0 for this Project

To use the coding interface, you need a running instance of Judge0. The easiest way to do this is using Docker Compose.

## Prerequisites
- **Docker** and **Docker Compose** must be installed on your machine.
- If you are on Windows, ensure **WSL2** is enabled and Docker Desktop is configured to use it.

## Setup Steps

### 1. Download the Judge0 Docker Compose Project
Open your terminal and run the following commands to download the official Judge0 setup:

```bash
# Create a directory for Judge0
mkdir judge0-instance
cd judge0-instance

# Download the latest docker-compose.yml and judge0.conf
curl -L https://github.com/judge0/judge0/releases/download/v1.13.0/judge0-v1.13.0.zip -o judge0.zip
unzip judge0.zip
```

### 2. Configure Judge0 (Optional)
The default configuration in `judge0.conf` is usually sufficient for local development. However, you can edit it to change passwords or resource limits if needed.

### 3. Start Judge0
Run the following command to start the Judge0 server, worker, database, and Redis cache in the background:

```bash
docker-compose up -d
```

### 4. Verify Installation
Check if the service is running by visiting:
[http://localhost:2358/healthcheck](http://localhost:2358/healthcheck)

You should see a JSON response: `{"status":"OK"}`.

### 5. Update Project Configuration
Once Judge0 is running, ensure your backend knows where to find it.

1. Open `backend/.env`.
2. Add or update the following line:
   ```env
   JUDGE0_URL=http://localhost:2358
   ```
3. Restart your backend server.

## Common Issues
- **Port Conflict**: If port `2358` is already in use, you can change it in the `docker-compose.yml` file under the `server` service ports mapping.
- **Resource Limits**: If the code times out frequently, check the CPU/Memory allocation for Docker in your system settings.
