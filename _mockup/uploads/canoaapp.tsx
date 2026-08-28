import React, { useState } from 'react';
import {
  Home,
  Users,
  UsersRound,
  CreditCard,
  Activity,
  Briefcase,
  LogOut,
  Settings,
  Moon,
  Search,
  Download,
  Plus,
  Upload,
  Calendar,
  MoreHorizontal,
  X,
  AlertCircle,
  CheckCircle2,
  Trash2,
  FileText,
  Mail,
  Phone,
  Edit2,
  Share2,
  MapPin,
  Flag,
  Car
} from 'lucide-react';

// --- Mock Data ---
const mockActividades = [
  { id: 1, titulo: 'Regata Provincial Córdoba', fecha: '15/09/2026', tipo: 'Regata', lugar: 'Villa Carlos Paz', estado: 'Próxima', inscritos: 12 },
  { id: 2, titulo: 'Travesía de Luna Llena', fecha: '28/08/2026', tipo: 'Travesía', lugar: 'Lago Los Molinos', estado: 'Confirmada', inscritos: 8 },
  { id: 3, titulo: 'Campeonato Nacional', fecha: '10/10/2026', tipo: 'Regata', lugar: 'Tigre, Buenos Aires', estado: 'Planificación', inscritos: 5 }
];

const mockLogistica = [
  { id: 1, socio: 'Camargo Ezequiel', vehiculo: 'Furgoneta Club', bote: 'K1 Nelo Azul', pala: 'Braca IV (S)' },
  { id: 2, socio: 'Ana Gomez', vehiculo: 'Auto Particular (Gomez)', bote: 'Travesía Doble (Proa)', pala: 'Epic Mid' },
  { id: 3, socio: 'Juan Perez', vehiculo: 'Furgoneta Club', bote: 'K1 Escuela (Naranja)', pala: 'Club 05' },
];

const mockTiposCuota = [
  { id: '1', nombre: 'Estándar', monto: 15000, porDefecto: true },
  { id: '2', nombre: 'Familiar', monto: 25000, porDefecto: false },
  { id: '3', nombre: 'Menor', monto: 10000, porDefecto: false },
  { id: '4', nombre: 'Becado', monto: 0, porDefecto: false },
];

const mockSocios = [
  { id: 1, nombre: 'Camargo Ezequiel', email: 'luis@kiri.ar', dni: '36616757', telefono: '2235181392', estado: 'Activo', deuda: 'Admin', grupoFamiliar: null, tipoCuotaId: '1' },
  { id: 2, nombre: 'Ana Gomez', email: 'ana@ejemplo.com', dni: '40123456', telefono: '11-2233-4455', estado: 'Activo', deuda: 'Al día', grupoFamiliar: 'Familia Gomez', tipoCuotaId: '2' },
  { id: 3, nombre: 'Juan Perez', email: 'juan@ejemplo.com', dni: '38987654', telefono: '11-9876-5432', estado: 'Pendiente', deuda: 'Debe cuota', grupoFamiliar: null, tipoCuotaId: '1' },
];

const mockPagos = [
  { id: 1, socioId: 1, socio: 'Camargo Ezequiel', periodo: 'Agosto De 2026', fecha: '27/08/2026', metodo: 'Tarjeta', monto: '$ 15.000' },
  { id: 2, socioId: 2, socio: 'Ana Gomez', periodo: 'Agosto De 2026', fecha: '15/08/2026', metodo: 'Transferencia', monto: '$ 25.000' },
  { id: 3, socioId: 1, socio: 'Camargo Ezequiel', periodo: 'Julio De 2026', fecha: '10/07/2026', metodo: 'Efectivo', monto: '$ 15.000' }
];

// --- Componentes Compartidos ---
const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'inicio', icon: Home, label: 'Inicio' },
    { id: 'socios', icon: Users, label: 'Socios' },
    { id: 'pagos', icon: CreditCard, label: 'Pagos' },
    { id: 'actividades', icon: Activity, label: 'Actividades' },
    { id: 'colaboradores', icon: Briefcase, label: 'Colaboradores' },
    { id: 'configuracion', icon: Settings, label: 'Configuración' },
  ];

  return (
    <div className="w-64 bg-[#f8f9fa] border-r h-screen flex flex-col justify-between fixed left-0 top-0">
      <div>
        <div className="p-4 border-b flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
            <span className="font-bold text-gray-500 text-xs">CC</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm">Canotaje Cordoba</h1>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
        </div>
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === item.id
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <item.icon size={18} className={activeTab === item.id ? 'text-gray-900' : 'text-gray-400'} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
          <LogOut size={18} />
          Cerrar sesión
        </button>
        <p className="text-xs text-gray-400 text-center mt-4">v1.6.0</p>
      </div>
    </div>
  );
};

const Header = ({ title, subtitle }) => (
  <header className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-10">
    <div>
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      <p className="text-sm text-gray-500">{subtitle}</p>
    </div>
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600">Agosto De 2026</span>
      <button className="p-2 hover:bg-gray-100 rounded-full"><Settings size={18} className="text-gray-600" /></button>
      <button className="p-2 hover:bg-gray-100 rounded-full"><Moon size={18} className="text-gray-600" /></button>
      <div className="w-8 h-8 bg-gray-900 text-white rounded-full flex items-center justify-center text-sm font-medium">
        CE
      </div>
    </div>
  </header>
);

