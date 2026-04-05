import paramiko
import sys

server = "103.179.97.107"
user = "root"
password = "Bkb@1234"

commands = [
    "cd /var/www/smarterp && npx prisma migrate status",
    "cd /var/www/smarterp && npx prisma generate"
]

log = open("prisma_check_log.txt", "w", encoding='utf-8')

def plog(msg):
    log.write(str(msg) + "\n")
    log.flush()

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(server, username=user, password=password, timeout=30)
    plog("Connected!")
    for cmd in commands:
        plog(f"\n>>> {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd, timeout=300)
        out = stdout.read().decode('utf-8', errors='replace')
        err = stderr.read().decode('utf-8', errors='replace')
        if out: plog(f"OUT:\n{out}")
        if err: plog(f"ERR:\n{err}")
    plog("\n=== Prisma Check Done ===")
except Exception as e:
    plog(f"ERROR: {e}")
finally:
    client.close()
    log.close()
