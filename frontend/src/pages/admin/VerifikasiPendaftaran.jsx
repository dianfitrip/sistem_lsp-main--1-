import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  Search, Eye, CheckCircle, XCircle, 
  User, MapPin, Calendar, School, Loader2, Filter 
} from 'lucide-react';
import './adminstyles/VerifikasiPendaftaran.css';

const VerifikasiPendaftaran = () => {
  // --- STATE ---
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // --- 1. FETCH DATA (SESUAIKAN DENGAN BACKEND GET ALL) ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // Backend: router.get("/pendaftaran", pendaftaranController.getAll);
      const response = await api.get('/admin/pendaftaran');
      
      // Backend Response Format: { status: "success", data: [...] }
      // Kita ambil array datanya dengan aman
      const resultData = response.data.data || []; 
      
      setData(resultData);
      setFilteredData(resultData);
      
    } catch (error) {
      console.error("Error fetching data:", error);
      // Jangan tampilkan alert error jika server mati/500, cukup log saja agar UX tidak terganggu
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. CLIENT-SIDE SEARCH (Filter di Frontend) ---
  useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data);
    } else {
      const lower = searchTerm.toLowerCase();
      const filtered = data.filter(item => 
        (item.nama_lengkap && item.nama_lengkap.toLowerCase().includes(lower)) ||
        (item.nik && item.nik.includes(lower)) ||
        (item.email && item.email.toLowerCase().includes(lower))
      );
      setFilteredData(filtered);
    }
  }, [searchTerm, data]);

  // --- 3. APPROVE HANDLER ---
  const handleApprove = async (id) => {
    // Konfirmasi dulu
    const result = await Swal.fire({
      title: 'Verifikasi Pendaftaran?',
      text: "Sistem akan membuat akun User & Profile untuk pendaftar ini.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Ya, Verifikasi!'
    });

    if (result.isConfirmed) {
      try {
        // Tampilkan Loading saat proses backend berjalan
        Swal.fire({
          title: 'Memproses...',
          text: 'Mohon tunggu, sedang mengirim email kredensial...',
          allowOutsideClick: false,
          didOpen: () => Swal.showLoading()
        });

        // Backend: router.post("/pendaftaran/:id/approve", ...);
        // Payload kosong {} dikirim karena backend pakai req.params.id
        await api.post(`/admin/pendaftaran/${id}/approve`, {});

        Swal.fire('Berhasil!', 'Pendaftaran disetujui & akun telah dibuat.', 'success');
        fetchData(); // Refresh data tabel
      } catch (error) {
        console.error("Approve error:", error);
        const msg = error.response?.data?.message || 'Terjadi kesalahan pada server (Cek Backend).';
        Swal.fire('Gagal', msg, 'error');
      }
    }
  };

  // --- 4. REJECT HANDLER ---
  const handleReject = async (id) => {
    const result = await Swal.fire({
      title: 'Tolak Pendaftaran?',
      text: "Pendaftar akan menerima notifikasi penolakan.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#64748B',
      confirmButtonText: 'Ya, Tolak'
    });

    if (result.isConfirmed) {
      try {
        Swal.fire({ title: 'Memproses...', didOpen: () => Swal.showLoading() });
        
        // Backend: router.post("/pendaftaran/:id/reject", ...);
        await api.post(`/admin/pendaftaran/${id}/reject`, {});

        Swal.fire('Ditolak', 'Pendaftaran telah ditolak.', 'success');
        fetchData();
      } catch (error) {
        console.error("Reject error:", error);
        Swal.fire('Gagal', 'Gagal menolak pendaftaran.', 'error');
      }
    }
  };

  // --- MODAL HELPERS ---
  const openDetail = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  // --- STATUS BADGE HELPER ---
  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <span className="status-badge status-approved"><CheckCircle size={14}/> Terverifikasi</span>;
      case 'rejected':
        return <span className="status-badge status-rejected"><XCircle size={14}/> Ditolak</span>;
      default:
        return <span className="status-badge status-pending"><Loader2 size={14} className="animate-spin"/> Menunggu</span>;
    }
  };

  return (
    <div className="verifikasi-page">
      {/* HEADER */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Verifikasi Pendaftaran</h1>
          <p className="page-subtitle">Validasi data calon asesi dari form pendaftaran</p>
        </div>
      </div>

      {/* SEARCH */}
      <div className="filter-section-card">
        <div className="search-input-wrapper">
          <Search className="search-icon" size={20} />
          <input 
            type="text" 
            placeholder="Cari NIK, Nama, atau Email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE */}
      {loading ? (
        <div className="loading-state">
          <Loader2 className="animate-spin text-orange-500" size={48} />
          <p>Memuat data...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="modern-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Info Asesi</th>
                <th>Program Studi / Keahlian</th>
                <th>Tanggal Daftar</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.id_pendaftaran}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="user-info-cell">
                        <div className="user-icon-bg"><User size={16}/></div>
                        <div>
                          <div className="font-bold text-gray-900">{item.nama_lengkap}</div>
                          <div className="text-xs text-gray-500">{item.nik}</div>
                          <div className="text-xs text-blue-500">{item.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm font-medium">{item.program_studi}</div>
                      <div className="text-xs text-gray-500">{item.kompetensi_keahlian}</div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar size={14}/>
                        {item.tanggal_daftar ? new Date(item.tanggal_daftar).toLocaleDateString('id-ID') : '-'}
                      </div>
                    </td>
                    <td>{getStatusBadge(item.status)}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon-view" onClick={() => openDetail(item)} title="Detail">
                          <Eye size={18} />
                        </button>
                        
                        {/* Tombol Aksi HANYA muncul jika status PENDING */}
                        {item.status === 'pending' && (
                          <>
                            <button 
                              className="btn-icon-check" 
                              onClick={() => handleApprove(item.id_pendaftaran)}
                              title="Setujui"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button 
                              className="btn-icon-reject" 
                              onClick={() => handleReject(item.id_pendaftaran)}
                              title="Tolak"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div className="flex flex-col items-center py-8">
                      <Filter size={48} className="text-gray-300 mb-2"/>
                      <p className="text-gray-500">Data tidak ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showModal && selectedItem && (
        <div className="modal-backdrop">
          <div className="modal-card modal-lg">
            <div className="modal-header-modern">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <User size={24}/>
                </div>
                <div>
                  <h3 className="text-lg font-bold">Detail Pendaftaran</h3>
                  <p className="text-xs text-gray-500">
                    ID: #{selectedItem.id_pendaftaran}
                  </p>
                </div>
              </div>
              <button onClick={closeModal} className="close-btn"><XCircle size={24}/></button>
            </div>

            <div className="modal-content-scroll">
              <div className="grid-modern">
                {/* Kolom Kiri: Identitas */}
                <div className="detail-section">
                  <h4 className="group-title"><User size={16}/> Data Pribadi</h4>
                  <div className="detail-row"><span className="label">NIK</span><span className="value">{selectedItem.nik}</span></div>
                  <div className="detail-row"><span className="label">Nama</span><span className="value">{selectedItem.nama_lengkap}</span></div>
                  <div className="detail-row"><span className="label">Email</span><span className="value text-blue-600">{selectedItem.email}</span></div>
                  <div className="detail-row"><span className="label">No HP</span><span className="value">{selectedItem.no_hp}</span></div>
                </div>

                {/* Kolom Kanan: Akademik & Lokasi */}
                <div className="detail-section">
                  <h4 className="group-title"><School size={16}/> Akademik & Lokasi</h4>
                  <div className="detail-row"><span className="label">Prodi</span><span className="value">{selectedItem.program_studi}</span></div>
                  <div className="detail-row"><span className="label">Kompetensi</span><span className="value">{selectedItem.kompetensi_keahlian}</span></div>
                  <div className="detail-row"><span className="label">Wilayah RJI</span><span className="value">{selectedItem.wilayah_rji}</span></div>
                  
                  <h4 className="group-title mt-4"><MapPin size={16}/> Alamat</h4>
                  <div className="address-box">
                    <p className="font-medium">{selectedItem.alamat_lengkap}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {selectedItem.kelurahan}, {selectedItem.kecamatan}, {selectedItem.kota}, {selectedItem.provinsi}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-modern">
              <button className="btn-secondary" onClick={closeModal}>Tutup</button>
              
              {/* Tombol di Modal juga hanya muncul jika Pending */}
              {selectedItem.status === 'pending' && (
                <>
                  <button className="btn-danger-outline" onClick={() => { closeModal(); handleReject(selectedItem.id_pendaftaran); }}>
                    Tolak
                  </button>
                  <button className="btn-primary" onClick={() => { closeModal(); handleApprove(selectedItem.id_pendaftaran); }}>
                    <CheckCircle size={16} className="mr-2"/> Verifikasi
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifikasiPendaftaran;