// src/components/admin/TemplateConfigurator.tsx
'use client';
import { useState, useEffect } from 'react';
import { Plantilla, TemplateField, TemplateButton, CustomTextField } from '@/lib/templates';

interface Props {
  previewImage: string;
  plantilla?: Plantilla;
  onSave: (config: Partial<Plantilla>) => void;
}

export default function TemplateConfigurator({ previewImage, plantilla, onSave }: Props) {
  const [activeTab, setActiveTab] = useState<'campos' | 'botones' | 'personalizados'>('campos');
  const [campos, setCampos] = useState<Plantilla['campos']>({});
  const [botones, setBotones] = useState<Plantilla['botones']>({});
  const [anchoPlantilla, setAnchoPlantilla] = useState(675);
  const [altoPlantilla, setAltoPlantilla] = useState(1200);
  const [camposPersonalizados, setCamposPersonalizados] = useState<CustomTextField[]>([]);
  const [nuevoCampoLabel, setNuevoCampoLabel] = useState('');

  const suggestedColors = [
    { name: 'Marrón Oscuro', value: '#3d2817' },
    { name: 'Vino', value: '#722F37' },
    { name: 'Azul Marino', value: '#1e3a5f' },
    { name: 'Verde Bosque', value: '#2d5016' },
    { name: 'Púrpura Oscuro', value: '#4a1942' },
    { name: 'Negro', value: '#2d2d2d' },
    { name: 'Gris Oscuro', value: '#4a4a4a' },
  ];

  useEffect(() => {
    if (plantilla) {
      if (plantilla.campos) setCampos(plantilla.campos);
      if (plantilla.botones) setBotones(plantilla.botones);
      if (plantilla.anchoPlantilla) setAnchoPlantilla(plantilla.anchoPlantilla);
      if (plantilla.altoPlantilla) setAltoPlantilla(plantilla.altoPlantilla);
      if (plantilla.camposPersonalizados) setCamposPersonalizados(plantilla.camposPersonalizados);
    }
  }, [plantilla]);

  const handleAddField = (fieldKey: keyof Plantilla['campos']) => {
    setCampos({
      ...campos,
      [fieldKey]: {
        x: 'center',
        y: 200,
        fuente: 'Dancing Script',
        tamaño: 42,
        color: '#3d2817',
        alineacion: 'center',
      },
    });
  };

  const handleUpdateField = (fieldKey: keyof Plantilla['campos'], field: TemplateField) => {
    setCampos({
      ...campos,
      [fieldKey]: field,
    });
  };

  const handleRemoveField = (fieldKey: keyof Plantilla['campos']) => {
    const newCampos = { ...campos };
    delete newCampos[fieldKey];
    setCampos(newCampos);
  };

  const handleAddButton = (buttonKey: keyof Plantilla['botones']) => {
    setBotones({
      ...botones,
      [buttonKey]: {
        x: 'center',
        y: 700,
        ancho: 280,
        alto: 55,
        texto: buttonKey === 'confirmar' ? '✨ Confirmar Asistencia' : buttonKey === 'regalos' ? '🎁 Ver Lista de Regalos' : '📍 Ver Ubicación',
        color: buttonKey === 'confirmar' ? '#ec4899' : buttonKey === 'regalos' ? '#8b5cf6' : '#10b981',
        colorTexto: '#ffffff',
        accion: buttonKey === 'confirmar' ? 'rsvp' : buttonKey === 'regalos' ? 'gifts' : 'map',
      },
    });
  };

  const handleUpdateButton = (buttonKey: keyof Plantilla['botones'], button: TemplateButton) => {
    setBotones({
      ...botones,
      [buttonKey]: button,
    });
  };

  const handleRemoveButton = (buttonKey: keyof Plantilla['botones']) => {
    const newBotones = { ...botones };
    delete newBotones[buttonKey];
    setBotones(newBotones);
  };

  const handleAddCustomField = () => {
    if (!nuevoCampoLabel.trim()) {
      return;
    }

    const newField: CustomTextField = {
      id: `custom_${Date.now()}`,
      label: nuevoCampoLabel.trim(),
      x: 'center',
      y: 400,
      fuente: 'Dancing Script',
      tamaño: 32,
      color: '#3d2817',
      alineacion: 'center',
      activo: true,
    };

    setCamposPersonalizados([...camposPersonalizados, newField]);
    setNuevoCampoLabel('');
  };

  const handleUpdateCustomField = (id: string, updates: Partial<CustomTextField>) => {
    setCamposPersonalizados(camposPersonalizados.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const handleRemoveCustomField = (id: string) => {
    setCamposPersonalizados(camposPersonalizados.filter(field => field.id !== id));
  };

  const handleSave = () => {
    onSave({ 
      campos, 
      botones, 
      anchoPlantilla, 
      altoPlantilla,
      camposPersonalizados,
    });
  };

  const fieldLabels: Record<keyof Plantilla['campos'], string> = {
    titulo: '📌 Título Principal',
    nombre: '👶 Nombre del Bebé',
    fecha: '📅 Fecha',
    hora: '🕐 Hora',
    lugar: '📍 Lugar',
    mensaje: '💬 Mensaje',
    versiculo: '📖 Versículo',
  };

  const buttonLabels: Record<keyof Plantilla['botones'], string> = {
    confirmar: '✨ Botón Confirmar',
    regalos: '🎁 Botón Regalos',
    mapa: '📍 Botón Ubicación',
  };

  const fonts = [
    'Dancing Script',
    'Great Vibes',
    'Playfair Display',
    'Georgia',
    'Poppins',
    'Montserrat',
  ];

  const renderColorPicker = (
    label: string,
    value: string,
    onChange: (color: string) => void,
    isTextColor: boolean = false
  ) => (
    <div>
      <label className="block text-xs text-gray-700 font-semibold mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-10 border-2 border-gray-400 rounded cursor-pointer"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border-2 border-gray-400 rounded text-sm font-mono uppercase text-gray-900 font-semibold"
          placeholder="#000000"
        />
      </div>
      
      <div className="mt-2 flex gap-1.5 flex-wrap">
        {suggestedColors.map((color, index) => (
          <button
            key={`${label}-color-${index}`}
            type="button"
            onClick={() => onChange(color.value)}
            className="w-6 h-6 rounded border-2 border-white shadow-md hover:scale-125 transition ring-1 ring-gray-300"
            style={{ backgroundColor: color.value }}
            title={color.name}
          />
        ))}
      </div>
    </div>
  );

  const renderFieldConfig = (label: string, field: TemplateField | undefined, onAdd: () => void, onRemove: () => void, onUpdate: (field: TemplateField) => void, fieldKey: string) => (
    <div className="bg-white p-4 rounded-lg shadow-md border-2 border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <label className="font-bold text-gray-900">{label}</label>
        {!field ? (
          <button
            onClick={onAdd}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
          >
            ➕ Agregar
          </button>
        ) : (
          <button
            onClick={onRemove}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
          >
            🗑️ Eliminar
          </button>
        )}
      </div>

      {field && (
        <div className="grid md:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs text-gray-700 font-semibold mb-1">X</label>
            <input
              type="text"
              value={field.x}
              onChange={(e) => onUpdate({
                ...field,
                x: e.target.value === 'center' ? 'center' : parseInt(e.target.value) || 0,
              })}
              className="w-full px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-semibold"
              placeholder="center"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 font-semibold mb-1">Y</label>
            <input
              type="number"
              value={field.y}
              onChange={(e) => onUpdate({
                ...field,
                y: parseInt(e.target.value) || 0,
              })}
              className="w-full px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-semibold"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-700 font-semibold mb-1">Fuente</label>
            <select
              value={field.fuente}
              onChange={(e) => onUpdate({ ...field, fuente: e.target.value })}
              className="w-full px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-semibold"
            >
              {fonts.map((font, index) => (
                <option key={`${fieldKey}-font-${index}`} value={font}>{font}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-700 font-semibold mb-1">Tamaño</label>
            <input
              type="number"
              value={field.tamaño}
              onChange={(e) => onUpdate({
                ...field,
                tamaño: parseInt(e.target.value) || 24,
              })}
              className="w-full px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-semibold"
            />
          </div>
          <div className="md:col-span-2">
            {renderColorPicker('Color', field.color, (color) => onUpdate({ ...field, color }))}
          </div>
          <div>
            <label className="block text-xs text-gray-700 font-semibold mb-1">Alineación</label>
            <select
              value={field.alineacion || 'center'}
              onChange={(e) => onUpdate({
                ...field,
                alineacion: e.target.value as 'left' | 'center' | 'right',
              })}
              className="w-full px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-semibold"
            >
              <option key="left" value="left">Izquierda</option>
              <option key="center" value="center">Centro</option>
              <option key="right" value="right">Derecha</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-bold text-gray-900">🎨 Configurador de Plantilla</h3>
        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-lg"
        >
          💾 Guardar Configuración
        </button>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">📐</span> Dimensiones de la Plantilla
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Ancho (px)</label>
            <input
              type="number"
              value={anchoPlantilla}
              onChange={(e) => setAnchoPlantilla(parseInt(e.target.value) || 675)}
              className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Alto (px)</label>
            <input
              type="number"
              value={altoPlantilla}
              onChange={(e) => setAltoPlantilla(parseInt(e.target.value) || 1200)}
              className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">Tamaño Común</label>
            <select
              onChange={(e) => {
                const [ancho, alto] = e.target.value.split('x').map(Number);
                setAnchoPlantilla(ancho);
                setAltoPlantilla(alto);
              }}
              className="w-full px-4 py-3 border-2 border-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 font-semibold"
            >
              <option value="">Personalizado</option>
              <option key="675x1200" value="675x1200">675 x 1200 (Vertical)</option>
              <option key="800x1000" value="800x1000">800 x 1000 (Cuadrado Vertical)</option>
              <option key="1080x1080" value="1080x1080">1080 x 1080 (Cuadrado)</option>
              <option key="1200x675" value="1200x675">1200 x 675 (Horizontal)</option>
              <option key="1080x1920" value="1080x1920">1080 x 1920 (Story)</option>
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-4 flex-wrap">
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Proporción:</span> {anchoPlantilla}:{altoPlantilla}
          </div>
          <div 
            className="border-2 border-purple-400 bg-purple-100"
            style={{ 
              width: Math.min(anchoPlantilla / 10, 200), 
              height: Math.min(altoPlantilla / 10, 300) 
            }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          key="tab-campos"
          onClick={() => setActiveTab('campos')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'campos'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
          }`}
        >
          📝 Campos Estándar
        </button>
        <button
          key="tab-personalizados"
          onClick={() => setActiveTab('personalizados')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'personalizados'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
          }`}
        >
          ✏️ Campos Personalizados
        </button>
        <button
          key="tab-botones"
          onClick={() => setActiveTab('botones')}
          className={`px-6 py-3 rounded-lg font-semibold transition ${
            activeTab === 'botones'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
              : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
          }`}
        >
          🔘 Botones
        </button>
      </div>

      <div className="relative bg-gray-100 rounded-xl p-8 overflow-auto">
        <div className="relative mx-auto" style={{ width: Math.min(anchoPlantilla, 675) }}>
          <img src={previewImage} alt="Preview" className="w-full h-auto rounded-lg shadow-lg" />

          {Object.entries(campos).map(([key, field], index) =>
            field ? (
              <div
                key={`campo-${key}-${index}`}
                className="absolute whitespace-nowrap px-2 py-1 bg-white/90 rounded border-2 border-purple-600"
                style={{
                  left: typeof field.x === 'number' ? field.x : '50%',
                  top: field.y,
                  transform: typeof field.x === 'number' ? 'none' : 'translateX(-50%)',
                  fontFamily: field.fuente,
                  fontSize: `${field.tamaño}px`,
                  color: field.color,
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                }}
              >
                {key}
              </div>
            ) : null
          )}

          {camposPersonalizados.map((field, index) => (
            <div
              key={`custom-${field.id}-${index}`}
              className="absolute whitespace-nowrap px-2 py-1 bg-white/90 rounded border-2 border-blue-600"
              style={{
                left: typeof field.x === 'number' ? field.x : '50%',
                top: field.y,
                transform: typeof field.x === 'number' ? 'none' : 'translateX(-50%)',
                fontFamily: field.fuente,
                fontSize: `${field.tamaño}px`,
                color: field.color,
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              }}
            >
              {field.label}
            </div>
          ))}

          {Object.entries(botones).map(([key, button], index) =>
            button ? (
              <div
                key={`button-${key}-${index}`}
                className="absolute px-4 py-2 rounded-lg text-white font-bold shadow-lg border-2 border-white/50"
                style={{
                  left: typeof button.x === 'number' ? button.x : '50%',
                  top: button.y,
                  transform: typeof button.x === 'number' ? 'none' : 'translateX(-50%)',
                  width: button.ancho,
                  height: button.alto,
                  backgroundColor: button.color,
                  color: button.colorTexto,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                {button.texto}
              </div>
            ) : null
          )}
        </div>
      </div>

      {activeTab === 'campos' && (
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900">Configurar Campos Estándar</h4>
          {Object.entries(fieldLabels).map(([key, label], index) => (
            <div key={`field-label-${key}-${index}`}>
              {renderFieldConfig(
                label,
                campos[key as keyof Plantilla['campos']],
                () => handleAddField(key as keyof Plantilla['campos']),
                () => handleRemoveField(key as keyof Plantilla['campos']),
                (field) => handleUpdateField(key as keyof Plantilla['campos'], field),
                key
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'personalizados' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-gray-900">Campos de Texto Personalizados</h4>
            <div className="flex gap-2">
              <input
                type="text"
                value={nuevoCampoLabel}
                onChange={(e) => setNuevoCampoLabel(e.target.value)}
                placeholder="Nombre del campo (ej: Edad, Tema, etc.)"
                className="px-4 py-2 border-2 border-gray-400 rounded-lg text-gray-900 font-semibold"
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomField()}
              />
              <button
                onClick={handleAddCustomField}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition font-semibold"
              >
                ➕ Agregar Campo
              </button>
            </div>
          </div>

          {camposPersonalizados.length === 0 && (
            <div key="no-custom-fields" className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
              <p className="text-gray-500">No hay campos personalizados. Agrega uno arriba.</p>
            </div>
          )}

          {camposPersonalizados.map((field, index) => (
            <div key={`custom-field-${field.id}-${index}`} className="bg-white p-4 rounded-lg shadow-md border-2 border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <label className="font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-blue-600">✏️</span>
                  {field.label}
                </label>
                <button
                  onClick={() => handleRemoveCustomField(field.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                >
                  🗑️ Eliminar
                </button>
              </div>

              <div className="grid md:grid-cols-6 gap-3">
                <div>
                  <label className="block text-xs text-gray-700 font-semibold mb-1">X</label>
                  <input
                    type="text"
                    value={field.x}
                    onChange={(e) => handleUpdateCustomField(field.id, {
                      x: e.target.value === 'center' ? 'center' : parseInt(e.target.value) || 0,
                    })}
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-semibold"
                    placeholder="center"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 font-semibold mb-1">Y</label>
                  <input
                    type="number"
                    value={field.y}
                    onChange={(e) => handleUpdateCustomField(field.id, {
                      y: parseInt(e.target.value) || 0,
                    })}
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-700 font-semibold mb-1">Fuente</label>
                  <select
                    value={field.fuente}
                    onChange={(e) => handleUpdateCustomField(field.id, { fuente: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-semibold"
                  >
                    {fonts.map((font, fontIndex) => (
                      <option key={`custom-${field.id}-font-${fontIndex}`} value={font}>{font}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-700 font-semibold mb-1">Tamaño</label>
                  <input
                    type="number"
                    value={field.tamaño}
                    onChange={(e) => handleUpdateCustomField(field.id, {
                      tamaño: parseInt(e.target.value) || 24,
                    })}
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-semibold"
                  />
                </div>
                <div className="md:col-span-2">
                  {renderColorPicker(`custom-color-${field.id}`, field.color, (color) => handleUpdateCustomField(field.id, { color }))}
                </div>
                <div>
                  <label className="block text-xs text-gray-700 font-semibold mb-1">Alineación</label>
                  <select
                    value={field.alineacion || 'center'}
                    onChange={(e) => handleUpdateCustomField(field.id, {
                      alineacion: e.target.value as 'left' | 'center' | 'right',
                    })}
                    className="w-full px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-semibold"
                  >
                    <option key="left" value="left">Izquierda</option>
                    <option key="center" value="center">Centro</option>
                    <option key="right" value="right">Derecha</option>
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'botones' && (
        <div className="space-y-4">
          <h4 className="font-bold text-gray-900">Configurar Botones</h4>
          {Object.entries(buttonLabels).map(([key, label], index) => (
            <div key={`button-config-${key}-${index}`} className="bg-white p-4 rounded-lg shadow-md border-2 border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <label className="font-bold text-gray-900">{label}</label>
                {!botones[key as keyof Plantilla['botones']] ? (
                  <button
                    onClick={() => handleAddButton(key as keyof Plantilla['botones'])}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                  >
                    ➕ Agregar
                  </button>
                ) : (
                  <button
                    onClick={() => handleRemoveButton(key as keyof Plantilla['botones'])}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition text-sm font-medium"
                  >
                    🗑️ Eliminar
                  </button>
                )}
              </div>

              {botones[key as keyof Plantilla['botones']] && (
                <div className="grid md:grid-cols-7 gap-3">
                  <div>
                    <label className="block text-xs text-gray-700 font-semibold mb-1">X</label>
                    <input
                      type="text"
                      value={botones[key as keyof Plantilla['botones']]?.x || ''}
                      onChange={(e) => handleUpdateButton(key as keyof Plantilla['botones'], {
                        ...botones[key as keyof Plantilla['botones']]!,
                        x: e.target.value === 'center' ? 'center' : parseInt(e.target.value) || 0,
                      })}
                      className="w-full px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 font-semibold mb-1">Y</label>
                    <input
                      type="number"
                      value={botones[key as keyof Plantilla['botones']]?.y || 0}
                      onChange={(e) => handleUpdateButton(key as keyof Plantilla['botones'], {
                        ...botones[key as keyof Plantilla['botones']]!,
                        y: parseInt(e.target.value) || 0,
                      })}
                      className="w-full px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 font-semibold mb-1">Ancho</label>
                    <input
                      type="number"
                      value={botones[key as keyof Plantilla['botones']]?.ancho || 200}
                      onChange={(e) => handleUpdateButton(key as keyof Plantilla['botones'], {
                        ...botones[key as keyof Plantilla['botones']]!,
                        ancho: parseInt(e.target.value) || 200,
                      })}
                      className="w-full px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-700 font-semibold mb-1">Alto</label>
                    <input
                      type="number"
                      value={botones[key as keyof Plantilla['botones']]?.alto || 50}
                      onChange={(e) => handleUpdateButton(key as keyof Plantilla['botones'], {
                        ...botones[key as keyof Plantilla['botones']]!,
                        alto: parseInt(e.target.value) || 50,
                      })}
                      className="w-full px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-semibold"
                    />
                  </div>
                  <div>
                    {renderColorPicker(`button-color-${key}`, botones[key as keyof Plantilla['botones']]?.color || '#000000', (color) => handleUpdateButton(key as keyof Plantilla['botones'], {
                      ...botones[key as keyof Plantilla['botones']]!,
                      color,
                    }))}
                  </div>
                  <div>
                    {renderColorPicker(`button-text-color-${key}`, botones[key as keyof Plantilla['botones']]?.colorTexto || '#ffffff', (color) => handleUpdateButton(key as keyof Plantilla['botones'], {
                      ...botones[key as keyof Plantilla['botones']]!,
                      colorTexto: color,
                    }), true)}
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-xs text-gray-700 font-semibold mb-1">Texto</label>
                    <input
                      type="text"
                      value={botones[key as keyof Plantilla['botones']]?.texto || ''}
                      onChange={(e) => handleUpdateButton(key as keyof Plantilla['botones'], {
                        ...botones[key as keyof Plantilla['botones']]!,
                        texto: e.target.value,
                      })}
                      className="w-full px-3 py-2 border-2 border-gray-400 rounded text-sm text-gray-900 font-semibold"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}