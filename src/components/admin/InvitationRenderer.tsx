// src/components/admin/InvitationRenderer.tsx
'use client';
import { Plantilla, CustomTextField, sanitizeHtml, replaceTemplateVariables, detectCountdownElements, injectCountdownScript } from '@/lib/templates';

interface Props {
  plantilla: Plantilla;
  eventData: any;
  onConfirm?: () => void;
  onGifts?: () => void;
  onMap?: () => void;
  currentSection?: 'form' | 'info' | 'rsvp' | 'confirmation' | 'gifts' | 'thankyou';
}

export default function InvitationRenderer({ 
  plantilla, 
  eventData, 
  onConfirm, 
  onGifts,
  onMap,
  currentSection = 'info'
}: Props) {
  const { campos, botones, camposPersonalizados } = plantilla;

  const getFieldValue = (field: string): string => {
    const config = eventData.configuracion || {};
    const personalizada = config.personalizada || {};
    
    const fieldMap: Record<string, string> = {
      titulo: eventData.tituloPrincipal || 'Evento Especial',
      nombre: personalizada.nombreBebe || 'Nombre del Bebé',
      fecha: config.fecha || 'Por definir',
      hora: config.hora || 'Por definir',
      lugar: config.lugar || 'Por definir',
      mensaje: config.mensaje || '',
      versiculo: personalizada.versiculo || '',
      nombreBebe: personalizada.nombreBebe || '',
      padres: personalizada.mostrarPadres !== 'false' ? (personalizada.padres || '') : '',
      genero: personalizada.genero || '',
      edad: personalizada.edad || '',
      temaFiesta: personalizada.temaFiesta || '',
      novioNombre: personalizada.novioNombre || '',
      noviaNombre: personalizada.noviaNombre || '',
      graduadoNombre: personalizada.graduadoNombre || '',
    };
    
    return fieldMap[field] || '';
  };

  const getCustomFieldValue = (field: CustomTextField): string => {
    const config = eventData.configuracion || {};
    const personalizada = config.personalizada || {};
    
    const key = field.label.toLowerCase().replace(/\s+/g, '').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    
    const valor = personalizada[field.label] || 
                  personalizada[key] || 
                  personalizada[field.label.toLowerCase()] ||
                  '';
    
    return valor;
  };

  const getMapUrl = (): string => {
    const config = eventData.configuracion || {};
    
    if (config.mapaUrl) {
      return config.mapaUrl;
    }
    
    const lugar = config.lugar || '';
    if (!lugar) return 'https://maps.google.com';
    
    const encodedAddress = encodeURIComponent(lugar);
    return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  };

  const getTextAlign = (align?: string) => {
    switch (align) {
      case 'left': return 'left';
      case 'right': return 'right';
      case 'center':
      default: return 'center';
    }
  };

  const shouldShowButton = (buttonName: string) => {
    if (currentSection !== 'info') {
      return false;
    }
    return true;
  };

  const scaleFactor = plantilla.anchoPlantilla 
    ? Math.min(800 / plantilla.anchoPlantilla, 1) 
    : 1;

  const calculatePosition = (value: number | string, isX: boolean = true): string => {
    if (typeof value === 'string') {
      return value;
    }
    
    const scaled = value * scaleFactor;
    return `${scaled}px`;
  };

  // HTML template rendering
  if (plantilla.tipo === 'html' && plantilla.htmlContent) {
    const config = eventData.configuracion || {};
    const personalizada = config.personalizada || {};
    
    const variables: Record<string, string> = {
      titulo: eventData.tituloPrincipal || '',
      nombre: personalizada.nombreBebe || '',
      fecha: config.fecha || '',
      hora: config.hora || '',
      lugar: config.lugar || '',
      mensaje: config.mensaje || '',
      versiculo: personalizada.versiculo || '',
      padres: personalizada.mostrarPadres !== 'false' ? (personalizada.padres || '') : '',
      genero: personalizada.genero || '',
      edad: personalizada.edad || '',
      temaFiesta: personalizada.temaFiesta || '',
      novioNombre: personalizada.novioNombre || '',
      noviaNombre: personalizada.noviaNombre || '',
      graduadoNombre: personalizada.graduadoNombre || '',
      imagenPrincipal: personalizada.imagenPrincipal || '',
    };

    // Sanitizar primero (elimina scripts del usuario)
    let processedHtml = sanitizeHtml(plantilla.htmlContent);
    
    // Detectar si hay elementos countdown
    const hasCountdown = detectCountdownElements(processedHtml);
    
    // Si hay countdown, inyectar script seguro del sistema
    if (hasCountdown) {
      processedHtml = injectCountdownScript(processedHtml, config.fecha, config.hora);
    }
    
    // Reemplazar variables
    processedHtml = replaceTemplateVariables(processedHtml, variables);
    
    // Permitir scripts para CDNs confiables (ya sanitizados) y same-origin para recursos
    const sandboxValue = 'allow-same-origin allow-scripts';

    return (
      <div className="relative w-full flex justify-center">
        <div className="w-full" style={{ maxWidth: '800px' }}>
          <iframe
            srcDoc={processedHtml}
            title="Invitación"
            className="w-full border-0"
            style={{ height: plantilla.altoPlantilla || 1200, maxHeight: '90vh' }}
            sandbox={sandboxValue}
          />
          {currentSection === 'info' && (
            <div className="flex flex-col items-center gap-3 mt-4">
              {botones?.confirmar && (
                <button
                  onClick={onConfirm}
                  className="font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer"
                  style={{
                    width: botones.confirmar.ancho || 280,
                    height: botones.confirmar.alto || 55,
                    backgroundColor: botones.confirmar.color || '#ec4899',
                    color: botones.confirmar.colorTexto || '#ffffff',
                    borderRadius: '25px',
                    fontSize: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    fontWeight: '700',
                  }}
                >
                  {botones.confirmar.texto || '✨ Confirmar Asistencia'}
                </button>
              )}
              {botones?.regalos && (
                <button
                  onClick={onGifts}
                  className="font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer"
                  style={{
                    width: botones.regalos.ancho || 280,
                    height: botones.regalos.alto || 55,
                    backgroundColor: botones.regalos.color || '#8b5cf6',
                    color: botones.regalos.colorTexto || '#ffffff',
                    borderRadius: '25px',
                    fontSize: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    fontWeight: '700',
                  }}
                >
                  {botones.regalos.texto || '🎁 Ver Lista de Regalos'}
                </button>
              )}
              {botones?.mapa && (
                <button
                  onClick={() => window.open(getMapUrl(), '_blank')}
                  className="font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer"
                  style={{
                    width: botones.mapa.ancho || 280,
                    height: botones.mapa.alto || 55,
                    backgroundColor: botones.mapa.color || '#10b981',
                    color: botones.mapa.colorTexto || '#ffffff',
                    borderRadius: '25px',
                    fontSize: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    fontWeight: '700',
                  }}
                >
                  {botones.mapa.texto || '📍 Ver Ubicación'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full flex justify-center">
      <div 
        className="relative"
        style={{
          width: plantilla.anchoPlantilla 
            ? Math.min(plantilla.anchoPlantilla, 800)
            : '100%',
          maxWidth: '100%'
        }}
      >
        <img
          src={plantilla.imagenFondo}
          alt="Invitación"
          className="w-full h-auto object-contain"
          style={{ imageRendering: 'crisp-edges' }}
        />

        {campos && Object.entries(campos).map(([key, field]) => {
          if (!field) return null;
          
          const value = getFieldValue(key);
          if (!value) return null;
          
          return (
            <div
              key={key}
              className="absolute whitespace-nowrap"
              style={{
                left: calculatePosition(field.x, true),
                top: calculatePosition(field.y, false),
                transform: typeof field.x === 'string' && field.x === 'center' 
                  ? 'translateX(-50%)' 
                  : 'none',
                fontFamily: field.fuente,
                fontSize: `${(field.tamaño || 24) * scaleFactor}px`,
                color: field.color,
                textAlign: getTextAlign(field.alineacion),
                fontWeight: field.fuente.includes('Script') || field.fuente.includes('Vibes') ? '700' : '600',
                zIndex: 10,
                textShadow: `
                  2px 2px 0px rgba(0,0,0,0.3),
                  -1px -1px 0px rgba(0,0,0,0.3),
                  1px -1px 0px rgba(0,0,0,0.3),
                  -1px 1px 0px rgba(0,0,0,0.3),
                  1px 1px 0px rgba(0,0,0,0.3)
                `,
                WebkitTextStroke: field.fuente.includes('Script') ? '0.5px rgba(0,0,0,0.2)' : '0px',
                filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))',
              }}
            >
              {value}
            </div>
          );
        })}

        {camposPersonalizados && camposPersonalizados
          .filter(field => field.activo !== false)
          .map((field) => {
            const value = getCustomFieldValue(field);
            if (!value) return null;
            
            return (
              <div
                key={field.id}
                className="absolute whitespace-nowrap"
                style={{
                  left: calculatePosition(field.x, true),
                  top: calculatePosition(field.y, false),
                  transform: typeof field.x === 'string' && field.x === 'center' 
                    ? 'translateX(-50%)' 
                    : 'none',
                  fontFamily: field.fuente,
                  fontSize: `${(field.tamaño || 24) * scaleFactor}px`,
                  color: field.color,
                  textAlign: getTextAlign(field.alineacion),
                  fontWeight: field.fuente.includes('Script') || field.fuente.includes('Vibes') ? '700' : '600',
                  zIndex: 10,
                  textShadow: `
                    2px 2px 0px rgba(0,0,0,0.3),
                    -1px -1px 0px rgba(0,0,0,0.3),
                    1px -1px 0px rgba(0,0,0,0.3),
                    -1px 1px 0px rgba(0,0,0,0.3),
                    1px 1px 0px rgba(0,0,0,0.3)
                  `,
                  WebkitTextStroke: field.fuente.includes('Script') ? '0.5px rgba(0,0,0,0.2)' : '0px',
                  filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))',
                }}
              >
                {value}
              </div>
            );
          })}

        {botones && shouldShowButton('confirmar') && botones.confirmar && (
          <button
            onClick={onConfirm}
            className="absolute font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer z-20"
            style={{
              left: calculatePosition(botones.confirmar.x, true),
              top: `${botones.confirmar.y * scaleFactor}px`,
              transform: typeof botones.confirmar.x === 'string' && botones.confirmar.x === 'center'
                ? 'translateX(-50%)'
                : 'none',
              width: (botones.confirmar.ancho || 280) * scaleFactor,
              height: (botones.confirmar.alto || 55) * scaleFactor,
              backgroundColor: botones.confirmar.color || '#ec4899',
              color: botones.confirmar.colorTexto || '#ffffff',
              borderRadius: '25px',
              fontSize: `${16 * scaleFactor}px`,
              border: '2px solid rgba(255,255,255,0.3)',
              padding: '0 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            {botones.confirmar.texto || '✨ Confirmar Asistencia'}
          </button>
        )}

        {botones && shouldShowButton('regalos') && botones.regalos && (
          <button
            onClick={onGifts}
            className="absolute font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer z-20"
            style={{
              left: calculatePosition(botones.regalos.x, true),
              top: `${botones.regalos.y * scaleFactor}px`,
              transform: typeof botones.regalos.x === 'string' && botones.regalos.x === 'center'
                ? 'translateX(-50%)'
                : 'none',
              width: (botones.regalos.ancho || 280) * scaleFactor,
              height: (botones.regalos.alto || 55) * scaleFactor,
              backgroundColor: botones.regalos.color || '#8b5cf6',
              color: botones.regalos.colorTexto || '#ffffff',
              borderRadius: '25px',
              fontSize: `${16 * scaleFactor}px`,
              border: '2px solid rgba(255,255,255,0.3)',
              padding: '0 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            {botones.regalos.texto || '🎁 Ver Lista de Regalos'}
          </button>
        )}

        {botones && shouldShowButton('mapa') && botones.mapa && (
          <button
            onClick={() => {
              const mapUrl = getMapUrl();
              window.open(mapUrl, '_blank');
            }}
            className="absolute font-semibold shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer z-20"
            style={{
              left: calculatePosition(botones.mapa.x, true),
              top: `${botones.mapa.y * scaleFactor}px`,
              transform: typeof botones.mapa.x === 'string' && botones.mapa.x === 'center'
                ? 'translateX(-50%)'
                : 'none',
              width: (botones.mapa.ancho || 280) * scaleFactor,
              height: (botones.mapa.alto || 55) * scaleFactor,
              backgroundColor: botones.mapa.color || '#10b981',
              color: botones.mapa.colorTexto || '#ffffff',
              borderRadius: '25px',
              fontSize: `${16 * scaleFactor}px`,
              border: '2px solid rgba(255,255,255,0.3)',
              padding: '0 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            {botones.mapa.texto || '📍 Ver Ubicación'}
          </button>
        )}
      </div>
    </div>
  );
}