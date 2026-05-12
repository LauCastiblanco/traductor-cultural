import { useState, useEffect } from 'react';
import { fetchIdiomas } from '../api';
import { traducirConAdaptacionCultural } from '../services/translationService';

export default function TranslatorModule() {
  const [textoOriginal, setTextoOriginal] = useState('');
  const [idiomaOrigen, setIdiomaOrigen] = useState('');
  const [idiomaDestino, setIdiomaDestino] = useState('');
  const [idiomas, setIdiomas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');

  // Cargar idiomas desde Strapi
  useEffect(() => {
    fetchIdiomas()
      .then(res => {
        console.log('Idiomas cargados:', res.data);
        const idiomasData = res.data.data || [];
        setIdiomas(idiomasData);
        if (idiomasData.length > 0) {
          setIdiomaOrigen(idiomasData[0].id);
          setIdiomaDestino(idiomasData[1]?.id || idiomasData[0].id);
        }
      })
      .catch(err => {
        console.error('Error cargando idiomas:', err);
        setError('No se pudieron cargar los idiomas');
      });
  }, []);

  // Manejar traducción
  const handleTraducir = async (e) => {
    e.preventDefault();
    
    if (!textoOriginal.trim()) {
      setError('Por favor ingresa un texto para traducir');
      return;
    }
    
    if (idiomaOrigen === idiomaDestino) {
      setError('Selecciona idiomas diferentes');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Obtener nombres de idiomas
        const idiomaOrigenObj = idiomas.find(i => i.id === idiomaOrigen);
        const idiomaDestinoObj = idiomas.find(i => i.id === idiomaDestino);

        const idiomaOrigenNombre = idiomaOrigenObj?.nombre || 'Origen';
        const idiomaDestinoNombre = idiomaDestinoObj?.nombre || 'Destino';


      console.log(`Traduciendo de ${idiomaOrigenNombre} a ${idiomaDestinoNombre}`);

      // Llamar al servicio de OpenAI
      const respuesta = await traducirConAdaptacionCultural(
        textoOriginal,
        idiomaOrigenNombre,
        idiomaDestinoNombre
      );

      if (respuesta.success) {
        setResultado(respuesta.data);
      } else {
        setError(respuesta.error);
      }
    } catch (err) {
      setError('Error al traducir. Intenta nuevamente.');
      console.error('Error en traducción:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="translator">
      <div className="translator__header">
        <h1>🌍 Traductor Cultural</h1>
        <p>Traduce manteniendo el contexto cultural del contenido.</p>
      </div>

      <div className="translator__container">
        <div className="translator__grid">
          {/* PANEL IZQUIERDO - ENTRADA */}
          <form onSubmit={handleTraducir} className="translator__panel">
            <h3 className="translator__panel-title">Texto Original</h3>
            
            <textarea
              className="translator__textarea"
              placeholder="Escribe o pega el texto que deseas traducir..."
              value={textoOriginal}
              onChange={e => setTextoOriginal(e.target.value)}
              disabled={loading}
            />

            <div className="translator__language-selector">
              <div className="translator__language-group">
                <label htmlFor="idioma-origen">Idioma Origen</label>
                <select
                  id="idioma-origen"
                  value={idiomaOrigen}
                  onChange={e => setIdiomaOrigen(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Selecciona un idioma</option>
                  {idiomas.map(idioma => (
                    <option key={idioma.id} value={idioma.id}>
                      {idioma.nombre}
                    </option>
                  ))}
                </select>
              </div>

                          <div className="translator__language-group">
              <label htmlFor="idioma-destino">Idioma Destino</label>
              <select
                id="idioma-destino"
                value={idiomaDestino}
                onChange={e => setIdiomaDestino(e.target.value)}
                disabled={loading}
              >
                <option value="">Selecciona un idioma</option>
                {idiomas.map(idioma => (
                  <option key={idioma.id} value={idioma.id}>
                    {idioma.nombre}
                  </option>
                ))}
              </select>
            </div>
            </div>

            {error && <div className="input-error">{error}</div>}

            <button type="submit" className="translator__button" disabled={loading}>
              {loading ? (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                  Traduciendo...
                </>
              ) : (
                <>✨ Traducir</>
              )}
            </button>
          </form>

          {/* PANEL DERECHO - RESULTADOS */}
          <div className="translator__results">
            {!resultado && !loading && (
              <div className="translator__result-card empty">
                <p>Los resultados aparecerán aquí</p>
              </div>
            )}

            {loading && (
              <div className="translator__loading">
                <div className="spinner"></div>
                <p>Procesando tu traducción...</p>
              </div>
            )}

            {resultado && (
              <>
                <div className="translator__result-card">
                  <h3 className="translator__panel-title">Traducción Base</h3>
                  <div className="translator__result-content">{resultado.traduccionBase}</div>
                </div>

                <div className="translator__result-card">
                  <h3 className="translator__panel-title">Traducción Adaptada Culturalmente</h3>
                  <div className="translator__result-content">{resultado.traduccionAdaptada}</div>
                </div>

                <div className="translator__result-card">
                  <h3 className="translator__panel-title">Análisis Cultural</h3>
                  <div className="translator__indicators">
                    <div className="translator__indicator">
                      <div className="indicator__label">Adaptación</div>
                      <div className="indicator__value">{resultado.indicadores?.adaptacion || 0}%</div>
                      <div className="indicator__bar">
                        <div className="indicator__fill" style={{width: `${resultado.indicadores?.adaptacion || 0}%`}}></div>
                      </div>
                    </div>

                    <div className="translator__indicator">
                      <div className="indicator__label">Conservación Tono</div>
                      <div className="indicator__value">{resultado.indicadores?.tono || 0}%</div>
                      <div className="indicator__bar">
                        <div className="indicator__fill" style={{width: `${resultado.indicadores?.tono || 0}%`}}></div>
                      </div>
                    </div>

                    <div className="translator__indicator">
                      <div className="indicator__label">Naturalidad</div>
                      <div className="indicator__value">{resultado.indicadores?.naturalidad || 0}%</div>
                      <div className="indicator__bar">
                        <div className="indicator__fill" style={{width: `${resultado.indicadores?.naturalidad || 0}%`}}></div>
                      </div>
                    </div>

                    <div className="translator__indicator">
                      <div className="indicator__label">Expresiones Reformuladas</div>
                      <div className="indicator__value">{resultado.indicadores?.expresiones || 0}%</div>
                      <div className="indicator__bar">
                        <div className="indicator__fill" style={{width: `${resultado.indicadores?.expresiones || 0}%`}}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {resultado.explicacion && (
                  <div className="translator__result-card">
                    <h3 className="translator__panel-title">Explicación Cultural</h3>
                    <p>{resultado.explicacion}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
