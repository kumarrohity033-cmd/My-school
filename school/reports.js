document.addEventListener('DOMContentLoaded', () => {
    const reportDateInput = document.getElementById('reportDate');
    const generateReportBtn = document.getElementById('generateReportBtn');
    const downloadCsvBtn = document.getElementById('downloadCsvBtn');
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    let attendanceChart;

    // Set default date to today
    reportDateInput.valueAsDate = new Date();

    const generateReport = () => {
        const date = reportDateInput.value;
        if (!date) {
            alert('Please select a date.');
            return;
        }

        const allAttendance = JSON.parse(localStorage.getItem('attendance')) || [];
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const reportData = allAttendance.find(item => item.date === date);

        if (!reportData) {
            alert('No attendance data found for this date.');
            if(attendanceChart) attendanceChart.destroy();
            return;
        }

        const presentCount = reportData.records.filter(r => r.status === 'present').length;
        const absentCount = reportData.records.filter(r => r.status === 'absent').length;
        const lateCount = reportData.records.filter(r => r.status === 'late').length;

        if (attendanceChart) {
            attendanceChart.destroy();
        }

        attendanceChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Present', 'Absent', 'Late'],
                datasets: [{
                    label: 'Attendance',
                    data: [presentCount, absentCount, lateCount],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(255, 206, 86, 0.7)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    };

    const downloadCsv = () => {
        const date = reportDateInput.value;
        if (!date) {
            alert('Please select a date to download.');
            return;
        }

        const allAttendance = JSON.parse(localStorage.getItem('attendance')) || [];
        const students = JSON.parse(localStorage.getItem('students')) || [];
        const reportData = allAttendance.find(item => item.date === date);

        if (!reportData) {
            alert('No attendance data found for this date.');
            return;
        }

        let csvContent = "data:text/csv;charset=utf-8,Roll Number,Name,Status\n";
        reportData.records.forEach(record => {
            const student = students.find(s => s.id === record.studentId);
            if (student) {
                csvContent += `${student.rollNumber},${student.name},${record.status}\n`;
            }
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `attendance_report_${date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    generateReportBtn.addEventListener('click', generateReport);
    downloadCsvBtn.addEventListener('click', downloadCsv);
    
    // Generate report for the default date on page load
    generateReport();
});