const SideDrawer = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div 
                className="absolute inset-0 bg-black/20 backdrop-blur-[1px] transition-opacity" 
                onClick={onClose} 
            />
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l animate-in slide-in-from-right duration-300">
                {children}
            </div>
        </div>
    );
};

// --- Vistas Principales ---

const DashboardView = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Tabs */}
      <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
        <button className="px-6 py-1.5 bg-white shadow-sm rounded-md text-sm font-medium">Resumen</button>
        <button className="px-6 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">Finanzas</button>
        <button className="px-6 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900">Socios</button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-gray-500">Total Socios</h3>
            <div className="p-2 bg-gray-50 rounded-lg"><Users size={16} className="text-gray-400" /></div>
          </div>
          <p className="text-2xl font-bold">3</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-gray-500">Pagados este mes</h3>
            <div className="p-2 bg-gray-50 rounded-lg"><CheckCircle2 size={16} className="text-gray-400" /></div>
          </div>
          <p className="text-2xl font-bold">2</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-gray-500">Pendientes</h3>
            <div className="p-2 bg-gray-50 rounded-lg"><AlertCircle size={16} className="text-gray-400" /></div>
          </div>
          <p className="text-2xl font-bold">1</p>
        </div>
        <div className="bg-white p-6 rounded-xl border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-500">Recaudado</h3>
                <div className="p-2 bg-gray-50 rounded-lg"><span className="text-gray-400 font-bold">$</span></div>
              </div>
              <p className="text-2xl font-bold">$40.000</p>
            </div>
             <div className="mt-4 pt-4 border-t flex justify-between items-center">
                 <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Tasa de morosidad</p>
                    <p className="text-sm font-bold">33.3%</p>
                 </div>
                 <div className="p-1.5 bg-gray-100 rounded">
                     <Activity size={14} className="text-gray-500"/>
                 </div>
             </div>
        </div>
      </div>

      {/* Charts */}
      <div>
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-sm font-semibold mb-6">Pagos últimos 6 meses</h3>
          {/* Chart Placeholder */}
          <div className="h-64 flex items-end justify-between px-4 pb-8 relative">
              <div className="absolute inset-0 flex flex-col justify-between pb-8 pointer-events-none">
                  <div className="border-b border-gray-100 w-full h-0"></div>
                  <div className="border-b border-gray-100 w-full h-0"></div>
                  <div className="border-b border-gray-100 w-full h-0"></div>
                  <div className="border-b border-gray-100 w-full h-0"></div>
              </div>
            {['Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'].map(month => (
              <div key={month} className="flex flex-col items-center gap-2 z-10 w-full">
                <span className="text-xs text-gray-400">{month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SociosView = () => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedSocio, setSelectedSocio] = useState(null);
  const [socioTab, setSocioTab] = useState('perfil'); // 'perfil', 'historial'
  const [searchTerm, setSearchTerm] = useState(''); // Estado para el buscador
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  // --- Estados para Asistencia ---
  const [isTakingAttendance, setIsTakingAttendance] = useState(false);
  // Usa la fecha actual por defecto (formato YYYY-MM-DD)
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  // Objeto para simular el guardado en base de datos: { "2026-08-27": { "1": true, "2": false } }
  const [attendanceRecords, setAttendanceRecords] = useState({});

  const tipoCuotaPorDefecto = mockTiposCuota.find(c => c.porDefecto) || mockTiposCuota[0];

  // Función que guarda al instante cuando haces clic
  const toggleAttendance = (socioId) => {
      setAttendanceRecords(prev => ({
          ...prev,
          [attendanceDate]: {
              ...(prev[attendanceDate] || {}),
              [socioId]: !(prev[attendanceDate]?.[socioId])
          }
      }));
  };

  // Filtrar socios en base a la búsqueda
  const filteredSocios = mockSocios.filter(socio => 
      socio.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      socio.dni.includes(searchTerm) ||
      socio.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopyLink = () => {
    const tempInput = document.createElement('input');
    tempInput.value = 'https://docs.google.com/forms/d/16YWPLz7-nInWGmhCfsxtM-f1sox32rOx81t5Ay4sMx0/edit';
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy'); // Usado por compatibilidad en iframes
    document.body.removeChild(tempInput);
    
    setIsLinkCopied(true);
    setTimeout(() => setIsLinkCopied(false), 2000);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {!showNewModal ? (
        <>
          {/* Cabecera / Toolbar dinámico */}
          {isTakingAttendance ? (
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-gray-900 p-4 rounded-xl shadow-sm text-white">
                <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
                    <div>
                        <h3 className="font-semibold text-lg">Control de Asistencia</h3>
                        <p className="text-xs text-gray-300">Tocá para marcar presente. Se guarda solo.</p>
                    </div>
                    <div className="h-8 w-px bg-gray-700 mx-2 hidden sm:block"></div>
                    <input 
                        type="date" 
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                        className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 text-white w-full sm:w-auto"
                        style={{ colorScheme: 'dark' }}
                    />
                    <div className="relative w-full sm:w-64">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Buscar alumno..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 bg-gray-800 border border-gray-700 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-500 text-white placeholder-gray-400"
                        />
                    </div>
                </div>
                <button 
                    onClick={() => {setIsTakingAttendance(false); setSearchTerm('');}}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100 shrink-0"
                >
                    <X size={16} /> Finalizar
                </button>
            </div>
          ) : (
            <>
              {/* Toolbar Normal */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <p className="text-sm text-gray-500">{mockSocios.length} socios registrados</p>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsTakingAttendance(true)}
                    className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700"
                  >
                    <CheckCircle2 size={16} /> Asistencia
                  </button>
                  <button 
                    onClick={handleCopyLink}
                    className={`flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                      isLinkCopied ? 'bg-green-50 text-green-700 border-green-200' : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {isLinkCopied ? <CheckCircle2 size={16} /> : <Share2 size={16} />} 
                    {isLinkCopied ? '¡Copiado!' : 'Compartir'}
                  </button>
                  <button 
                    onClick={() => setShowNewModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
                  >
                    <Plus size={16} /> Nuevo socio
                  </button>
                </div>
              </div>

              {/* Filters (Solo se muestran si no estamos tomando asistencia) */}
              <div className="flex gap-4 mb-6 items-end">
                <div className="flex-1 max-w-md">
                  <label className="block text-xs text-gray-500 mb-1">Buscar</label>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Nombre, DNI o email..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                  </div>
                </div>
                <div className="w-48">
                  <label className="block text-xs text-gray-500 mb-1">Estado</label>
                  <select className="w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-900">
                    <option>Todos</option>
                    <option>Activos</option>
                    <option>Pendientes</option>
                  </select>
                </div>
                 <div className="w-48">
                  <label className="block text-xs text-gray-500 mb-1">Cuota del mes</label>
                  <select className="w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-900">
                    <option>Todas</option>
                    <option>Al día</option>
                    <option>Deuda</option>
                  </select>
                </div>
                <button className="p-2 border rounded-md hover:bg-gray-50 text-gray-600">
                  <Download size={18} />
                </button>
              </div>
            </>
          )}

          {/* Table */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b">
                {isTakingAttendance ? (
                    <tr>
                      <th className="px-6 py-3 font-medium text-gray-500">Socio</th>
                      <th className="px-6 py-3 font-medium text-gray-500">DNI</th>
                      <th className="px-6 py-3 font-medium text-gray-500 text-right">Estado de Asistencia</th>
                    </tr>
                ) : (
                    <tr>
                      <th className="px-6 py-3 font-medium text-gray-500">Socio</th>
                      <th className="px-6 py-3 font-medium text-gray-500">DNI</th>
                      <th className="px-6 py-3 font-medium text-gray-500">Tipo de Cuota</th>
                      <th className="px-6 py-3 font-medium text-gray-500">Grupo Familiar</th>
                      <th className="px-6 py-3 font-medium text-gray-500">Estado</th>
                      <th className="px-6 py-3 font-medium text-gray-500">Mes Actual</th>
                    </tr>
                )}
              </thead>
              <tbody className="divide-y">
                {filteredSocios.map((socio) => {
                  // Verifica si el alumno está marcado como presente en el objeto de estado para la fecha seleccionada
                  const isPresent = attendanceRecords[attendanceDate]?.[socio.id] || false;
                  
                  return (
                  <tr 
                    key={socio.id} 
                    className={`transition-colors ${isTakingAttendance ? (isPresent ? 'bg-green-50/30' : 'hover:bg-gray-50') : 'hover:bg-gray-50 cursor-pointer'}`}
                    onClick={() => { 
                        // Bloquear apertura del modal lateral si estamos tomando asistencia
                        if (!isTakingAttendance) {
                            setSelectedSocio(socio); setSocioTab('perfil'); 
                        }
                    }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                             {socio.nombre.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                         </div>
                        <div>
                          <p className="font-medium text-gray-900">{socio.nombre}</p>
                          <p className="text-xs text-gray-500">{socio.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{socio.dni}</td>
                    
                    {/* Renderizado condicional de columnas según el modo */}
                    {isTakingAttendance ? (
                        <td className="px-6 py-4 text-right">
                            <button
                                onClick={() => toggleAttendance(socio.id)}
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                                    isPresent
                                        ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm'
                                        : 'bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200'
                                }`}
                            >
                                <CheckCircle2 size={16} className={isPresent ? 'text-green-600' : 'text-gray-400'} />
                                {isPresent ? 'Presente' : 'Marcar asistencia'}
                            </button>
                        </td>
                    ) : (
                        <>
                            <td className="px-6 py-4">
                                <span className="text-gray-600 bg-gray-100 px-2 py-1 rounded-md text-xs font-medium">
                                    {mockTiposCuota.find(c => c.id === socio.tipoCuotaId)?.nombre || 'Estándar'}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                {socio.grupoFamiliar ? (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium border">
                                        <UsersRound size={12} className="text-gray-500"/> {socio.grupoFamiliar}
                                    </span>
                                ) : <span className="text-gray-400">-</span>}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                                socio.estado === 'Activo' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                              }`}>
                                {socio.estado}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                                socio.deuda === 'Admin' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                                socio.deuda === 'Al día' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                              }`}>
                                {socio.deuda}
                              </span>
                            </td>
                        </>
                    )}
                  </tr>
                )})}
                {filteredSocios.length === 0 && (
                    <tr>
                        <td colSpan={isTakingAttendance ? 3 : 6} className="text-center py-10 text-gray-500 text-sm">
                            No se encontraron socios que coincidan con la búsqueda.
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Drawer: Detalle del Socio */}
          <SideDrawer isOpen={!!selectedSocio} onClose={() => setSelectedSocio(null)}>
            {selectedSocio && (
                <>
                    {/* Drawer Header */}
                    <div className="flex justify-between items-start p-6 border-b bg-gray-50/50">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-white border shadow-sm flex items-center justify-center text-lg font-medium text-gray-600">
                                {selectedSocio.nombre.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-gray-900">{selectedSocio.nombre}</h3>
                                <p className="text-sm text-gray-500">DNI: {selectedSocio.dni}</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedSocio(null)} className="text-gray-400 hover:text-gray-600 p-1">
                            <X size={20}/>
                        </button>
                    </div>

                    {/* Drawer Tabs */}
                    <div className="flex px-6 border-b overflow-x-auto no-scrollbar">
                        <button 
                            onClick={() => setSocioTab('perfil')}
                            className={`py-3 text-sm font-medium border-b-2 mr-6 shrink-0 ${socioTab === 'perfil' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Perfil
                        </button>
                        <button 
                            onClick={() => setSocioTab('historial')}
                            className={`py-3 text-sm font-medium border-b-2 mr-6 shrink-0 ${socioTab === 'historial' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Pagos
                        </button>
                        <button 
                            onClick={() => setSocioTab('asistencia')}
                            className={`py-3 text-sm font-medium border-b-2 shrink-0 ${socioTab === 'asistencia' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                        >
                            Asistencia
                        </button>
                    </div>

                    {/* Drawer Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {socioTab === 'perfil' ? (
                            <div className="space-y-6">
                                {/* Estado Info */}
                                <div className="bg-gray-50 p-4 rounded-xl border flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">Estado de cuenta</p>
                                        <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${
                                            selectedSocio.deuda === 'Admin' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 
                                            selectedSocio.deuda === 'Al día' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                                        }`}>
                                            {selectedSocio.deuda}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 font-medium mb-1">Tipo de cuota</p>
                                        <span className="font-medium text-gray-900">
                                            {mockTiposCuota.find(c => c.id === selectedSocio.tipoCuotaId)?.nombre || 'Estándar'}
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Contacto */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Contacto</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="p-2 bg-gray-50 rounded-md border text-gray-400"><Mail size={16}/></div>
                                            <div>
                                                <p className="text-gray-500 text-xs font-medium">Email</p>
                                                <p className="text-gray-900">{selectedSocio.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="p-2 bg-gray-50 rounded-md border text-gray-400"><Phone size={16}/></div>
                                            <div>
                                                <p className="text-gray-500 text-xs font-medium">Teléfono</p>
                                                <p className="text-gray-900">{selectedSocio.telefono || 'No registrado'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Grupo Familiar */}
                                {selectedSocio.grupoFamiliar && (
                                    <div className="p-4 border rounded-xl border-dashed">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1 flex items-center gap-2"><UsersRound size={16} className="text-gray-400"/> Grupo Familiar</h4>
                                        <p className="text-sm text-gray-500">Asociado a: <span className="font-medium text-gray-900">{selectedSocio.grupoFamiliar}</span></p>
                                    </div>
                                )}
                            </div>
                        ) : socioTab === 'historial' ? (
                            <div className="space-y-4">
                                {mockPagos.filter(p => p.socioId === selectedSocio.id).length > 0 ? (
                                    mockPagos.filter(p => p.socioId === selectedSocio.id).map(pago => (
                                        <div key={pago.id} className="p-4 border rounded-xl bg-white shadow-sm flex justify-between items-center">
                                            <div>
                                                <p className="font-medium text-sm text-gray-900">{pago.periodo}</p>
                                                <p className="text-xs text-gray-500">{pago.fecha} • {pago.metodo}</p>
                                            </div>
                                            <span className="font-semibold text-sm text-gray-900">{pago.monto}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-sm text-gray-500">
                                        No hay pagos registrados.
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Resumen de asistencia */}
                                <div className="bg-gray-50 p-4 rounded-xl border flex justify-between items-center">
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium mb-1">Asistencia este mes</p>
                                        <p className="text-xl font-bold text-gray-900">85%</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 font-medium mb-1">Clases tomadas</p>
                                        <p className="text-sm font-semibold text-gray-900">6 de 7 clases</p>
                                    </div>
                                </div>

                                {/* Lista de últimas asistencias */}
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Últimos registros</h4>
                                    <div className="space-y-2">
                                        {[
                                            { fecha: '25/08/2026', presente: true },
                                            { fecha: '20/08/2026', presente: true },
                                            { fecha: '18/08/2026', presente: false },
                                            { fecha: '13/08/2026', presente: true },
                                            { fecha: '06/08/2026', presente: true },
                                        ].map((registro, idx) => (
                                            <div key={idx} className="flex justify-between items-center p-3 border rounded-lg text-sm bg-white shadow-sm">
                                                <span className="font-medium text-gray-700">{registro.fecha}</span>
                                                {registro.presente ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-md">
                                                        <CheckCircle2 size={14} /> Presente
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 px-2 py-1 rounded-md">
                                                        <X size={14} /> Ausente
                                                    </span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Drawer Footer Actions */}
                    <div className="p-4 border-t bg-gray-50 flex gap-2">
                         <button className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800">
                            Registrar Pago
                        </button>
                    </div>
                </>
            )}
          </SideDrawer>
        </>
      ) : (
        /* Formulario Nuevo Socio */
        <div className="max-w-2xl bg-white border rounded-xl shadow-sm p-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Nuevo Socio</h3>
                 <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
            </div>
            
            <form className="space-y-6">
                {/* Foto */}
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-xl font-medium">?</div>
                    <div>
                        <button type="button" className="flex items-center gap-2 px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-gray-50">
                            <Upload size={14} /> Subir foto
                        </button>
                        <p className="text-xs text-gray-500 mt-1">JPG, PNG. Máx 2MB.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Email *</label>
                        <input type="email" placeholder="juan@email.com" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">DNI *</label>
                        <input type="text" placeholder="12345678" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Nombre *</label>
                            <input type="text" placeholder="Juan" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Apellido *</label>
                            <input type="text" placeholder="Pérez" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                        </div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Teléfono *</label>
                        <input type="text" placeholder="11-2345-6789" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Fecha de Nacimiento</label>
                        <div className="relative">
                            <input type="text" placeholder="dd/mm/aaaa" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                            <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                    </div>
                     <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Grupo Familiar (Opcional)</label>
                        <div className="relative">
                            <UsersRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input type="text" placeholder="Ej: Familia Pérez" className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Asocia a este socio con otros miembros para unificar cobros.</p>
                    </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                     <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2"><CreditCard size={14}/> Configuración de Cuota</h4>
                     
                     <div>
                        <label className="block text-sm font-medium mb-1">Tipo de cuota mensual</label>
                        <select className="w-full px-3 py-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-900">
                            {mockTiposCuota.map(cuota => (
                                <option key={cuota.id} value={cuota.id} selected={cuota.porDefecto}>
                                    {cuota.nombre} - ${cuota.monto}
                                </option>
                            ))}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Puedes configurar los tipos de cuota desde Configuración.</p>
                     </div>

                     <div className="p-4 border rounded-md bg-gray-50">
                         <label className="flex items-start gap-2">
                             <input type="checkbox" className="mt-1 rounded text-gray-900" />
                             <div>
                                 <span className="text-sm font-medium">¿Posee saldo a favor o deuda inicial?</span>
                                 <p className="text-xs text-gray-500">Marcá esta opción si necesitas ajustar el saldo al darlo de alta.</p>
                             </div>
                         </label>
                     </div>
                </div>

                <div className="pt-4 border-t space-y-4">
                     <h4 className="text-sm font-medium text-gray-700">Acceso del socio</h4>
                     <div className="grid grid-cols-2 gap-4">
                         <button type="button" className="flex flex-col items-start p-3 border rounded-md text-left ring-2 ring-gray-900 bg-gray-50">
                             <span className="flex items-center gap-2 text-sm font-medium mb-1"><Upload size={14}/> Invitación por email</span>
                             <span className="text-xs text-gray-500">Elige su propia contraseña</span>
                         </button>
                         <button type="button" className="flex flex-col items-start p-3 border rounded-md text-left opacity-50 cursor-not-allowed">
                             <span className="flex items-center gap-2 text-sm font-medium mb-1"><Settings size={14}/> DNI como contraseña</span>
                             <span className="text-xs text-gray-500">Acceda con email + DNI</span>
                         </button>
                     </div>
                </div>

                <div className="flex justify-end gap-3 pt-6">
                    <button type="button" onClick={() => setShowNewModal(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">
                        Cancelar
                    </button>
                    <button type="button" className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800">
                        Crear socio
                    </button>
                </div>
            </form>
        </div>
      )}
    </div>
  );
};

const ConfiguracionView = () => {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div className="flex gap-2 border-b mb-6">
            <button className="px-4 py-2 text-sm font-medium border-b-2 border-gray-900 text-gray-900 flex items-center gap-2">
                <Settings size={16}/> General
            </button>
            <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 flex items-center gap-2">
                <CreditCard size={16}/> Pagos y Cuotas
            </button>
        </div>

        {/* Información del Club */}
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
            <div>
                <h3 className="text-base font-semibold text-gray-900">Información del Club</h3>
                <p className="text-sm text-gray-500">Datos básicos de tu organización</p>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Nombre del club</label>
                    <input type="text" defaultValue="Canotaje Cordoba" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Email de contacto</label>
                    <input type="email" defaultValue="luis@kiri.ar" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                    <input type="text" defaultValue="2235181392" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                </div>
            </div>
        </div>

        {/* Tipos de Cuota */}
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-base font-semibold text-gray-900">Tipos de Cuota</h3>
                    <p className="text-sm text-gray-500">Definí los valores mensuales para distintas categorías de socios.</p>
                </div>
                <button className="flex items-center gap-2 text-sm font-medium text-gray-900 border px-3 py-1.5 rounded-md hover:bg-gray-50">
                    <Plus size={16}/> Nuevo tipo
                </button>
            </div>
            
            <div className="border rounded-lg divide-y">
                {mockTiposCuota.map(cuota => (
                    <div key={cuota.id} className="flex justify-between items-center p-4 hover:bg-gray-50">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm text-gray-900">{cuota.nombre}</span>
                                {cuota.porDefecto && (
                                    <span className="text-[10px] bg-gray-100 border px-1.5 py-0.5 rounded text-gray-600 font-medium">Por defecto</span>
                                )}
                            </div>
                            <span className="text-sm text-gray-500">${cuota.monto} / mes</span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600"><MoreHorizontal size={18}/></button>
                    </div>
                ))}
            </div>
            
            <div className="pt-4 border-t">
                <label className="block text-sm font-medium mb-1">Día de vencimiento general</label>
                <input type="number" defaultValue="10" className="w-full max-w-[150px] px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                <p className="text-xs text-gray-500 mt-1">Día del mes en que vence el pago de todas las cuotas.</p>
            </div>
        </div>

        {/* Notificaciones */}
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-6">
            <div>
                <h3 className="text-base font-semibold text-gray-900">Notificaciones</h3>
                <p className="text-sm text-gray-500">Configura las comunicaciones automáticas con tus socios</p>
            </div>
            
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-900">Enviar emails a socios</p>
                    <p className="text-xs text-gray-500 max-w-md">Si lo desactivás, no se enviarán comprobantes, recordatorios, notas de crédito ni invitaciones a tus socios. Útil para probar el sistema sin notificar.</p>
                </div>
                <div className="w-10 h-6 bg-gray-900 rounded-full relative cursor-pointer">
                    <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                </div>
            </div>

            <div className="pt-4 border-t flex items-center justify-between opacity-60">
                <div>
                    <p className="text-sm font-medium text-gray-900">Recordatorios por WhatsApp</p>
                    <p className="text-xs text-gray-500">Notificaciones automáticas vía WhatsApp</p>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-gray-600 border text-xs rounded-md font-medium">Próximamente</span>
            </div>
        </div>

        {/* Importación de Datos */}
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
            <div>
                <h3 className="text-base font-semibold text-gray-900">Base de Datos</h3>
                <p className="text-sm text-gray-500">Migra tu lista de socios desde Excel u otra plataforma de gestión.</p>
            </div>
            
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800">
                    <Upload size={16}/> Importar socios (CSV)
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700">
                    <Download size={16}/> Descargar plantilla
                </button>
            </div>
        </div>
    </div>
  );
};

const ActividadesView = () => {
    const [selectedActividad, setSelectedActividad] = useState(null);
    const [actividadTab, setActividadTab] = useState('detalles'); // 'detalles', 'logistica'

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header & Actions */}
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Actividades y Regatas</h3>
                    <p className="text-sm text-gray-500">Gestioná eventos, viajes y la asignación de botes</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800">
                    <Plus size={16} /> Nueva actividad
                </button>
            </div>

            {/* Sub Tabs */}
            <div className="flex gap-2 border-b mb-6">
                <button className="px-4 py-2 text-sm font-medium border-b-2 border-gray-900 text-gray-900">
                    Próximas
                </button>
                <button className="px-4 py-2 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700">
                    Pasadas
                </button>
            </div>

            {/* Grid de Eventos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {mockActividades.map((act) => (
                    <div 
                        key={act.id} 
                        onClick={() => setSelectedActividad(act)}
                        className="bg-white border rounded-xl p-5 cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all group relative"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-2 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-md border ${
                                act.tipo === 'Regata' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            }`}>
                                {act.tipo}
                            </span>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                                {act.estado}
                            </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-base mb-4 group-hover:text-blue-600 transition-colors">
                            {act.titulo}
                        </h4>
                        
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <Calendar size={16} className="text-gray-400" /> 
                                <span>{act.fecha}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <MapPin size={16} className="text-gray-400" /> 
                                <span>{act.lugar}</span>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t flex items-center justify-between">
                            <div className="flex -space-x-2">
                                {[1,2,3].map(i => (
                                    <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-medium text-gray-500">
                                        ?
                                    </div>
                                ))}
                            </div>
                            <span className="text-xs font-medium text-gray-500">
                                {act.inscritos} confirmados
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Panel Lateral: Detalle de Actividad */}
            <SideDrawer isOpen={!!selectedActividad} onClose={() => setSelectedActividad(null)}>
                {selectedActividad && (
                    <>
                        {/* Drawer Header */}
                        <div className="flex justify-between items-start p-6 border-b bg-gray-50/50">
                            <div>
                                <span className="inline-block px-2 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-md border bg-white text-gray-600 border-gray-200 mb-2">
                                    {selectedActividad.tipo}
                                </span>
                                <h3 className="font-semibold text-xl text-gray-900">{selectedActividad.titulo}</h3>
                                <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1">
                                    <MapPin size={14}/> {selectedActividad.lugar}
                                </p>
                            </div>
                            <button onClick={() => setSelectedActividad(null)} className="text-gray-400 hover:text-gray-600 p-1">
                                <X size={20}/>
                            </button>
                        </div>

                        {/* Drawer Tabs */}
                        <div className="flex px-6 border-b overflow-x-auto no-scrollbar">
                            <button 
                                onClick={() => setActividadTab('detalles')}
                                className={`py-3 text-sm font-medium border-b-2 mr-6 shrink-0 ${actividadTab === 'detalles' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Info General
                            </button>
                            <button 
                                onClick={() => setActividadTab('logistica')}
                                className={`py-3 text-sm font-medium border-b-2 shrink-0 ${actividadTab === 'logistica' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                            >
                                Participantes & Logística
                            </button>
                        </div>

                        {/* Drawer Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {actividadTab === 'detalles' ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-xl border">
                                            <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1.5"><Calendar size={14}/> Fecha</p>
                                            <p className="font-semibold text-gray-900">{selectedActividad.fecha}</p>
                                        </div>
                                        <div className="bg-gray-50 p-4 rounded-xl border">
                                            <p className="text-xs text-gray-500 font-medium mb-1 flex items-center gap-1.5"><UsersRound size={14}/> Inscritos</p>
                                            <p className="font-semibold text-gray-900">{selectedActividad.inscritos} palistas</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Descripción</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            Competencia anual organizada por la federación. Es obligatorio llevar DNI, carnet federativo y apto médico físico impreso. 
                                            La carga de botes en el tráiler se realizará el día anterior a las 18:00hs en el club.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-semibold text-gray-900">Planilla de Logística</h4>
                                        <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                                            <Download size={14}/> Imprimir lista
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {mockLogistica.map((item) => (
                                            <div key={item.id} className="p-4 border rounded-xl bg-white shadow-sm space-y-3">
                                                <div className="flex items-center justify-between pb-3 border-b">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-medium text-gray-600">
                                                            {item.socio.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-sm text-gray-900">{item.socio}</span>
                                                    </div>
                                                    <span className="text-xs px-2 py-1 bg-green-50 text-green-700 border border-green-200 rounded-md">Confirmado</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <p className="text-xs text-gray-400 font-medium mb-0.5 flex items-center gap-1"><Car size={12}/> Viaje</p>
                                                        <p className="text-sm text-gray-700">{item.vehiculo}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-400 font-medium mb-0.5 flex items-center gap-1"><Flag size={12}/> Bote Asignado</p>
                                                        <p className="text-sm text-gray-700 font-medium">{item.bote}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </SideDrawer>
        </div>
    );
};

const PagosView = () => {
    const [showNewPago, setShowNewPago] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagoTab, setPagoTab] = useState('estado'); // 'estado', 'historial'

    const filteredPagos = mockPagos.filter(p => 
        p.socio.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <p className="text-sm text-gray-500">Agosto De 2026 - 0 de {mockSocios.length} Socios Pagaron</p>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700">
                        <Download size={16} /> Exportar
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700">
                        <Mail size={16} /> Enviar recordatorios
                    </button>
                    <button 
                        onClick={() => setShowNewPago(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
                    >
                        <CreditCard size={16} /> Registrar pago
                    </button>
                </div>
            </div>

            {/* Toolbar & Search */}
            <div className="mb-6">
                <div className="relative max-w-md mb-6">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre o DNI..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                    />
                </div>
                
                <div className="flex gap-2 border-b">
                    <button 
                        onClick={() => setPagoTab('estado')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 ${pagoTab === 'estado' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Estado del mes
                    </button>
                    <button 
                        onClick={() => setPagoTab('historial')}
                        className={`px-4 py-2 text-sm font-medium border-b-2 ${pagoTab === 'historial' ? 'border-gray-900 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        Historial
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border rounded-lg overflow-hidden">
                {pagoTab === 'historial' ? (
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 font-medium text-gray-500">Socio</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Período</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Fecha de pago</th>
                                <th className="px-6 py-3 font-medium text-gray-500">Método</th>
                                <th className="px-6 py-3 font-medium text-gray-500 text-right">Monto</th>
                                <th className="px-6 py-3"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {filteredPagos.map((pago) => (
                                <tr key={pago.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                            {pago.socio.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase()}
                                        </div>
                                        {pago.socio}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">{pago.periodo}</td>
                                    <td className="px-6 py-4 text-gray-600">{pago.fecha}</td>
                                    <td className="px-6 py-4 text-gray-600">{pago.metodo}</td>
                                    <td className="px-6 py-4 font-semibold text-gray-900 text-right">{pago.monto}</td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button className="p-1 text-gray-400 hover:text-gray-900"><FileText size={16}/></button>
                                        <button className="p-1 text-gray-400 hover:text-red-600"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-10 text-center text-gray-500 text-sm">
                        No se encontraron socios con pagos registrados este mes.
                    </div>
                )}
            </div>

            {/* Modal de Registro de Pago */}
            {showNewPago && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h3 className="font-semibold text-lg">Registrar nuevo pago</h3>
                            <button onClick={() => setShowNewPago(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar socio</label>
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar por nombre o DNI..." 
                                        className="w-full pl-9 pr-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900"
                                    />
                                </div>
                            </div>
                            <div className="border rounded-lg p-4 bg-gray-50">
                                <p className="text-sm font-medium text-red-600 mb-2 flex items-center gap-1.5"><AlertCircle size={16}/> A cobrar: $ 15.000</p>
                                <table className="w-full text-left text-sm mt-4">
                                    <thead className="text-xs text-gray-500 border-b">
                                        <tr>
                                            <th className="pb-2 font-medium">Período</th>
                                            <th className="pb-2 font-medium">Esperado</th>
                                            <th className="pb-2 font-medium">Resta</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="py-2 font-medium text-gray-900">Agosto De 2026</td>
                                            <td className="py-2 text-gray-600">$ 15.000</td>
                                            <td className="py-2 text-green-600 font-medium">Saldado</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Monto a pagar</label>
                                <input type="number" defaultValue="15000" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                                <p className="text-xs text-gray-500 mt-1">Se distribuye automáticamente desde el mes más antiguo</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Método de pago</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button className="py-2 px-4 bg-gray-900 text-white text-sm font-medium rounded-md">Efectivo</button>
                                    <button className="py-2 px-4 border bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md">Transferencia</button>
                                    <button className="py-2 px-4 border bg-white text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-md">Tarjeta</button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setShowNewPago(false)} className="px-4 py-2 border bg-white rounded-md text-sm font-medium hover:bg-gray-50">Cancelar</button>
                            <button onClick={() => setShowNewPago(false)} className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800">Registrar pago</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const ColaboradoresView = () => {
    const [showNewModal, setShowNewModal] = useState(false);
    const [tab, setTab] = useState('empleados');

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header & Tabs */}
            <div className="flex justify-between items-start mb-6 border-b pb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">Colaboradores</h3>
                    <p className="text-sm text-gray-500">Gestioná el equipo con acceso al panel</p>
                </div>
                <button 
                    onClick={() => setShowNewModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800"
                >
                    <Plus size={16} /> Alta de colaborador
                </button>
            </div>

            <div className="flex gap-2 mb-6">
                <button 
                    onClick={() => setTab('empleados')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${tab === 'empleados' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Colaboradores
                </button>
                <button 
                    onClick={() => setTab('cargos')}
                    className={`px-4 py-2 text-sm font-medium rounded-md ${tab === 'cargos' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Roles y Permisos
                </button>
            </div>

            {/* Empty State */}
            <div className="bg-white border rounded-xl p-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center border">
                    <Briefcase size={24} className="text-gray-400" />
                </div>
                <div>
                    <h4 className="text-sm font-medium text-gray-900">No hay colaboradores todavía</h4>
                    <p className="text-sm text-gray-500 mt-1">Invitá a profesores y administrativos para empezar.</p>
                </div>
                <button 
                    onClick={() => setShowNewModal(true)}
                    className="mt-4 px-4 py-2 bg-white border shadow-sm rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                    Agregar colaborador
                </button>
            </div>

            {/* Modal Nuevo Colaborador */}
            {showNewModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 border-b flex justify-between items-center">
                            <div>
                                <h3 className="font-semibold text-lg">Agregar colaborador</h3>
                                <p className="text-sm text-gray-500">Recibirá un email para crear su cuenta.</p>
                            </div>
                            <button onClick={() => setShowNewModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input type="email" placeholder="juanpablo@club.com" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Nombre</label>
                                    <input type="text" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Apellido</label>
                                    <input type="text" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                                    <input type="text" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Etiqueta (opcional)</label>
                                    <input type="text" placeholder="Ej: Tesorero" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Rol de sistema</label>
                                <select className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-900 bg-white">
                                    <option>Seleccionar rol...</option>
                                    <option>Administrador</option>
                                    <option>Profesor</option>
                                    <option>Secretaría</option>
                                </select>
                            </div>
                            
                            <div className="pt-4 border-t">
                                <label className="block text-sm font-medium mb-2">Acceso del empleado</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button type="button" className="flex flex-col items-start p-3 border rounded-md text-left ring-2 ring-gray-900 bg-gray-50">
                                        <span className="flex items-center gap-2 text-sm font-medium mb-1"><Mail size={14}/> Invitación por email</span>
                                        <span className="text-xs text-gray-500">Elige su propia contraseña</span>
                                    </button>
                                    <button type="button" className="flex flex-col items-start p-3 border rounded-md text-left opacity-50 cursor-not-allowed">
                                        <span className="flex items-center gap-2 text-sm font-medium mb-1"><Settings size={14}/> DNI como contraseña</span>
                                        <span className="text-xs text-gray-500">Accede con email + DNI</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                            <button onClick={() => setShowNewModal(false)} className="px-4 py-2 border bg-white rounded-md text-sm font-medium hover:bg-gray-50">Cancelar</button>
                            <button onClick={() => setShowNewModal(false)} className="px-4 py-2 bg-gray-900 text-white rounded-md text-sm font-medium hover:bg-gray-800">Alta de colaborador</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('socios');

  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'inicio': return { title: 'Hola, Camargo', subtitle: 'Resumen de tu gestión de socios' };
      case 'socios': return { title: 'Socios', subtitle: 'Gestiona los socios del club' };
      case 'pagos': return { title: 'Pagos', subtitle: 'Gestión de cuotas y pagos mensuales' };
      case 'colaboradores': return { title: 'Colaboradores', subtitle: 'Gestioná el equipo con acceso al panel' };
      case 'configuracion': return { title: 'Configuración', subtitle: 'Ajustes del sistema' };
      default: return { title: 'Canotaje Córdoba', subtitle: 'Panel de administración' };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="flex h-screen bg-[#fafafa] font-sans text-gray-900">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <Header title={headerInfo.title} subtitle={headerInfo.subtitle} />
        
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'inicio' && <DashboardView />}
          {activeTab === 'socios' && <SociosView />}
          {activeTab === 'pagos' && <PagosView />}
          {activeTab === 'colaboradores' && <ColaboradoresView />}
          {activeTab === 'configuracion' && <ConfiguracionView />}
          {activeTab === 'actividades' && <ActividadesView />}
        </div>
      </main>
    </div>
  );
}