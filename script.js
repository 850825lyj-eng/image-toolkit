const fileInput = document.getElementById('fileInput');
const uploadArea = document.getElementById('uploadArea');
const controls = document.getElementById('controls');
const qualityRange = document.getElementById('qualityRange');
const qualityValue = document.getElementById('qualityValue');
const originalImage = document.getElementById('originalImage');
const compressedImage = document.getElementById('compressedImage');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const downloadBtn = document.getElementById('downloadBtn');

let currentFile = null;
let compressedBlob = null;

uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    if (e.dataTransfer.files.length) {
        handleFile(e.dataTransfer.files[0]);
    }
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFile(e.target.files[0]);
    }
});

qualityRange.addEventListener('input', () => {
    qualityValue.textContent = qualityRange.value;
    if (currentFile) {
        compressImage(currentFile, qualityRange.value / 100);
    }
});

function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return;
    }
    currentFile = file;
    originalImage.src = URL.createObjectURL(file);
    originalSize.textContent = '大小: ' + (file.size / 1024).toFixed(2) + ' KB';
    controls.style.display = 'block';
    compressImage(file, qualityRange.value / 100);
}

function compressImage(file, quality) {
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            let outputType = file.type;
            let formatNote = '';
            if (file.type === 'image/png') {
                outputType = 'image/jpeg';
                formatNote = '（已自动转为JPG，PNG不支持质量压缩）';
            }

            canvas.toBlob(function(blob) {
                if (!blob) return;
                compressedBlob = blob;
                if (compressedImage.src && compressedImage.src.startsWith('blob:')) {
                    URL.revokeObjectURL(compressedImage.src);
                }
                compressedImage.src = URL.createObjectURL(blob);
                compressedSize.innerHTML = '大小: ' + (blob.size / 1024).toFixed(2) + ' KB <span style="color:#e67e22;font-size:12px;">' + formatNote + '</span>';
            }, outputType, quality);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

downloadBtn.addEventListener('click', function() {
    if (!compressedBlob) {
        alert('请先上传并压缩图片');
        return;
    }
    const url = URL.createObjectURL(compressedBlob);
    const a = document.createElement('a');
    a.href = url;
    let ext = currentFile.name.split('.').pop();
    if (currentFile.type === 'image/png') {
        ext = 'jpg';
    }
    a.download = 'compressed_' + Date.now() + '.' + ext;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function() { URL.revokeObjectURL(url); }, 1000);

    downloadBtn.textContent = '✓ 下载完成';
    downloadBtn.classList.add('downloaded');
    setTimeout(function() {
        downloadBtn.textContent = '下载压缩后的图片';
        downloadBtn.classList.remove('downloaded');
    }, 2000);
});