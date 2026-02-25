import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api"; 
import { getProvinsi, getKota, getKecamatan, getKelurahan } from "../../services/wilayah.service";
import { 
  Search, Plus, Eye, Edit2, Trash2, X, Save, 
  User as UserIcon, Loader2, Upload, FileSpreadsheet,
  Briefcase, GraduationCap, Home
} from 'lucide-react';
import './adminstyles/Asesor.css'; 

const Asesor = () => {
  // --- STATE UTAMA ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isDetailMode, setIsDetailMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  
  // Pagination
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // --- STATE WILAYAH ---
  const [provinsiList, setProvinsiList] = useState([]);
  const [kotaList, setKotaList] = useState([]);
  const [kecamatanList, setKecamatanList] = useState([]);
  const [kelurahanList, setKelurahanList] = useState([]);

  // --- FORM DATA ---
  const initialFormState = {
    // Wajib (User)
    email: '',
    no_hp: '',
    
    // Wajib (Profile)
    nik: '',
    nama_lengkap: '',
    
    // Opsional
    gelar_depan: '',
    gelar_belakang: '',
    jenis_kelamin: 'laki-laki',
    tempat_lahir: '',
    tanggal_lahir: '', // YYYY-MM-DD
    kebangsaan: 'Indonesia',
    
    // Pendidikan
    pendidikan_terakhir: '',
    tahun_lulus: '', // Integer
    institut_asal: '',
    
    // Alamat
    alamat: '',
    rt: '',
    rw: '',
    provinsi: '', // String Nama
    kota: '',     // String Nama
    kecamatan: '',// String Nama
    kelurahan: '',// String Nama
    kode_pos: '',
    
    // Kompetensi
    bidang_keahlian: '',
    no_reg_asesor: '',
    no_lisensi: '',
    masa_berlaku: '', // YYYY-MM-DD
    status_asesor: 'aktif'
  };

  const [formData, setFormData] = useState(initialFormState);

  // --- LOAD DATA ---
  useEffect(() => {
    fetchData();
  }, [pagination.page, searchTerm]);

  // Load Provinsi saat modal dibuka
  useEffect(() => {
    if (showModal) {
      fetchProvinsi();
    }
  }, [showModal]);

  // --- API FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/asesor', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search: searchTerm
        }
      });

      const result = response.data.data || response.data;
      if (Array.isArray(result)) {
        setData(result);
      } else if (result.rows) {
        setData(result.rows);
        setPagination(prev => ({ ...prev, total: result.count }));
      }
    } catch (error) {
      console.error("Error fetching:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProvinsi = async () => {
    try {
      const res = await getProvinsi();
      const list = res.data || res; 
      setProvinsiList(Array.isArray(list) ? list : []);
    } catch (err) { console.error("Gagal load provinsi", err); }
  };

  // --- HANDLER WILAYAH ---
  const handleProvinsiChange = async (e) => {
    const id = e.target.value; // ID (untuk API)
    const index = e.target.selectedIndex;
    const name = e.target.options[index].text; // Nama (untuk DB)

    setFormData({ ...formData, provinsi: name, kota: '', kecamatan: '', kelurahan: '' });
    setKotaList([]); setKecamatanList([]); setKelurahanList([]);

    if (id) {
      try {
        const res = await getKota(id);
        const list = res.data || res;
        setKotaList(Array.isArray(list) ? list : []);
      } catch (err) { console.error("Gagal load kota", err); }
    }
  };

  const handleKotaChange = async (e) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    const name = e.target.options[index].text;

    setFormData({ ...formData, kota: name, kecamatan: '', kelurahan: '' });
    setKecamatanList([]); setKelurahanList([]);

    if (id) {
      try {
        const res = await getKecamatan(id);
        const list = res.data || res;
        setKecamatanList(Array.isArray(list) ? list : []);
      } catch (err) { console.error("Gagal load kecamatan", err); }
    }
  };

  const handleKecamatanChange = async (e) => {
    const id = e.target.value;
    const index = e.target.selectedIndex;
    const name = e.target.options[index].text;

    setFormData({ ...formData, kecamatan: name, kelurahan: '' });
    setKelurahanList([]);

    if (id) {
      try {
        const res = await getKelurahan(id);
        const list = res.data || res;
        setKelurahanList(Array.isArray(list) ? list : []);
      } catch (err) { console.error("Gagal load kelurahan", err); }
    }
  };

  // --- FORM HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setKotaList([]); setKecamatanList([]); setKelurahanList([]);
    setIsEditMode(false); setIsDetailMode(false); setCurrentId(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const fetchDetail = async (id) => {
    try {
      const res = await api.get(`/admin/asesor/${id}`);
      const item = res.data.data || res.data;
      
      const toDateInput = (dateStr) => dateStr ? new Date(dateStr).toISOString().split('T')[0] : '';

      setFormData({
        email: item.User?.email || '', 
        no_hp: item.User?.no_hp || '', 
        nik: item.nik,
        nama_lengkap: item.nama_lengkap,
        gelar_depan: item.gelar_depan || '',
        gelar_belakang: item.gelar_belakang || '',
        jenis_kelamin: item.jenis_kelamin || 'laki-laki',
        tempat_lahir: item.tempat_lahir || '',
        tanggal_lahir: toDateInput(item.tanggal_lahir),
        kebangsaan: item.kebangsaan || 'Indonesia',
        pendidikan_terakhir: item.pendidikan_terakhir || '',
        tahun_lulus: item.tahun_lulus || '',
        institut_asal: item.institut_asal || '',
        alamat: item.alamat || '',
        rt: item.rt || '',
        rw: item.rw || '',
        provinsi: item.provinsi || '',
        kota: item.kota || '',
        kecamatan: item.kecamatan || '',
        kelurahan: item.kelurahan || '',
        kode_pos: item.kode_pos || '',
        bidang_keahlian: item.bidang_keahlian || '',
        no_reg_asesor: item.no_reg_asesor || '',
        no_lisensi: item.no_lisensi || '',
        masa_berlaku: toDateInput(item.masa_berlaku),
        status_asesor: item.status_asesor || 'aktif'
      });
      return true;
    } catch (error) {
      Swal.fire('Error', 'Gagal mengambil data detail', 'error');
      return false;
    }
  };

  const openEditModal = async (id) => {
    resetForm();
    const success = await fetchDetail(id);
    if (success) {
      setCurrentId(id);
      setIsEditMode(true);
      setShowModal(true);
    }
  };

  const openDetailModal = async (id) => {
    resetForm();
    const success = await fetchDetail(id);
    if (success) {
      setIsDetailMode(true);
      setShowModal(true);
    }
  };

  // --- SUBMIT HANDLE (DIPERBAIKI UNTUK ERROR HANDLING) ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validasi Input Wajib
    if (!formData.nik || !formData.email || !formData.nama_lengkap) {
      Swal.fire('Validasi', 'NIK, Email, dan Nama Lengkap wajib diisi', 'warning');
      return;
    }

    // 2. Sanitasi Data (PENTING: String kosong -> null agar DB tidak error)
    const payload = {
      ...formData,
      tahun_lulus: formData.tahun_lulus ? parseInt(formData.tahun_lulus) : null,
      tanggal_lahir: formData.tanggal_lahir || null,
      masa_berlaku: formData.masa_berlaku || null,
      rt: formData.rt === '' ? null : formData.rt,
      rw: formData.rw === '' ? null : formData.rw
    };

    try {
      if (isEditMode) {
        await api.put(`/admin/asesor/${currentId}`, payload);
        Swal.fire('Sukses', 'Data berhasil diperbarui', 'success');
      } else {
        await api.post('/admin/asesor', payload);
        Swal.fire('Sukses', 'Asesor baru berhasil ditambahkan', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Submit Error Detail:", error);
      
      // 3. Tangani Error dari Backend dengan Detail
      let errorMsg = 'Terjadi kesalahan server (Error 500).';
      
      // Jika Backend mengirim pesan error spesifik (misal: "Role ASESOR tidak ditemukan")
      if (error.response && error.response.data) {
        errorMsg = error.response.data.message || error.response.data.error || errorMsg;
      }

      Swal.fire('Gagal', errorMsg, 'error');
    }
  };

  const handleDelete = async (id) => {
    const confirm = await Swal.fire({
      title: 'Hapus Asesor?',
      text: "Data tidak bisa dikembalikan!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus'
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/admin/asesor/${id}`);
        Swal.fire('Terhapus', 'Data telah dihapus', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Gagal', 'Terjadi kesalahan saat menghapus', 'error');
      }
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    const file = e.target.elements[0].files[0];
    if (!file) return Swal.fire('Warning', 'Pilih file dulu', 'warning');

    const form = new FormData();
    form.append('file', file);

    try {
      await api.post('/admin/asesor/import', form);
      Swal.fire('Sukses', 'Import berhasil', 'success');
      setShowImportModal(false);
      fetchData();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.message || 'Import gagal', 'error');
    }
  };

  return (
    <div className="asesor-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Data Asesor</h1>
          <p className="page-subtitle">Manajemen data asesor LSP</p>
        </div>
        <div className="action-buttons-group">
          <button className="btn-action-secondary" onClick={() => setShowImportModal(true)}>
            <FileSpreadsheet size={18} /> Import
          </button>
          <button className="btn-action-primary" onClick={openCreateModal}>
            <Plus size={18} /> Tambah
          </button>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="content-card">
        <div className="search-bar-wrapper">
          <Search size={20} className="text-gray-400" />
          <input 
            type="text" 
            className="search-input" 
            placeholder="Cari nama atau NIK..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="p-8 text-center flex justify-center">
            <Loader2 className="animate-spin text-orange-500" size={40} />
          </div>
        ) : (
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Lengkap</th>
                  <th>NIK</th>
                  <th>Bidang Keahlian</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.length > 0 ? (
                  data.map((item, idx) => (
                    <tr key={item.id_user || idx}>
                      <td>{(pagination.page - 1) * pagination.limit + idx + 1}</td>
                      <td>
                        <div className="font-medium">
                          {item.gelar_depan} {item.nama_lengkap} {item.gelar_belakang}
                        </div>
                        <div className="text-xs text-gray-500">{item.User?.email}</div>
                      </td>
                      <td>{item.nik}</td>
                      <td>{item.bidang_keahlian || '-'}</td>
                      <td>
                        <span className={`px-2 py-1 rounded-full text-xs ${item.status_asesor === 'aktif' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.status_asesor}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => openDetailModal(item.id_user)} className="text-blue-500 hover:text-blue-700"><Eye size={18}/></button>
                          <button onClick={() => openEditModal(item.id_user)} className="text-yellow-500 hover:text-yellow-700"><Edit2 size={18}/></button>
                          <button onClick={() => handleDelete(item.id_user)} className="text-red-500 hover:text-red-700"><Trash2 size={18}/></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="text-center p-4">Data tidak ditemukan</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- MODAL UTAMA --- */}
      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-card wide-modal">
            <div className="modal-header-modern">
              <h3>{isDetailMode ? 'Detail' : isEditMode ? 'Edit' : 'Tambah'} Asesor</h3>
              <button onClick={() => setShowModal(false)}><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-body-scroll">
              
              {/* SECTION: AKUN */}
              <div className="form-section">
                <h4 className="section-title"><UserIcon size={18}/> Informasi Akun</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Email <span className="text-red-500">*</span></label>
                    <input 
                      type="email" name="email" 
                      value={formData.email} onChange={handleInputChange} 
                      disabled={isEditMode || isDetailMode} required
                    />
                  </div>
                  <div className="form-group">
                    <label>No HP <span className="text-red-500">*</span></label>
                    <input 
                      type="text" name="no_hp" 
                      value={formData.no_hp} onChange={handleInputChange} 
                      disabled={isEditMode || isDetailMode} required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: DATA PRIBADI */}
              <div className="form-section">
                <h4 className="section-title"><UserIcon size={18}/> Data Pribadi</h4>
                <div className="form-grid">
                  <div className="form-group">
                    <label>NIK <span className="text-red-500">*</span></label>
                    <input type="text" name="nik" value={formData.nik} onChange={handleInputChange} disabled={isDetailMode} required maxLength="16"/>
                  </div>
                  <div className="form-group">
                    <label>Nama Lengkap <span className="text-red-500">*</span></label>
                    <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleInputChange} disabled={isDetailMode} required/>
                  </div>
                  <div className="form-group">
                    <label>Gelar Depan</label>
                    <input type="text" name="gelar_depan" value={formData.gelar_depan} onChange={handleInputChange} disabled={isDetailMode} />
                  </div>
                  <div className="form-group">
                    <label>Gelar Belakang</label>
                    <input type="text" name="gelar_belakang" value={formData.gelar_belakang} onChange={handleInputChange} disabled={isDetailMode} />
                  </div>
                  <div className="form-group">
                    <label>Jenis Kelamin</label>
                    <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleInputChange} disabled={isDetailMode}>
                      <option value="laki-laki">Laki-laki</option>
                      <option value="perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Tempat Lahir</label>
                    <input type="text" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleInputChange} disabled={isDetailMode} />
                  </div>
                  <div className="form-group">
                    <label>Tanggal Lahir</label>
                    <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleInputChange} disabled={isDetailMode} />
                  </div>
                  <div className="form-group">
                    <label>Kebangsaan</label>
                    <input type="text" name="kebangsaan" value={formData.kebangsaan} onChange={handleInputChange} disabled={isDetailMode} />
                  </div>
                </div>
              </div>

              {/* SECTION: ALAMAT DOMISILI */}
              <div className="form-section">
                <h4 className="section-title"><Home size={18}/> Alamat</h4>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Alamat Lengkap</label>
                    <textarea name="alamat" rows="2" value={formData.alamat} onChange={handleInputChange} disabled={isDetailMode}></textarea>
                  </div>
                  <div className="form-group"><label>RT</label><input type="text" name="rt" value={formData.rt} onChange={handleInputChange} disabled={isDetailMode}/></div>
                  <div className="form-group"><label>RW</label><input type="text" name="rw" value={formData.rw} onChange={handleInputChange} disabled={isDetailMode}/></div>
                  
                  {/* Dropdown Wilayah */}
                  {!isDetailMode ? (
                    <>
                      <div className="form-group">
                        <label>Provinsi</label>
                        <select onChange={handleProvinsiChange}>
                          <option value="">{formData.provinsi || "Pilih Provinsi"}</option>
                          {provinsiList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Kota/Kab</label>
                        <select onChange={handleKotaChange} disabled={!kotaList.length}>
                          <option value="">{formData.kota || "Pilih Kota"}</option>
                          {kotaList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Kecamatan</label>
                        <select onChange={handleKecamatanChange} disabled={!kecamatanList.length}>
                          <option value="">{formData.kecamatan || "Pilih Kecamatan"}</option>
                          {kecamatanList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Kelurahan</label>
                        <select onChange={(e) => setFormData({...formData, kelurahan: e.target.options[e.target.selectedIndex].text})} disabled={!kelurahanList.length}>
                          <option value="">{formData.kelurahan || "Pilih Kelurahan"}</option>
                          {kelurahanList.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                        </select>
                      </div>
                    </>
                  ) : (
                    <div className="form-group full-width">
                      <label>Wilayah</label>
                      <input value={`${formData.kelurahan}, ${formData.kecamatan}, ${formData.kota}, ${formData.provinsi}`} disabled />
                    </div>
                  )}
                  <div className="form-group"><label>Kode Pos</label><input type="text" name="kode_pos" value={formData.kode_pos} onChange={handleInputChange} disabled={isDetailMode}/></div>
                </div>
              </div>

              {/* SECTION: PROFESIONAL */}
              <div className="form-section">
                <h4 className="section-title"><Briefcase size={18}/> Data Profesi</h4>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Bidang Keahlian <span className="text-red-500">*</span></label>
                    <input type="text" name="bidang_keahlian" value={formData.bidang_keahlian} onChange={handleInputChange} disabled={isDetailMode} required/>
                  </div>
                  <div className="form-group">
                    <label>No. Registrasi</label>
                    <input type="text" name="no_reg_asesor" value={formData.no_reg_asesor} onChange={handleInputChange} disabled={isDetailMode}/>
                  </div>
                  <div className="form-group">
                    <label>No. Lisensi</label>
                    <input type="text" name="no_lisensi" value={formData.no_lisensi} onChange={handleInputChange} disabled={isDetailMode}/>
                  </div>
                  <div className="form-group">
                    <label>Masa Berlaku Lisensi</label>
                    <input type="date" name="masa_berlaku" value={formData.masa_berlaku} onChange={handleInputChange} disabled={isDetailMode}/>
                  </div>
                  
                  <div className="form-group">
                    <label>Pendidikan Terakhir</label>
                    <input type="text" name="pendidikan_terakhir" value={formData.pendidikan_terakhir} onChange={handleInputChange} disabled={isDetailMode} placeholder="Contoh: S1 Teknik Informatika"/>
                  </div>
                  <div className="form-group">
                    <label>Tahun Lulus</label>
                    <input type="number" name="tahun_lulus" value={formData.tahun_lulus} onChange={handleInputChange} disabled={isDetailMode}/>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="modal-footer-modern">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  {isDetailMode ? 'Tutup' : 'Batal'}
                </button>
                {!isDetailMode && (
                  <button type="submit" className="btn-primary">
                    <Save size={16} className="mr-2"/> Simpan
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMPORT MODAL */}
      {showImportModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header-modern">
              <h3>Import Data</h3>
              <button onClick={() => setShowImportModal(false)}><X size={24}/></button>
            </div>
            <form onSubmit={handleImportSubmit} className="p-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="mx-auto text-gray-400 mb-4" size={48} />
                <p>Upload file Excel (.xlsx) data asesor.</p>
                <input type="file" accept=".xlsx, .xls" className="mt-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"/>
              </div>
              <div className="modal-footer-modern mt-4">
                <button type="button" className="btn-secondary" onClick={() => setShowImportModal(false)}>Batal</button>
                <button type="submit" className="btn-primary">Upload</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Asesor;