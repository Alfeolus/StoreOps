/* app.js */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot, doc, deleteDoc, updateDoc, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

// ==========================================
// KONFIGURASI FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyCVspOv-Hwg8DwoF7FvxbmRSyWl13CMLrI",
    authDomain: "karunia-jaya-f4d3d.firebaseapp.com",
    projectId: "karunia-jaya-f4d3d",
    storageBucket: "karunia-jaya-f4d3d.firebasestorage.app",
    messagingSenderId: "836390219519",
    appId: "1:836390219519:web:411202e783e36d15b7e6ca",
    measurementId: "G-RBHKPTD783"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// STATE GLOBAL
// ==========================================
let tokoAktif = null;
let dataToko = [];
let dataStok = [];
let dataRiwayat = [];
let dataKatalog = [];
let dataTransaksi = []; 

let unsubStok = null;
let unsubRiwayat = null;
let unsubKatalog = null;

lucide.createIcons();

// ==========================================
// KONTROL NAVIGASI (3 MENU UTAMA)
// ==========================================
window.bukaMenuUtama = (menu) => {
    const secGudang = document.getElementById('sectionGudang');
    const secKeuangan = document.getElementById('sectionKeuangan');
    const secAnalisa = document.getElementById('sectionAnalisa');
    
    const btnToko = document.getElementById('navTokoBtn');
    const btnKeuangan = document.getElementById('navKeuanganBtn');
    const btnAnalisa = document.getElementById('navAnalisaBtn');

    [secGudang, secKeuangan, secAnalisa].forEach(el => el.classList.add('hidden'));
    
    [btnToko, btnKeuangan, btnAnalisa].forEach(btn => {
        btn.className = "px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-bold rounded-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer flex items-center gap-1.5";
    });

    if (menu === 'toko') {
        secGudang.classList.remove('hidden');
        btnToko.classList.add('bg-white', 'text-indigo-600', 'shadow-sm');
        btnToko.classList.remove('text-slate-500', 'hover:text-slate-800');
    } else if (menu === 'keuangan') {
        secKeuangan.classList.remove('hidden');
        btnKeuangan.classList.add('bg-white', 'text-indigo-600', 'shadow-sm');
        btnKeuangan.classList.remove('text-slate-500', 'hover:text-slate-800');
    } else {
        secAnalisa.classList.remove('hidden');
        btnAnalisa.classList.add('bg-white', 'text-violet-600', 'shadow-sm');
        btnAnalisa.classList.remove('text-slate-500', 'hover:text-slate-800');
        cekStatusKunciGemini(); 
    }
};

// ==========================================
// KEUANGAN GLOBAL LISTENER
// ==========================================
onSnapshot(collection(db, "transaksi"), (snap) => {
    dataTransaksi = [];
    snap.forEach(doc => dataTransaksi.push({ id: doc.id, ...doc.data() }));
    dataTransaksi.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));
    renderKeuangan();
});

