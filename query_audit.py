import paramiko

server = "103.179.97.107"
user = "root"
password = "Bkb@1234"

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(server, username=user, password=password, timeout=30)
    # Using npx prisma query which might not exist or work directly as expected.
    # Better: Use a custom script or just a raw SQL query via psql if available.
    # Assuming the DB is PostgreSQL and we use prisma raw query or similar.
    # Let's try raw SQL via psql.
    db_url = "postgresql://postgres:postgres@localhost:5432/smarterp"
    cmd = f"psql {db_url} -c 'SELECT * FROM \"AuditLog\" ORDER BY \"createdAt\" DESC LIMIT 5;'"
    
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode('utf-8', errors='replace')
    err = stderr.read().decode('utf-8', errors='replace')
    if out: print(f"OUT:\n{out}")
    if err: print(f"ERR:\n{err}")
    
except Exception as e:
    print(f"ERROR: {e}")
finally:
    client.close()
