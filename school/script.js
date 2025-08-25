document.addEventListener('DOMContentLoaded', () => {
    const studentNameInput = document.getElementById('studentName');
    const rollNumberInput = document.getElementById('rollNumber');
    const addStudentBtn = document.getElementById('addStudentBtn');
    const studentListTable = document.getElementById('studentList').getElementsByTagName('tbody')[0];
    const attendanceListTable = document.getElementById('attendanceList').getElementsByTagName('tbody')[0];
    const attendanceDateInput = document.getElementById('attendanceDate');
    const saveAttendanceBtn = document.getElementById('saveAttendanceBtn');

    let students = JSON.parse(localStorage.getItem('students')) || [];

    // Set default date to today
    attendanceDateInput.valueAsDate = new Date();

    const renderStudents = () => {
        studentListTable.innerHTML = '';
        attendanceListTable.innerHTML = '';
        students.sort((a, b) => a.rollNumber - b.rollNumber);
        students.forEach(student => {
            // Render student list
            const studentRow = studentListTable.insertRow();
            studentRow.innerHTML = `
                <td>${student.rollNumber}</td>
                <td>${student.name}</td>
                <td><button class="delete-btn" data-id="${student.id}">Delete</button></td>
            `;

            // Render attendance list
            const attendanceRow = attendanceListTable.insertRow();
            attendanceRow.innerHTML = `
                <td>${student.rollNumber}</td>
                <td>${student.name}</td>
                <td>
                    <select data-id="${student.id}">
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="late">Late</option>
                    </select>
                </td>
            `;
        });
    };

    const addStudent = () => {
        const name = studentNameInput.value.trim();
        const rollNumber = rollNumberInput.value.trim();

        if (name && rollNumber) {
            const newStudent = {
                id: Date.now(),
                name,
                rollNumber: parseInt(rollNumber)
            };
            students.push(newStudent);
            localStorage.setItem('students', JSON.stringify(students));
            studentNameInput.value = '';
            rollNumberInput.value = '';
            renderStudents();
        }
    };

    const deleteStudent = (id) => {
        students = students.filter(student => student.id !== id);
        localStorage.setItem('students', JSON.stringify(students));
        renderStudents();
    };

    addStudentBtn.addEventListener('click', addStudent);

    studentListTable.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const studentId = parseInt(e.target.getAttribute('data-id'));
            deleteStudent(studentId);
        }
    });

    const saveAttendance = () => {
        const date = attendanceDateInput.value;
        if (!date) {
            alert('Please select a date.');
            return;
        }

        const attendanceData = {
            date,
            records: []
        };

        const attendanceRows = attendanceListTable.getElementsByTagName('tr');
        for (let row of attendanceRows) {
            const studentId = parseInt(row.querySelector('select').getAttribute('data-id'));
            const status = row.querySelector('select').value;
            attendanceData.records.push({ studentId, status });
        }

        let allAttendance = JSON.parse(localStorage.getItem('attendance')) || [];
        // Remove any existing record for the same date
        allAttendance = allAttendance.filter(item => item.date !== date);
        allAttendance.push(attendanceData);
        localStorage.setItem('attendance', JSON.stringify(allAttendance));
        alert('Attendance saved successfully!');
    };

    const loadAttendance = () => {
        const date = attendanceDateInput.value;
        const allAttendance = JSON.parse(localStorage.getItem('attendance')) || [];
        const todaysAttendance = allAttendance.find(item => item.date === date);

        if (todaysAttendance) {
            const attendanceRows = attendanceListTable.getElementsByTagName('tr');
            for (let row of attendanceRows) {
                const studentId = parseInt(row.querySelector('select').getAttribute('data-id'));
                const record = todaysAttendance.records.find(r => r.studentId === studentId);
                if (record) {
                    row.querySelector('select').value = record.status;
                }
            }
        } else {
            // Reset to default if no record found
            const attendanceRows = attendanceListTable.getElementsByTagName('tr');
            for (let row of attendanceRows) {
                row.querySelector('select').value = 'present';
            }
        }
    };

    saveAttendanceBtn.addEventListener('click', saveAttendance);
    attendanceDateInput.addEventListener('change', loadAttendance);

    renderStudents();
    loadAttendance();
});