function renderKeuangan() {
    const tbody = document.getElementById('keuanganTableBody');
    if(!tbody) return;
    tbody.innerHTML = '';

    let sumPemasukan = 0; let sumPengeluaran = 0; let sumProfit = 0;

    if (dataTransaksi.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-400">Belum ada transaksi pengadaan maupun penjualan.</td></tr>`;
    } else {
        dataTransaksi.forEach(t => {
            const dateObj = new Date(t.tanggal);
            const tglStr = dateObj.toLocaleDateString('id-ID', {day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'});
            
            let isMasuk = t.tipe === 'Pemasukan';
            let badgeClass = isMasuk ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700';
            
            if(isMasuk) { sumPemasukan += t.total; sumProfit += (t.profit || 0); } 
            else { sumPengeluaran += t.total; }

            const tr = document.createElement('tr');
            tr.className = "hover:bg-slate-50 transition-colors group";
            tr.innerHTML = `
                <td class="py-3 px-5 text-slate-500 text-xs">${tglStr}</td>
                <td class="py-3 px-5">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeClass} inline-block mb-1">${t.tipe}</span><br>
                    <span class="font-bold text-slate-800 text-sm">${t.nama_barang}</span>
                </td>
                <td class="py-3 px-5 text-center font-bold text-slate-600">${t.qty}</td>
                <td class="py-3 px-5 text-right">
                    <span class="text-[10px] text-slate-400">@ Rp ${t.harga_satuan.toLocaleString('id-ID')}</span><br>
                    <span class="font-bold ${isMasuk ? 'text-emerald-600' : 'text-rose-600'} text-sm">Rp ${t.total.toLocaleString('id-ID')}</span>
                </td>
                <td class="py-3 px-5 text-right font-extrabold text-indigo-600">${isMasuk ? '+ Rp ' + (t.profit).toLocaleString('id-ID') : '-'}</td>
                <td class="py-3 px-5 text-center">
                    <button onclick="hapusTransaksiGlobal('${t.id}')" class="text-rose-500 hover:bg-rose-50 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" title="Hapus Histori Ini"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    document.getElementById('statPemasukan').innerText = `Rp ${sumPemasukan.toLocaleString('id-ID')}`;
    document.getElementById('statPengeluaran').innerText = `Rp ${sumPengeluaran.toLocaleString('id-ID')}`;
    document.getElementById('statProfit').innerText = `Rp ${sumProfit.toLocaleString('id-ID')}`;
    lucide.createIcons();
}

window.hapusTransaksiGlobal = async (id) => {
    if (confirm('Hapus log transaksi ini secara permanen? (Kalkulasi Pemasukan & Profit akan otomatis berubah)')) {
        try {
            await deleteDoc(doc(db, "transaksi", id));
            showToast('Log transaksi berhasil dihapus dari Buku Besar.', 'error');
        } catch (err) {
            showToast('Gagal menghapus transaksi.', 'error');
        }
    }
};

// ==========================================
// FITUR: ANALISA BISNIS & CHATBOT AI
// ==========================================
function cekStatusKunciGemini() {
    const keyLokal = localStorage.getItem('storeops_gemini_key');
    if (keyLokal) {
        document.getElementById('panelSetupGemini').classList.add('hidden');
        document.getElementById('kontenUtamaAI').classList.remove('hidden');
    } else {
        document.getElementById('panelSetupGemini').classList.remove('hidden');
        document.getElementById('kontenUtamaAI').classList.add('hidden');
    }
}

window.simpanKunciLokal = () => {
    const kunci = document.getElementById('inputKunciGemini').value.trim();
    if (!kunci) return showToast('Kunci tidak boleh kosong!', 'error');
    localStorage.setItem('storeops_gemini_key', kunci);
    showToast('Kunci berhasil disimpan di perangkat ini.');
    cekStatusKunciGemini();
};

window.hapusKunciLokal = () => {
    localStorage.removeItem('storeops_gemini_key');
    showToast('Kunci dihapus dari perangkat.', 'error');
    cekStatusKunciGemini();
};

window.mintaAnalisaGemini = async () => {
    const GEMINI_API_KEY = localStorage.getItem('storeops_gemini_key');
    if (!GEMINI_API_KEY) return showToast('API Key belum diatur!', 'error');

    let totalMasuk = 0, totalKeluar = 0, totalProfit = 0;
    let daftarBarangLaku = [];
    
    dataTransaksi.forEach(t => {
        if (t.tipe === 'Pemasukan') { 
            totalMasuk += t.total; totalProfit += (t.profit || 0); 
            daftarBarangLaku.push(`${t.nama_barang}`);
        } else { 
            totalKeluar += t.total; 
        }
    });

    const promptText = `
    Anda adalah Konsultan Bisnis. Analisa ringkasan keuangan ini:
    - Pemasukan Jual: Rp ${totalMasuk}
    - Pengeluaran Beli: Rp ${totalKeluar}
    - Laba Bersih: Rp ${totalProfit}
    - Produk terjual: ${daftarBarangLaku.slice(0,5).join(', ')}

    Berikan:
    1. Evaluasi ringkas mengenai cash flow.
    2. 3 rekomendasi strategi operasional yang praktis.
    Tulis dengan format rapi dan tidak terlalu panjang.
    `;

    const btn = document.getElementById('btnGenerateAI');
    const loadingBox = document.getElementById('loadingAI');
    const hasilBox = document.getElementById('hasilAIBox');
    
    btn.disabled = true; btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i> Memproses...`;
    loadingBox.classList.remove('hidden'); hasilBox.classList.add('hidden'); lucide.createIcons();

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: promptText }] }] })
        });
        if (!response.ok) throw new Error("Gagal mengambil data AI");
        const data = await response.json();
        let teksJawaban = data.candidates[0].content.parts[0].text;
        
        teksJawaban = teksJawaban.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*/g, '•').replace(/\n/g, '<br>');
        document.getElementById('teksHasilAI').innerHTML = teksJawaban;
        loadingBox.classList.add('hidden'); hasilBox.classList.remove('hidden');
    } catch (err) {
        showToast('API Key salah atau model tidak didukung.', 'error'); loadingBox.classList.add('hidden');
        hapusKunciLokal();
    } finally {
        btn.disabled = false; btn.innerHTML = `<i data-lucide="brain-circuit" class="w-5 h-5"></i> Generate Analisa Sekarang`; lucide.createIcons();
    }
};

