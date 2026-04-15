import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Check, X, Receipt } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Store, Unit } from '../types';

interface ExtractedItem {
  name: string;
  price: number;
  store: Store;
  unit: Unit;
  category: string;
}

interface Props {
  onScanComplete: (items: ExtractedItem[]) => void;
}

export default function ReceiptScanner({ onScanComplete }: Props) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedItems, setScannedItems] = useState<ExtractedItem[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);

    try {
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const base64String = (reader.result as string).split(',')[1];
          resolve(base64String);
        };
        reader.onerror = reject;
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      // Initialize Gemini API
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        Analiza este ticket de compra de Uruguay. Extrae los productos y devuelve ÚNICAMENTE un array JSON válido.
        Cada objeto debe tener la siguiente estructura exacta:
        {
          "name": "Nombre del producto (limpio, capitalizado)",
          "price": número (el precio final del producto),
          "store": "Nombre del local (intenta deducirlo del ticket, elige uno: 'Feria', 'Tata', 'Tienda Inglesa', 'Disco', 'Devoto', 'Macro Mercado', 'Otro')",
          "unit": "Unidad de medida (dedúcela, elige una: 'kg', 'litro', 'unidad', '100g')",
          "category": "Categoría (dedúcela, elige una: 'Verduras', 'Frutas', 'Carnes', 'Lácteos', 'Secos', 'Especias', 'Otro')"
        }
        No incluyas markdown, ni bloques de código, solo el texto JSON puro.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { text: prompt },
            { inlineData: { data: base64Data, mimeType: file.type } }
          ]
        }
      });

      let jsonText = response.text || '[]';
      // Clean up potential markdown formatting
      jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const items: ExtractedItem[] = JSON.parse(jsonText);
      
      if (items.length === 0) {
        throw new Error("No se encontraron productos legibles en el ticket.");
      }

      setScannedItems(items);
    } catch (err) {
      console.error('Error scanning receipt:', err);
      setError('Hubo un error al leer el ticket. Asegúrate de que la imagen sea clara e inténtalo de nuevo.');
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleConfirm = () => {
    if (scannedItems) {
      onScanComplete(scannedItems);
      setScannedItems(null);
    }
  };

  const handleCancel = () => {
    setScannedItems(null);
    setError(null);
  };

  return (
    <>
      <input 
        type="file" 
        accept="image/*" 
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
      
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isScanning}
        className="flex items-center gap-2 bg-transparent border border-editorial-ink text-editorial-ink hover:bg-editorial-ink hover:text-editorial-bg px-5 py-3 rounded-none text-xs font-bold uppercase tracking-wider transition-colors w-full sm:w-auto justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isScanning ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Camera className="w-4 h-4" />
        )}
        {isScanning ? 'Analizando...' : 'Escanear Ticket'}
      </button>

      {/* Error Message */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-editorial-accent text-white p-4 border-2 border-editorial-ink shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] z-50 flex items-start gap-3 max-w-sm animate-in slide-in-from-bottom-4">
          <div className="flex-1">
            <h4 className="font-bold uppercase tracking-wider text-xs mb-1">Error de Lectura</h4>
            <p className="text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-white hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Review Modal */}
      {scannedItems && (
        <div className="fixed inset-0 bg-editorial-ink/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-editorial-bg border-2 border-editorial-line w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-editorial-line flex justify-between items-start">
              <div>
                <h2 className="font-serif italic text-2xl text-editorial-ink flex items-center gap-2">
                  <Receipt className="w-6 h-6" />
                  Ticket Procesado
                </h2>
                <p className="text-xs uppercase tracking-wider text-editorial-muted mt-2">Revisa los items detectados antes de guardarlos.</p>
              </div>
              <button onClick={handleCancel} className="text-editorial-muted hover:text-editorial-ink">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-transparent">
              <div className="space-y-4">
                {scannedItems.map((item, idx) => (
                  <div key={idx} className="border border-editorial-line p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-editorial-ink text-sm uppercase tracking-wider">{item.name}</h4>
                      <div className="flex gap-2 mt-1 text-[10px] uppercase tracking-wider text-editorial-muted">
                        <span>{item.category}</span>
                        <span>•</span>
                        <span>{item.store}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-lg text-editorial-ink">${item.price.toFixed(2)}</div>
                      <div className="text-[10px] uppercase tracking-wider text-editorial-muted">por {item.unit}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-editorial-line flex gap-3 bg-editorial-bg">
              <button 
                onClick={handleCancel}
                className="flex-1 px-4 py-3 border border-editorial-line text-editorial-ink rounded-none text-xs font-bold uppercase tracking-wider hover:bg-editorial-line/10 transition-colors"
              >
                Descartar
              </button>
              <button 
                onClick={handleConfirm}
                className="flex-1 px-4 py-3 bg-editorial-ink text-editorial-bg rounded-none text-xs font-bold uppercase tracking-wider hover:bg-editorial-line transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Guardar {scannedItems.length} Items
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
