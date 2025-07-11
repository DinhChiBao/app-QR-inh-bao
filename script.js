let qrList = [];

const input = document.getElementById('qrInput');
const message = document.getElementById('message');
const tableBody = document.querySelector('#qrTable tbody');
const searchInput = document.getElementById('searchInput');

// Nhập bằng Enter
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addQR();
  }
});

// Tìm kiếm
searchInput.addEventListener('input', function () {
  const keyword = this.value.toLowerCase();
  const rows = tableBody.querySelectorAll('tr');

  rows.forEach(row => {
    const qrCode = row.cells[1].textContent.toLowerCase();
    row.style.display = qrCode.includes(keyword) ? '' : 'none';
  });
});

function addQR() {
  const value = input.value.trim();

  if (!value) {
    message.textContent = 'Vui lòng nhập mã QR!';
    return;
  }

  const duplicateIndex = qrList.indexOf(value);
  if (duplicateIndex !== -1) {
    message.textContent = `❌ Mã đã tồn tại ở dòng ${duplicateIndex + 1}`;
  } else {
    qrList.push(value);
    message.textContent = '';
    renderTable();
  }

  input.select();
}

function renderTable() {
  tableBody.innerHTML = '';

  qrList.forEach((code, index) => {
    const row = tableBody.insertRow();
    row.insertCell(0).textContent = index + 1;
    row.insertCell(1).textContent = code;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑️';
    deleteBtn.onclick = () => deleteQR(index);
    row.insertCell(2).appendChild(deleteBtn);
  });
}

function deleteQR(index) {
  qrList.splice(index, 1);
  renderTable();
}

function clearAll() {
  if (confirm('Bạn có chắc muốn xóa tất cả mã QR?')) {
    qrList = [];
    renderTable();
  }
}
// Dark Mode toggle
document.getElementById("toggleDarkMode").addEventListener("click", () => {
  document.body.classList.toggle("dark");
});
function exportCSV() {
  if (qrList.length === 0) {
    alert('Danh sách trống!');
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,STT,Mã QR\n";
  qrList.forEach((code, index) => {
    csvContent += `${index + 1},${code}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "danhsach_ma_qr.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
let html5QrCode;
const qrInput = document.getElementById('qrInput');

function startScanner() {
  html5QrCode = new Html5Qrcode("reader");
  
  Html5Qrcode.getCameras().then(devices => {
    if (devices && devices.length) {
      // Ưu tiên chọn camera sau nếu có
      const backCamera = devices.find(device => device.label.toLowerCase().includes('back'));
      const cameraId = backCamera ? backCamera.id : devices[0].id;

      html5QrCode.start(
        cameraId,
        { fps: 10, qrbox: 250 },
        qrCodeMessage => {
          qrInput.value = qrCodeMessage;
          addQR();
          stopScanner();
        },
        error => {
          // Xử lý lỗi đọc QR (không cần làm gì nếu không muốn)
        }
      ).catch(err => {
        alert("Không thể mở camera: " + err);
      });
    } else {
      alert("Không tìm thấy camera nào");
    }
  }).catch(err => {
    alert("Không thể truy cập camera: " + err);
  });
}