window.kirimPesanChat = async (e) => {
    e.preventDefault();
    const GEMINI_API_KEY = localStorage.getItem('storeops_gemini_key');
    if (!GEMINI_API_KEY) return showToast('API Key belum diatur!', 'error');

    const inputEl = document.getElementById('chatInput');
    const pesanUser = inputEl.value.trim();
    if (!pesanUser) return;

    const chatHistoryEl = document.getElementById('chatHistory');
    const btnKirim = document.getElementById('btnKirimChat');

    const userBubble = `
        <div class="flex gap-3 flex-row-reverse">
            <div class="bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-none shadow-sm text-sm max-w-[85%]">${pesanUser}</div>
        </div>
    `;
    chatHistoryEl.insertAdjacentHTML('beforeend', userBubble);
    inputEl.value = '';
    chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;

    btnKirim.disabled = true;
    btnKirim.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>`;
    lucide.createIcons();

    let totalMasuk = 0, totalKeluar = 0, totalProfit = 0;
    dataTransaksi.forEach(t => {
        if (t.tipe === 'Pemasukan') { totalMasuk += t.total; totalProfit += (t.profit || 0); } 
        else { totalKeluar += t.total; }
    });
    
    const systemPrompt = `Info Toko -> Pemasukan: Rp${totalMasuk}, Pengeluaran: Rp${totalKeluar}, Laba: Rp${totalProfit}. Anda adalah asisten toko. Jawab singkat, ramah, dan solutif. Pertanyaan user: `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: systemPrompt + pesanUser }] }] })
        });
        if (!response.ok) throw new Error("API Key salah");
        
        const data = await response.json();
        let teksJawaban = data.candidates[0].content.parts[0].text;
        teksJawaban = teksJawaban.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\*/g, '•').replace(/\n/g, '<br>');

        const aiBubble = `
            <div class="flex gap-3">
                <div class="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center flex-shrink-0 text-violet-600"><i data-lucide="bot" class="w-4 h-4"></i></div>
                <div class="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 text-sm text-slate-700 max-w-[85%] leading-relaxed">${teksJawaban}</div>
            </div>
        `;
        chatHistoryEl.insertAdjacentHTML('beforeend', aiBubble);

    } catch (err) {
        const errBubble = `<div class="flex gap-3"><div class="bg-rose-100 text-rose-700 p-3 rounded-2xl rounded-tl-none text-xs">Maaf, koneksi gagal. Periksa kembali API Key Anda.</div></div>`;
        chatHistoryEl.insertAdjacentHTML('beforeend', errBubble);
    } finally {
        btnKirim.disabled = false;
        btnKirim.innerHTML = `<i data-lucide="send" class="w-5 h-5"></i>`;
        lucide.createIcons();
        chatHistoryEl.scrollTop = chatHistoryEl.scrollHeight;
    }
};

// ==========================================
// CRUD TOKO
// ==========================================
onSnapshot(collection(db, "toko"), (snap) => {
    dataToko = []; snap.forEach(doc => dataToko.push({ id: doc.id, ...doc.data() })); renderTokoCards();
});

function renderTokoCards() {
    const container = document.getElementById('daftarToko');
    if (!container) return; container.innerHTML = '';
    dataToko.forEach(toko => {
        const div = document.createElement('div');
        div.className = "glass-card p-5 rounded-2xl cursor-pointer hover:-translate-y-1 hover:shadow-md transition-all group flex items-center justify-between";
        div.onclick = () => bukaToko(toko.id, toko.nama);
        div.innerHTML = `
            <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors"><i data-lucide="store"></i></div>
                <div><h3 class="font-bold text-slate-800 text-sm">${toko.nama}</h3><p class="text-[11px] text-slate-400 mt-0.5">${toko.kategori}</p></div>
            </div>
            <div class="flex items-center gap-1" onclick="event.stopPropagation()">
                <button onclick="editToko('${toko.id}')" class="text-slate-400 hover:text-indigo-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all"><i data-lucide="edit-2" class="w-3.5 h-3.5"></i></button>
                <button onclick="hapusToko('${toko.id}')" class="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all"><i data-lucide="trash-2" class="w-3.5 h-3.5"></i></button>
            </div>
        `;
        container.appendChild(div);
    });
    lucide.createIcons();
}

window.simpanToko = async (e) => {
    e.preventDefault();
    const id = document.getElementById('editTokoId').value;
    const payload = { nama: document.getElementById('tokoNama').value, kategori: document.getElementById('tokoKategori').value, icon: 'store' };
    if (id) { await updateDoc(doc(db, "toko", id), payload); } else { await addDoc(collection(db, "toko"), payload); }
    resetTokoForm(); showToast('Toko disimpan.');
};
window.editToko = (id) => {
    const t = dataToko.find(s => s.id === id);
    if (t) { document.getElementById('editTokoId').value = t.id; document.getElementById('tokoNama').value = t.nama; document.getElementById('tokoKategori').value = t.kategori; document.getElementById('btnBatalToko').classList.remove('hidden'); }
};
window.hapusToko = async (id) => { if (confirm('Hapus toko ini?')) await deleteDoc(doc(db, "toko", id)); };
window.resetTokoForm = () => { document.getElementById('tokoForm').reset(); document.getElementById('editTokoId').value = ''; document.getElementById('btnBatalToko').classList.add('hidden'); };

// ==========================================
// GUDANG & PENGADAAN
// ==========================================
window.bukaToko = (id, nama) => {
    tokoAktif = id; document.getElementById('namaTokoLabel').innerText = nama;
    document.getElementById('viewDasbor').classList.add('hidden'); document.getElementById('viewDetail').classList.remove('hidden');
    switchTab('stok'); listenTokoData(id);
};
window.kembaliKeDasborToko = () => {
    tokoAktif = null; if (unsubStok) unsubStok(); if (unsubRiwayat) unsubRiwayat(); if (unsubKatalog) unsubKatalog();
    document.getElementById('viewDetail').classList.add('hidden'); document.getElementById('viewDasbor').classList.remove('hidden');
};
window.switchTab = (tab) => {
    const btns = [document.getElementById('tabStokBtn'), document.getElementById('tabRiwayatBtn'), document.getElementById('tabKatalogBtn')];
    const boxes = [document.getElementById('kontenStok'), document.getElementById('kontenRiwayat'), document.getElementById('kontenKatalog')];
    btns.forEach(b => b.className = "flex-1 py-2 text-xs font-bold rounded-lg text-slate-600 hover:text-slate-900 cursor-pointer");
    boxes.forEach(c => c.classList.add('hidden'));

    if (tab === 'stok') { btns[0].className = "flex-1 py-2 text-xs font-bold rounded-lg bg-white text-indigo-600 shadow-xs"; boxes[0].classList.remove('hidden'); }
    else if (tab === 'riwayat') { btns[1].className = "flex-1 py-2 text-xs font-bold rounded-lg bg-white text-indigo-600 shadow-xs"; boxes[1].classList.remove('hidden'); }
    else { btns[2].className = "flex-1 py-2 text-xs font-bold rounded-lg bg-white text-indigo-600 shadow-xs"; boxes[2].classList.remove('hidden'); }
};

function listenTokoData(tokoId) {
    if (unsubStok) unsubStok(); unsubStok = onSnapshot(query(collection(db, "inventaris"), where("toko_id", "==", tokoId)), (snap) => { dataStok = []; snap.forEach(doc => dataStok.push({ id: doc.id, ...doc.data() })); renderStokTable(); });
    if (unsubRiwayat) unsubRiwayat(); unsubRiwayat = onSnapshot(query(collection(db, "riwayat_pembelian"), where("toko_id", "==", tokoId)), (snap) => { dataRiwayat = []; snap.forEach(doc => dataRiwayat.push({ id: doc.id, ...doc.data() })); renderRiwayatLokalTable(); });
    if (unsubKatalog) unsubKatalog(); unsubKatalog = onSnapshot(query(collection(db, "katalog_produk"), where("toko_id", "==", tokoId)), (snap) => { dataKatalog = []; snap.forEach(doc => dataKatalog.push({ id: doc.id, ...doc.data() })); renderKatalogOrderBox(); renderMasterKatalogTable(); });
}

window.prosesBeliBarang = async (idKatalog) => {
    const prod = dataKatalog.find(item => item.id === idKatalog);
    const orderQty = parseInt(document.getElementById(`qty-${idKatalog}`).value);
    if (isNaN(orderQty) || orderQty <= 0) return showToast('Jumlah tidak valid!', 'error');

    try {
        const totalHargaBeli = prod.harga_jual * orderQty;
        const existingItem = dataStok.find(item => item.nama_produk === prod.nama_produk);
        if (existingItem) { await updateDoc(doc(db, "inventaris", existingItem.id), { stok: existingItem.stok + orderQty }); } 
        else { await addDoc(collection(db, "inventaris"), { toko_id: tokoAktif, nama_produk: prod.nama_produk, kategori: prod.kategori, harga_jual: prod.harga_jual, stok: orderQty }); }

        await addDoc(collection(db, "riwayat_pembelian"), { toko_id: tokoAktif, nama_produk: prod.nama_produk, jumlah: orderQty, total_harga: totalHargaBeli, tanggal: new Date().toISOString() });
        await addDoc(collection(db, "transaksi"), { toko_id: tokoAktif, tipe: 'Pengeluaran', nama_barang: prod.nama_produk, qty: orderQty, harga_satuan: prod.harga_jual, total: totalHargaBeli, profit: 0, tanggal: new Date().toISOString() });
        showToast(`Pembelian ${orderQty} ${prod.nama_produk} berhasil.`);
    } catch (err) { showToast('Gagal memproses!', 'error'); }
};

window.simpanKatalog = async (e) => {
    e.preventDefault(); const editId = document.getElementById('editKatalogId').value;
    const payload = { toko_id: tokoAktif, nama_produk: document.getElementById('katNama').value, kategori: document.getElementById('katKategori').value, harga_jual: parseInt(document.getElementById('katHarga').value) };
    if (editId) { await updateDoc(doc(db, "katalog_produk", editId), payload); } else { await addDoc(collection(db, "katalog_produk"), payload); }
    resetKatalogForm(); showToast('Katalog diperbarui');
};
window.editKatalogRow = (id) => {
    const item = dataKatalog.find(k => k.id === id);
    if(item) { document.getElementById('editKatalogId').value = item.id; document.getElementById('katNama').value = item.nama_produk; document.getElementById('katKategori').value = item.kategori; document.getElementById('katHarga').value = item.harga_jual; document.getElementById('btnBatalKatalog').classList.remove('hidden'); }
};
window.hapusKatalogRow = async (id) => { if(confirm('Hapus produk dari katalog?')) await deleteDoc(doc(db, "katalog_produk", id)); };
window.resetKatalogForm = () => { document.getElementById('katalogForm').reset(); document.getElementById('editKatalogId').value = ''; document.getElementById('btnBatalKatalog').classList.add('hidden'); };

function renderKatalogOrderBox() {
    const box = document.getElementById('katalogOrderContainer'); if (!box) return; box.innerHTML = '';
    dataKatalog.forEach(barang => {
        const div = document.createElement('div'); div.className = "bg-white/70 p-3 rounded-xl border border-slate-200/50 shadow-2xs flex flex-col gap-2";
        div.innerHTML = `
            <div class="flex justify-between items-start gap-2">
                <div><p class="font-bold text-xs text-slate-800">${barang.nama_produk}</p><span class="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded font-bold mt-0.5 inline-block">${barang.kategori}</span></div>
                <p class="text-xs font-extrabold text-slate-700">Rp ${barang.harga_jual.toLocaleString('id-ID')}</p>
            </div>
            <div class="flex gap-2 items-center mt-1">
                <input type="number" id="qty-${barang.id}" min="1" value="1" class="w-14 text-center border-0 bg-slate-100/80 rounded-lg py-1 text-xs font-bold">
                <button onclick="prosesBeliBarang('${barang.id}')" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-medium py-1.5 rounded-lg cursor-pointer flex justify-center gap-1"><i data-lucide="arrow-down-to-line" class="w-3.5 h-3.5"></i> Beli</button>
            </div>
        `;
        box.appendChild(div);
    }); lucide.createIcons();
}

function renderStokTable() {
    const tbody = document.getElementById('inventarisTableBody'); if (!tbody) return; tbody.innerHTML = '';
    let totalNilaiGudang = 0;
    dataStok.forEach(item => {
        const sub = item.harga_jual * item.stok; totalNilaiGudang += sub;
        const tr = document.createElement('tr'); tr.className = "hover:bg-slate-50/50 transition-colors group";
        tr.innerHTML = `
            <td class="py-3 px-5 font-bold text-slate-800">${item.nama_produk}<br><span class="text-[10px] text-slate-400 font-normal">${item.kategori}</span></td>
            <td class="py-3 px-5 text-right text-slate-600">Rp ${item.harga_jual.toLocaleString('id-ID')}</td>
            <td class="py-3 px-5 text-center font-bold text-slate-700">${item.stok}</td>
            <td class="py-3 px-5 text-right font-bold text-emerald-600">Rp ${sub.toLocaleString('id-ID')}</td>
            <td class="py-3 px-5 text-center">
                <button onclick="bukaModalLaku('${item.id}', '${item.nama_produk}', ${item.stok}, ${item.harga_jual})" class="text-[11px] bg-emerald-50 text-emerald-600 border border-emerald-200 py-1.5 px-3 rounded-lg font-bold cursor-pointer hover:bg-emerald-500 hover:text-white transition-colors">Jual</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
    const asetEl = document.getElementById('statTotalAset'); const prodEl = document.getElementById('statTotalProduk');
    if (asetEl) asetEl.innerText = `Rp ${totalNilaiGudang.toLocaleString('id-ID')}`; if (prodEl) prodEl.innerText = `${dataStok.length} Jenis`;
    lucide.createIcons();
}

