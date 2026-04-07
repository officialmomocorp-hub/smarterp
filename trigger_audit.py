import requests
import json

base_url = "https://smarterpsolution.duckdns.org/api/v1"
admin_phone = "9111111111"
admin_pass = "123456"

def verify():
    # 1. Login
    print("Logging in...")
    login_res = requests.post(f"{base_url}/auth/login", json={
        "phone": admin_phone,
        "password": admin_pass
    })
    
    if not login_res.ok:
        print(f"Login failed: {login_res.text}")
        return
    
    token = login_res.json().get('token')
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful!")

    # 2. Get students
    print("Fetching students...")
    students_res = requests.get(f"{base_url}/students", headers=headers)
    if not students_res.ok:
        print(f"Failed to fetch students: {students_res.text}")
        return
    
    students = students_res.json().get('data', {}).get('students', [])
    if not students:
        print("No students found to test.")
        return
    
    student = students[0]
    student_id = student['id']
    print(f"Testing with student: {student.get('studentId')} (ID: {student_id})")

    # 3. Simulate a fee payment (or student update)
    # Let's try student update since it's simpler
    print("Updating student to trigger audit log...")
    update_res = requests.put(f"{base_url}/students/{student_id}", headers=headers, json={
        "status": "ACTIVE", # No real change, but should trigger update logic
        "remarks": "AUDIT_LOG_VERIFICATION_TEST"
    })
    
    if update_res.ok:
        print("Student update successful!")
    else:
        print(f"Student update failed: {update_res.text}")

if __name__ == "__main__":
    verify()
