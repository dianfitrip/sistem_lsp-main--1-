import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import { 
  Search, Eye, CheckCircle, XCircle, 
  User, Mail, Phone, MapPin, Briefcase, Calendar, School, Loader2 
} from 'lucide-react';
import './adminstyles/VerifikasiPendaftaran.css';

const VerifikasiPendaftaran = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // State Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // --- FETCH DATA ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/pendaftaran');
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'Gagal mengambil data pendaftaran', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- HANDLERS ---
  
  const handleApprove = async (id) => {
    const result = await Swal.fire({
      title: 'Verifikasi Pendaftaran?',
      text: "Sistem akan membuat akun User untuk Asesi ini.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Verifikasi',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#10B981', 
      cancelButtonColor: '#6B7280'
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: 'Memproses...',
        text: 'Sedang membuat akun...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      try {
        await api.post(`/admin/pendaftaran/${id}/approve`);
        Swal.fire('Berhasil!', 'Akun Asesi telah dibuat.', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan', 'error');
      }
    }
  };

  const handleReject = async (id) => {
    const result = await Swal.fire({
      title: 'Tolak Pendaftaran?',
      text: "Status akan diubah menjadi Rejected.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Tolak',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#EF4444',
    });

    if (result.isConfirmed) {
      try {
        await api.post(`/admin/pendaftaran/${id}/reject`);
        Swal.fire('Ditolak', 'Pendaftaran telah ditolak.', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Error', 'Gagal menolak pendaftaran', 'error');
      }
    }
  };

  // Filter Data
  const filteredData = data.filter(item => 
    item.nama_lengkap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.nik.includes(searchTerm) ||
    item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
  };

  const openDetailModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  return (
    <div className="verifikasi-page">
      {/* Header & Stats */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Verifikasi Pendaftaran</h1>
          <p className="page-subtitle">Kelola validasi data calon asesi baru</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-label">Total Pending</span>
            <span className="stat-value text-orange-500">
              {data.filter(i => i.status === 'pending').length}
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar / Filter */}
      <div className="toolbar-section">
        <div className="search-wrapper">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            className="search-input"
            placeholder="Cari Nama, NIK, atau Email..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
      </div>

      {/* Modern Table */}
      <div className="table-wrapper">
        {loading ? (
          <div className="loading-state">
            <Loader2 className="animate-spin text-blue-500" size={40} />
            <p>Memuat data...</p>
          </div>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th width="5%">No</th>
                <th width="25%">Identitas Asesi</th>
                <th width="20%">Data Akademik</th>
                <th width="15%">Tanggal Daftar</th>
                <th width="10%">Status</th>
                <th width="25%" className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={item.id_pendaftaran} className="table-row">
                    <td>{index + 1}</td>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          <User size={16} />
                        </div>
                        <div>
                          <div className="user-name">{item.nama_lengkap}</div>
                          <div className="user-nik">{item.nik}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="meta-info">
                        <div className="meta-item font-medium">{item.program_studi}</div>
                        <div className="meta-item text-xs text-gray-500">{item.kompetensi_keahlian}</div>
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        <Calendar size={12} className="inline mr-1"/>
                        {formatDate(item.tanggal_daftar)}
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${item.status}`}>
                        {item.status === 'pending' && 'Menunggu'}
                        {item.status === 'approved' && 'Terverifikasi'}
                        {item.status === 'rejected' && 'Ditolak'}
                      </span>
                    </td>
                    <td>
                      {/* --- PERUBAHAN DI SINI: MENGGUNAKAN BUTTON TEKS --- */}
                      <div className="action-buttons-text">
                        <button 
                          className="btn-text btn-detail-text" 
                          onClick={() => openDetailModal(item)}
                        >
                          <Eye size={14} /> Detail
                        </button>
                        
                        {item.status === 'pending' && (
                          <>
                            <button 
                              className="btn-text btn-approve-text" 
                              onClick={() => handleApprove(item.id_pendaftaran)}
                            >
                              <CheckCircle size={14} /> Verifikasi
                            </button>
                            <button 
                              className="btn-text btn-reject-text" 
                              onClick={() => handleReject(item.id_pendaftaran)}
                            >
                              <XCircle size={14} /> Tolak
                            </button>
                          </>
                        )}
                      </div>
                      {/* -------------------------------------------------- */}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    <div className="empty-content">
                      <Search size={48} className="text-gray-300 mb-2"/>
                      <p>Tidak ada data pendaftaran ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Detail Modern */}
      {showModal && selectedItem && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header-modern">
              <div>
                <h3>Detail Pendaftaran</h3>
                <p className="text-sm opacity-80">Informasi lengkap calon asesi</p>
              </div>
              <button className="btn-close-modern" onClick={closeModal}>
                <XCircle size={24}/>
              </button>
            </div>
            
            <div className="modal-body-scroll">
              <div className={`status-banner ${selectedItem.status}`}>
                Status: {selectedItem.status.toUpperCase()}
              </div>

              <div className="detail-grid-modern">
                <div className="detail-col">
                  <div className="detail-group">
                    <h4 className="group-title"><User size={16}/> Identitas Diri</h4>
                    <div className="detail-row">
                      <span className="label">Nama Lengkap</span>
                      <span className="value">{selectedItem.nama_lengkap}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">NIK</span>
                      <span className="value">{selectedItem.nik}</span>
                    </div>
                  </div>

                  <div className="detail-group">
                    <h4 className="group-title"><School size={16}/> Akademik</h4>
                    <div className="detail-row">
                      <span className="label">Program Studi</span>
                      <span className="value">{selectedItem.program_studi}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Kompetensi</span>
                      <span className="value">{selectedItem.kompetensi_keahlian}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Wilayah RJI</span>
                      <span className="value">{selectedItem.wilayah_rji}</span>
                    </div>
                  </div>
                </div>

                <div className="detail-col">
                  <div className="detail-group">
                    <h4 className="group-title"><Phone size={16}/> Kontak</h4>
                    <div className="detail-row">
                      <span className="label">Email</span>
                      <span className="value text-blue-600">{selectedItem.email}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">No HP</span>
                      <span className="value">{selectedItem.no_hp}</span>
                    </div>
                  </div>

                  <div className="detail-group">
                    <h4 className="group-title"><MapPin size={16}/> Alamat Domisili</h4>
                    <div className="address-box">
                      <p>{selectedItem.kelurahan}, {selectedItem.kecamatan}</p>
                      <p>{selectedItem.kota}, {selectedItem.provinsi}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer-modern">
              <button className="btn-secondary" onClick={closeModal}>Tutup</button>
              {selectedItem.status === 'pending' && (
                <button className="btn-primary" onClick={() => {
                  closeModal();
                  handleApprove(selectedItem.id_pendaftaran);
                }}>
                  <CheckCircle size={16} className="mr-2"/> Verifikasi Sekarang
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifikasiPendaftaran;