import paramiko

server = "103.179.97.107"
user = "root"
password = "Bkb@1234"

unlock_script_content = """
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@smarterp.in';
  console.log(`Unlocking account: ${email}`);
  
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) {
    console.log('User not found!');
    return;
  }
  
  await prisma.user.update({
    where: { id: user.id },
    data: {
      failedLoginAttempts: 0,
      lockedUntil: null,
      isActive: true
    }
  });
  
  console.log('Account UNLOCKED successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
"""

client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    client.connect(server, username=user, password=password)
    print("Connected!")
    
    # Write the script on the server
    sftp = client.open_sftp()
    with sftp.file('/var/www/smarterp/server/unlock_admin.js', 'w') as f:
        f.write(unlock_script_content)
    sftp.close()
    
    # Run the script
    stdin, stdout, stderr = client.exec_command('cd /var/www/smarterp/server && node unlock_admin.js')
    print(stdout.read().decode())
    print(stderr.read().decode())
    
    print("FINISHED")
except Exception as e:
    print(f"Error: {e}")
finally:
    client.close()
