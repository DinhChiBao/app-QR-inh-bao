let qrList = [];
let html5OrCode= null;

const input = document.getElementById('qrInput');
const message = document.getElementById('message');
const tableBody = document.querySelector('#qrTable tbody');
const searchInput = document.getElementById('searchInput');

// Enter to add QR
input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    e.preventDefault();
    addQR();
  }
});

// Search
searchInput.addEventListener('input', function () {
  const keyword = this.value.toLowerCase();
  const rows = tableBody.querySelectorAll('tr');
  rows.forEach(row => {
    const qrCode = row.cells[1].textContent.toLowerCase();
    row.style.display = qrCode.includes(keyword) ? '' : 'none';
  });
});

function addQR() {
  const raw = input.value.trim();

  // Tách tất cả theo xuống dòng, dấu phẩy hoặc tab
  const values = raw.split(/[\n\r,]+/);

  let duplicateMessage = '';
  let added = 0;

  values.forEach((code) => {
    code = code.trim();
    if (!code) return;

    const index = qrList.indexOf(code);
    if (index !== -1) {
      duplicateMessage += `❌ Trùng dòng ${index + 1}: ${code}\n`;
    } else {
      qrList.push(code);
      added++;
    }
  });

  if (duplicateMessage) {
    message.textContent = duplicateMessage.trim();
  } else {
    message.textContent = `${added} mã đã được thêm thành công!`;
  }

  input.value = '';
  input.focus();
  renderTable();
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

// 📷 QR SCAN
async function startScan() {
  if (html5QrCode) {
    html5QrCode.clear().catch(()=>{});
    html5QrCode = null;
  }

  html5QrCode = new Html5Qrcode("video", { formatsToSupport: [ Html5QrcodeSupportedFormats.QR_CODE ] });
  try {
    const devices = await Html5Qrcode.getCameras();
    if (!devices || !devices.length) {
      return alert("Không tìm thấy camera");
    }
    // Ưu tiên camera sau
    const back = devices.find(d => d.label.toLowerCase().includes('back'));
    const camId = back ? back.id : devices[0].id;

    html5QrCode.start(
      camId,
      { fps: 10, qrbox: 250 },
      decoded => {
        input.value = decoded;
        addQR();
        stopScan();
      },
      err => {}
    );
    document.getElementById('video').style.display = 'block';
  } catch(e) {
    alert("Lỗi mở camera: " + e);
  }
}
function stopScan() {
  if (html5QrCode) {
    html5QrCode.stop()
      .then(() => {
        document.getElementById('video').style.display = 'none';
      })
      .catch(err => console.error(err));
  }
}

// ⬇️ Xuất Excel
function exportToExcel() {
  const ws = XLSX.utils.json_to_sheet(qrList.map((code, index) => ({
    STT: index + 1,
    "Mã QR": code
  })));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "DanhSachQR");
  XLSX.writeFile(wb, "ma_qr.xlsx");
}