function renderRiwayatLokalTable() {
    const tbody = document.getElementById('riwayatTableBody'); if (!tbody) return; tbody.innerHTML = '';
    const sorted = [...dataRiwayat].sort((a,b) => new Date(b.tanggal) - new Date(a.tanggal));
    sorted.forEach(log => {
        const dObj = new Date(log.tanggal); const tr = document.createElement('tr'); tr.className = "hover:bg-slate-50/50 transition-colors group";
        tr.innerHTML = `<td class="py-3 px-5 text-slate-500 text-xs">${dObj.toLocaleDateString('id-ID', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}</td><td class="py-3 px-5 font-bold text-slate-800">${log.nama_produk}</td><td class="py-3 px-5 text-center font-semibold text-slate-600">${log.jumlah} Unit</td><td class="py-3 px-5 text-right font-bold text-slate-700">Rp ${log.total_harga.toLocaleString('id-ID')}</td>`;
        tbody.appendChild(tr);
    });
}

function renderMasterKatalogTable() {
    const tbody = document.getElementById('masterKatalogTableBody'); if (!tbody) return; tbody.innerHTML = '';
    dataKatalog.forEach(k => {
        const tr = document.createElement('tr'); tr.className = "hover:bg-slate-50/50 transition-colors";
        tr.innerHTML = `
            <td class="py-3 px-5 font-semibold text-slate-800">${k.nama_produk}</td><td class="py-3 px-5 text-right font-bold text-slate-600">Rp ${k.harga_jual.toLocaleString('id-ID')}</td>
            <td class="py-3 px-5 text-center"><button onclick="editKatalogRow('${k.id}')" class="text-indigo-500 hover:bg-indigo-50 p-1.5 rounded cursor-pointer"><i data-lucide="edit-2" class="w-4 h-4"></i></button><button onclick="hapusKatalogRow('${k.id}')" class="text-rose-500 hover:bg-rose-50 p-1.5 rounded cursor-pointer"><i data-lucide="trash-2" class="w-4 h-4"></i></button></td>
        `;
        tbody.appendChild(tr);
    }); lucide.createIcons();
}

