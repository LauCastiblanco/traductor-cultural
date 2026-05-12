import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Necesario para usar en frontend
});

/**
 * Traduce un texto con adaptación cultural
 * @param {string} textoOriginal - El texto a traducir
 * @param {string} idiomaOrigen - Nombre del idioma de origen
 * @param {string} idiomaDestino - Nombre del idioma de destino
 * @returns {object} - Objeto con traducción base, adaptada e indicadores
 */
export const traducirConAdaptacionCultural = async (
  textoOriginal,
  idiomaOrigen,
  idiomaDestino
) => {
  try {
    const prompt = `Eres un traductor cultural experto. Tu tarea es:

1. Traducir el siguiente texto de ${idiomaOrigen} a ${idiomaDestino}
2. Adaptar culturalmente el contenido manteniendo la intención original
3. Proporcionar un análisis de los cambios realizados

TEXTO A TRADUCIR:
"${textoOriginal}"

Por favor responde en formato JSON con esta estructura exacta:
{
  "traduccionBase": "la traducción literal",
  "traduccionAdaptada": "la traducción culturalmente adaptada",
  "nivelAdaptacion": número entre 0 y 100,
  "conservacionTono": número entre 0 y 100,
  "naturalidad": número entre 0 y 100,
  "expresionesReformuladas": número entre 0 y 100,
  "explicacion": "explicación breve de los cambios realizados"
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Eres un experto en traducción cultural. Siempre respondes en JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Extraer el contenido de la respuesta
    const contenido = response.choices[0].message.content;
    
    // Parsear el JSON
    const resultado = JSON.parse(contenido);

    return {
      success: true,
      data: {
        textoOriginal,
        traduccionBase: resultado.traduccionBase,
        traduccionAdaptada: resultado.traduccionAdaptada,
        indicadores: {
          adaptacion: resultado.nivelAdaptacion,
          tono: resultado.conservacionTono,
          naturalidad: resultado.naturalidad,
          expresiones: resultado.expresionesReformuladas
        },
        explicacion: resultado.explicacion
      }
    };
  } catch (error) {
    console.error('Error en traducción:', error);
    return {
      success: false,
      error: error.message || 'Error al traducir. Intenta nuevamente.'
    };
  }
};
