import paramiko
import sys

server = "103.179.97.107"
user = "root"
password = "Bkb@1234"

commands = [
    "cd /var/www/smarterp && git log --oneline -3",
    "cd /var/www/smarterp && git status",
    "cd /var/www/smarterp && git fetch origin && git reset --hard origin/main 2>&1",
    "cd /var/www/smarterp && pm2 restart smarterp-backend --no-color 2>&1 || echo PM2_RESTART_DONE",
    "cd /var/www/smarterp && pm2 status --no-color 2>&1 || echo PM2_STATUS_DONE",
    "echo DEPLOY_SUCCESS"
]

log = open("deploy_log.txt", "w", encoding='utf-8')

def plog(msg):
    print(msg, flush=True)
    log.write(msg + "\n")
    log.flush()

plog(f"Connecting to {server}...")

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(server, username=user, password=password, timeout=30)
    plog("Connected!")
    
    for cmd in commands:
        plog(f"\n>>> {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd, timeout=120)
        try:
            out = stdout.read().decode('utf-8', errors='replace')
            err = stderr.read().decode('utf-8', errors='replace')
        except Exception as e:
            plog(f"Read error: {e}")
            continue
        if out:
            plog(f"OUT:\n{out}")
        if err:
            plog(f"ERR:\n{err}")

    plog("\n=== DEPLOYMENT COMPLETE ===")
    
except Exception as e:
    plog(f"ERROR: {e}")
    sys.exit(1)
finally:
    client.close()
    log.close()