window.bukaModalLaku = (idInventaris, nama, stokSkarang, hargaBeliModal) => {
    document.getElementById('modalItemId').value = idInventaris;
    document.getElementById('modalStokMax').value = stokSkarang;
    document.getElementById('modalHargaBeli').value = hargaBeliModal;
    document.getElementById('modalNamaBarang').innerText = nama;
    document.getElementById('modalMaxLabel').innerText = stokSkarang;
    document.getElementById('modalHargaBeliLabel').innerText = `Rp ${hargaBeliModal.toLocaleString('id-ID')} / pcs`;

    const inputQty = document.getElementById('inputQtyLaku'); const inputJual = document.getElementById('inputHargaJual');
    inputQty.value = 1; inputQty.max = stokSkarang; inputJual.value = '';

    const modal = document.getElementById('modalLaku'); modal.classList.remove('hidden');
    setTimeout(() => { document.getElementById('modalOverlay').classList.replace('opacity-0', 'opacity-100'); document.getElementById('modalContent').classList.replace('scale-95', 'scale-100'); document.getElementById('modalContent').classList.replace('opacity-0', 'opacity-100'); }, 10);
    inputJual.focus();
};

window.tutupModalLaku = () => {
    document.getElementById('modalOverlay').classList.replace('opacity-100', 'opacity-0'); document.getElementById('modalContent').classList.replace('scale-100', 'scale-95'); document.getElementById('modalContent').classList.replace('opacity-100', 'opacity-0');
    setTimeout(() => { document.getElementById('modalLaku').classList.add('hidden'); }, 300);
};

