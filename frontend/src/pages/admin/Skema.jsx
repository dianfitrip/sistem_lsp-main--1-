import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from "../../services/api";
import * as XLSX from 'xlsx';
import { 
  Search, Plus, Eye, Edit2, Trash2, X, Save, Download, Upload,
  FileText, CheckCircle, XCircle, Loader2, ChevronLeft, ChevronRight
} from 'lucide-react';
import './adminstyles/Skema.css'; 

const Skema = () => {
  // --- STATE ---
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  
  const [listSkkni, setListSkkni] = useState([]);
  const [listSkemaInduk, setListSkemaInduk] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1, limit: 10, total: 0, totalPages: 1
  });

  const [importFile, setImportFile] = useState(null);
  const [importPreview, setImportPreview] = useState([]);

  // State Form
  const [formData, setFormData] = useState({
    kode_skema: '',
    judul_skema: '',
    judul_skema_en: '',
    jenis_skema: 'KKNI',
    level_kkni: '',
    bidang_okupasi: '',
    kode_sektor: '',
    kode_kbli: '',
    kode_kbji: '', // TAMBAHAN: State kode_kbji
    skema_induk_id: '',
    keterangan_bukti: '',
    skor_min_ai05: '',
    kedalaman_bukti: '',
    status: 'aktif',
    skkni_id: ''
  });

  const [dokumenFile, setDokumenFile] = useState(null);

  // --- FETCH DATA ---
  const getSafeList = (response) => {
    if (!response || !response.data) return [];
    if (response.data.data && Array.isArray(response.data.data.data)) return response.data.data.data;
    if (response.data.data && Array.isArray(response.data.data)) return response.data.data;
    return [];
  };

  const fetchSupportingData = async () => {
    try {
      const [skkniRes, skemaRes] = await Promise.all([
        api.get('/admin/skkni?limit=1000').catch(() => ({ data: { data: [] } })), 
        api.get('/admin/skema?limit=1000').catch(() => ({ data: { data: [] } }))
      ]);
      setListSkkni(getSafeList(skkniRes));
      setListSkemaInduk(getSafeList(skemaRes));
    } catch (error) {
      console.error("Error fetching options:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/skema', {
        params: { search: searchTerm, page: pagination.page, limit: pagination.limit }
      });
      if (response.data.success) {
        const rows = response.data.data.data || [];
        setData(rows);
        setPagination(prev => ({
          ...prev, total: response.data.data.total || 0, totalPages: response.data.data.totalPages || 1
        }));
      }
    } catch (error) {
      Swal.fire('Error', error.response?.data?.message || 'Gagal mengambil data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSupportingData();
  }, [pagination.page, searchTerm]);

  // --- HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setDokumenFile(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = new FormData();
    Object.keys(formData).forEach(key => {
      if (formData[key] !== null && formData[key] !== undefined) {
        payload.append(key, formData[key]);
      }
    });

    if (dokumenFile) {
      payload.append('dokumen', dokumenFile);
    }

    try {
      if (modalType === 'create') {
        await api.post('/admin/skema', payload);
        Swal.fire('Sukses', 'Skema berhasil ditambahkan', 'success');
      } else {
        await api.put(`/admin/skema/${selectedItem.id_skema}`, payload);
        Swal.fire('Sukses', 'Skema berhasil diperbarui', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Submit Error:", error);
      Swal.fire('Error', error.response?.data?.message || 'Gagal menyimpan data', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Data?', text: "Data tidak bisa dikembalikan!", icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Hapus', cancelButtonText: 'Batal', confirmButtonColor: '#d33'
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/admin/skema/${id}`);
        Swal.fire('Terhapus!', 'Data telah dihapus.', 'success');
        fetchData();
      } catch (error) {
        Swal.fire('Error', 'Gagal menghapus data', 'error');
      }
    }
  };

  const handleExport = async (format) => {
    try {
      const response = await api.get(`/admin/skema/export?format=${format}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `data_skema.${format === 'csv' ? 'csv' : 'json'}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      Swal.fire('Error', 'Gagal export data', 'error');
    }
  };

  // --- IMPORT HANDLERS ---
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImportFile(file);
      const reader = new FileReader();
      reader.onload = (evt) => {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        setImportPreview(data.slice(0, 5));
      };
      reader.readAsBinaryString(file);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const jsonData = XLSX.utils.sheet_to_json(ws);

        const mappedData = jsonData.map(item => ({
          kode_skema: item['Kode Skema'] || item.kode_skema,
          judul_skema: item['Judul Skema'] || item.judul_skema,
          jenis_skema: item['Jenis'] || item.jenis_skema,
          level_kkni: item['Level'] || item.level_kkni,
          kode_kbli: item['Kode KBLI'] || item.kode_kbli,
          kode_kbji: item['Kode KBJI'] || item.kode_kbji, // TAMBAHAN: Map kode_kbji
          status: item['Status'] || item.status
        }));

        const response = await api.post('/admin/skema/import', { data: mappedData });
        
        if (response.data.success) {
          Swal.fire('Import Selesai', response.data.message || 'Data berhasil diimport', 'success');
          setShowModal(false);
          fetchData();
        }
      } catch (error) {
        Swal.fire('Error', 'Gagal memproses file import', 'error');
      }
    };
    reader.readAsBinaryString(importFile);
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setDokumenFile(null); 

    if (type === 'create') {
      setFormData({
        kode_skema: '', judul_skema: '', judul_skema_en: '', jenis_skema: 'KKNI',
        level_kkni: '1', 
        bidang_okupasi: '', kode_sektor: '', 
        kode_kbli: '', kode_kbji: '', // TAMBAHAN: Reset
        skema_induk_id: '',
        keterangan_bukti: '', skor_min_ai05: '', kedalaman_bukti: '', 
        status: 'aktif', skkni_id: ''
      });
    } else if (type === 'edit' && item) {
      setFormData({
        kode_skema: item.kode_skema,
        judul_skema: item.judul_skema,
        judul_skema_en: item.judul_skema_en || '',
        jenis_skema: item.jenis_skema,
        level_kkni: item.level_kkni || '1',
        bidang_okupasi: item.bidang_okupasi || '',
        kode_sektor: item.kode_sektor || '',
        kode_kbli: item.kode_kbli || '',
        kode_kbji: item.kode_kbji || '', // TAMBAHAN: Load existing data
        skema_induk_id: item.skema_induk_id || '',
        keterangan_bukti: item.keterangan_bukti || '',
        skor_min_ai05: item.skor_min_ai05 || '',
        kedalaman_bukti: item.kedalaman_bukti || '',
        status: item.status || 'aktif',
        skkni_id: item.skkni_id || ''
      });
    }
    setImportFile(null);
    setImportPreview([]);
    setShowModal(true);
  };

  return (
    <div className="skema-container">
      {/* Header & Filter (Sama) */}
      <div className="header-section">
        <div className="title-box">
          <h2>Data Skema Sertifikasi</h2>
          <p>Kelola data skema sertifikasi kompetensi</p>
        </div>
        <div className="action-buttons-group">
          <button className="btn-create" onClick={() => openModal('create')}><Plus size={18} /> Tambah</button>
          <button className="btn-export" onClick={() => handleExport('csv')}><Download size={18} /> Export</button>
          <button className="btn-import" onClick={() => openModal('import')}><Upload size={18} /> Import</button>
        </div>
      </div>
      <div className="filter-section">
        <div className="search-box">
          <Search className="search-icon" size={20} />
          <input type="text" placeholder="Cari Kode, Judul..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      {/* Table Section */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state"><Loader2 className="animate-spin" size={32} /><p>Memuat data...</p></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Kode</th>
                <th>Judul Skema</th>
                <th>Level</th>
                <th>Dokumen</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((item, index) => (
                  <tr key={item.id_skema}>
                    <td>{(pagination.page - 1) * pagination.limit + index + 1}</td>
                    <td className="font-medium">{item.kode_skema}</td>
                    <td>{item.judul_skema}</td>
                    <td><span className="badge-level">Level {item.level_kkni || '-'}</span></td>
                    <td>
                      {item.dokumen ? (
                        <a href={`http://localhost:3000/uploads/${item.dokumen}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                          <FileText size={14}/> Lihat
                        </a>
                      ) : <span className="text-gray-400">-</span>}
                    </td>
                    <td>
                      <span className={`status-badge ${item.status === 'aktif' ? 'status-active' : 'status-inactive'}`}>
                        {item.status === 'aktif' ? <CheckCircle size={14}/> : <XCircle size={14}/>} {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-action edit" onClick={() => openModal('edit', item)}><Edit2 size={18} /></button>
                        <button className="btn-action delete" onClick={() => handleDelete(item.id_skema)}><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7" className="text-center py-8 text-gray-500">Tidak ada data ditemukan</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="pagination-section">
        <div className="pagination-info">Menampilkan {data.length} dari {pagination.total} data</div>
        <div className="pagination-controls">
          <button disabled={pagination.page === 1} onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}><ChevronLeft size={18} /></button>
          <span>Hal {pagination.page} dari {pagination.totalPages}</span>
          <button disabled={pagination.page === pagination.totalPages} onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}><ChevronRight size={18} /></button>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && modalType !== 'import' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{modalType === 'create' ? 'Tambah Skema' : 'Edit Skema'}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Kode Skema <span className="text-red-500">*</span></label>
                  <input type="text" name="kode_skema" value={formData.kode_skema} onChange={handleInputChange} required placeholder="Contoh: SKM/001" />
                </div>
                <div className="form-group">
                  <label>Judul Skema (Indonesia) <span className="text-red-500">*</span></label>
                  <input type="text" name="judul_skema" value={formData.judul_skema} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Judul Skema (Inggris)</label>
                  <input type="text" name="judul_skema_en" value={formData.judul_skema_en} onChange={handleInputChange} />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Jenis Skema</label>
                    <select name="jenis_skema" value={formData.jenis_skema} onChange={handleInputChange}>
                      <option value="KKNI">KKNI</option>
                      <option value="Okupasi">Okupasi</option>
                      <option value="Klaster">Klaster</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Level KKNI</label>
                    <select name="level_kkni" value={formData.level_kkni} onChange={handleInputChange}>
                      <option value="">-- Pilih Level --</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <option key={num} value={num}>Level {num}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* UPLOAD DOKUMEN */}
                <div className="form-group">
                  <label>Upload Dokumen Skema (PDF/DOCX)</label>
                  <div className="file-input-wrapper">
                    <input type="file" onChange={handleFileChange} className="w-full border p-2 rounded" accept=".pdf,.doc,.docx" />
                    {modalType === 'edit' && selectedItem?.dokumen && (
                      <small className="text-gray-500 block mt-1">
                        File saat ini: {selectedItem.dokumen} (Upload baru untuk mengganti)
                      </small>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Bidang Okupasi</label>
                    <input type="text" name="bidang_okupasi" value={formData.bidang_okupasi} onChange={handleInputChange} />
                  </div>
                  <div className="form-group">
                    <label>Kode Sektor</label>
                    <input type="text" name="kode_sektor" value={formData.kode_sektor} onChange={handleInputChange} />
                  </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Kode KBLI</label>
                        <input type="text" name="kode_kbli" value={formData.kode_kbli} onChange={handleInputChange} />
                    </div>
                    {/* TAMBAHAN: Kode KBJI */}
                    <div className="form-group">
                        <label>Kode KBJI</label>
                        <input type="text" name="kode_kbji" value={formData.kode_kbji} onChange={handleInputChange} />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Skor Min. (AI05)</label>
                        <input type="number" name="skor_min_ai05" value={formData.skor_min_ai05} onChange={handleInputChange} />
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={formData.status} onChange={handleInputChange}>
                            <option value="aktif">Aktif</option>
                            <option value="nonaktif">Non Aktif</option>
                        </select>
                    </div>
                </div>

                <div className="form-group">
                  <label>Referensi SKKNI</label>
                  <select name="skkni_id" value={formData.skkni_id} onChange={handleInputChange}>
                    <option value="">-- Tidak Ada --</option>
                    {(listSkkni || []).map(s => (
                      <option key={s.id_skkni} value={s.id_skkni}>{s.no_skkni || 'N/A'} - {s.judul_skkni}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Skema Induk</label>
                  <select name="skema_induk_id" value={formData.skema_induk_id} onChange={handleInputChange}>
                    <option value="">-- Tidak Ada --</option>
                    {(listSkemaInduk || []).map(s => (
                      (s && selectedItem && s.id_skema === selectedItem.id_skema) ? null : 
                      <option key={s?.id_skema} value={s?.id_skema}>{s?.kode_skema} - {s?.judul_skema}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                    <label>Kedalaman Bukti</label>
                    <select name="kedalaman_bukti" value={formData.kedalaman_bukti} onChange={handleInputChange} className="w-full border p-2 rounded">
                        <option value="">-- Pilih --</option>
                        <option value="Elemen Kompetensi">Elemen Kompetensi</option>
                        <option value="Kriteria Unjuk Kerja">Kriteria Unjuk Kerja</option>
                    </select>
                </div>

                <div className="form-group">
                  <label>Keterangan Bukti</label>
                  <textarea name="keterangan_bukti" value={formData.keterangan_bukti} onChange={handleInputChange} rows="2"></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn-save"><Save size={16}/> Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import */}
      {showModal && modalType === 'import' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Import Data Skema</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}><X size={20}/></button>
            </div>
            <div className="modal-body">
              <div className="file-upload-area">
                <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="file-input" />
                <div className="upload-placeholder"><Upload size={32} /><p>Klik untuk upload Excel</p></div>
              </div>
              {importFile && <div className="file-info"><FileText size={16} /><span>{importFile.name}</span></div>}
              {importPreview.length > 0 && (
                <div className="import-preview">
                  <h4>Preview:</h4>
                  <div className="preview-table">
                    <table><thead><tr>{Object.keys(importPreview[0]).map(k=><th key={k}>{k}</th>)}</tr></thead><tbody>{importPreview.map((r,i)=><tr key={i}>{Object.values(r).map((v,j)=><td key={j}>{v}</td>)}</tr>)}</tbody></table>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Batal</button>
              <button className="btn-save" onClick={handleImport} disabled={!importFile}>Proses Import</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skema;