window.konfirmasiLaku = async () => {
    const idInventaris = document.getElementById('modalItemId').value;
    const stokSkarang = parseInt(document.getElementById('modalStokMax').value);
    const modalBeliSatu = parseInt(document.getElementById('modalHargaBeli').value);
    const namaBarang = document.getElementById('modalNamaBarang').innerText;
    
    const hargaJualKePelanggan = parseInt(document.getElementById('inputHargaJual').value);
    const qtyLaku = parseInt(document.getElementById('inputQtyLaku').value);

    if (isNaN(hargaJualKePelanggan) || hargaJualKePelanggan <= 0) return showToast('Masukkan harga jual yang valid!', 'error');
    if (isNaN(qtyLaku) || qtyLaku <= 0 || qtyLaku > stokSkarang) return showToast('Jumlah Qty tidak valid!', 'error');

    try {
        if (stokSkarang - qtyLaku === 0) { await deleteDoc(doc(db, "inventaris", idInventaris)); } 
        else { await updateDoc(doc(db, "inventaris", idInventaris), { stok: stokSkarang - qtyLaku }); }

        const totalPemasukan = hargaJualKePelanggan * qtyLaku;
        const totalProfit = (hargaJualKePelanggan - modalBeliSatu) * qtyLaku;

        await addDoc(collection(db, "transaksi"), {
            toko_id: tokoAktif, tipe: 'Pemasukan', nama_barang: namaBarang, qty: qtyLaku,
            harga_satuan: hargaJualKePelanggan, harga_modal_satuan: modalBeliSatu,
            total: totalPemasukan, profit: totalProfit, tanggal: new Date().toISOString()
        });
        showToast(`Sukses menjual ${qtyLaku} unit. Profit: Rp ${totalProfit.toLocaleString('id-ID')}`);
        tutupModalLaku();
    } catch (err) { showToast('Gagal memproses penjualan.', 'error'); }
};

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer'); if (!container) return;
    const toast = document.createElement('div'); toast.className = `${type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'} text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium transition-all duration-300 toast-enter`;
    toast.innerHTML = `<i data-lucide="${type === 'success' ? 'check' : 'alert-circle'}" class="w-5 h-5"></i> ${message}`;
    container.appendChild(toast); lucide.createIcons();
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

// ==========================================
// EXPOSE CORE FUNCTIONS TO WINDOW
// ==========================================
window.prosesBeliBarang = prosesBeliBarang;
window.hapusRiwayatLog = hapusRiwayatLog;
window.simpanKatalog = simpanKatalog;
window.editKatalogRow = editKatalogRow;
window.hapusKatalogRow = hapusKatalogRow;
window.hapusStokLangsung = hapusStokLangsung;
window.simpanToko = simpanToko;
window.editToko = editToko;
window.hapusToko = hapusToko;
window.resetTokoForm = resetTokoForm;
window.bukaToko = bukaToko;
window.kembaliKeDasborToko = kembaliKeDasborToko;
window.switchTab = switchTab;
window.bukaModalLaku = bukaModalLaku;
window.tutupModalLaku = tutupModalLaku;
window.konfirmasiLaku = konfirmasiLaku;