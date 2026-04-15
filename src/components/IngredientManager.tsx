import React, { useState } from 'react';
import { Plus, Search, TrendingDown, Store as StoreIcon, Tag, Calendar } from 'lucide-react';
import { Ingredient, PriceEntry, Store, Unit } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../lib/utils';
import ReceiptScanner from './ReceiptScanner';

const STORES: Store[] = ['Feria', 'Tata', 'Tienda Inglesa', 'Disco', 'Devoto', 'Macro Mercado', 'Otro'];
const UNITS: Unit[] = ['kg', 'litro', 'unidad', '100g'];
const CATEGORIES = ['Verduras', 'Frutas', 'Carnes', 'Lácteos', 'Secos', 'Especias', 'Otro'];

interface Props {
  ingredients: Ingredient[];
  onAddIngredient: (ing: Ingredient) => void;
  onAddPrice: (ingredientId: string, price: PriceEntry) => void;
  onBulkAdd: (items: any[]) => void;
}

export default function IngredientManager({ ingredients, onAddIngredient, onAddPrice, onBulkAdd }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIngredientId, setSelectedIngredientId] = useState<string | null>(null);

  // New Ingredient State
  const [newIngName, setNewIngName] = useState('');
  const [newIngCategory, setNewIngCategory] = useState(CATEGORIES[0]);
  const [newIngUnit, setNewIngUnit] = useState<Unit>('kg');

  // New Price State
  const [newPriceStore, setNewPriceStore] = useState<Store>('Feria');
  const [newPriceValue, setNewPriceValue] = useState('');
  const [newPriceNotes, setNewPriceNotes] = useState('');

  const filteredIngredients = ingredients.filter(ing => 
    ing.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ing.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName.trim()) return;
    
    const newIng: Ingredient = {
      id: uuidv4(),
      name: newIngName,
      category: newIngCategory,
      unit: newIngUnit,
      prices: []
    };
    
    onAddIngredient(newIng);
    setNewIngName('');
    setShowAddModal(false);
  };

  const handleAddPrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredientId || !newPriceValue) return;

    const priceEntry: PriceEntry = {
      id: uuidv4(),
      store: newPriceStore,
      price: parseFloat(newPriceValue),
      date: new Date().toISOString(),
      notes: newPriceNotes
    };

    onAddPrice(selectedIngredientId, priceEntry);
    setNewPriceValue('');
    setNewPriceNotes('');
    setSelectedIngredientId(null);
  };

  const getLowestPrice = (prices: PriceEntry[]) => {
    if (prices.length === 0) return null;
    return prices.reduce((min, p) => p.price < min.price ? p : min, prices[0]);
  };

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-editorial-muted w-4 h-4" />
          <input 
            type="text"
            placeholder="Buscar insumos (ej. Papa, Pollo)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-transparent border border-editorial-line rounded-none focus:outline-none focus:border-editorial-ink focus:ring-1 focus:ring-editorial-ink transition-all font-sans text-sm"
          />
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <ReceiptScanner onScanComplete={onBulkAdd} />
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-editorial-ink hover:bg-editorial-line text-editorial-bg px-5 py-3 rounded-none text-xs font-bold uppercase tracking-wider transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Nuevo Insumo
          </button>
        </div>
      </div>

      {/* Ingredients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredIngredients.map(ing => {
          const lowestPrice = getLowestPrice(ing.prices);
          
          return (
            <div key={ing.id} className="bg-transparent border border-editorial-line p-5 group hover:bg-editorial-accent/5 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-editorial-ink text-base flex items-center flex-wrap gap-2">
                    {ing.name}
                    <span className="text-[10px] uppercase tracking-wider text-editorial-muted border border-editorial-line px-1.5 py-0.5">
                      {ing.category}
                    </span>
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase tracking-wider text-editorial-muted block mb-1">Mejor precio ({ing.unit})</span>
                  {lowestPrice ? (
                    <div className="font-mono font-bold text-xl text-editorial-ink">
                      ${lowestPrice.price.toFixed(2)}
                    </div>
                  ) : (
                    <span className="text-editorial-muted text-xs italic">Sin datos</span>
                  )}
                </div>
              </div>

              {lowestPrice && (
                <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-editorial-muted mb-5 border-b border-editorial-line/20 pb-3">
                  <StoreIcon className="w-3 h-3" />
                  <span className="font-bold text-editorial-ink">{lowestPrice.store}</span>
                  <span>•</span>
                  <Calendar className="w-3 h-3" />
                  <span>{format(new Date(lowestPrice.date), "d MMM yyyy", { locale: es })}</span>
                </div>
              )}

              <button 
                onClick={() => setSelectedIngredientId(ing.id)}
                className="w-full py-2.5 border border-editorial-line rounded-none text-xs font-bold uppercase tracking-wider text-editorial-ink hover:bg-editorial-ink hover:text-editorial-bg transition-colors flex items-center justify-center gap-2"
              >
                <Tag className="w-3.5 h-3.5" />
                Registrar Precio
              </button>
            </div>
          );
        })}
        
        {filteredIngredients.length === 0 && (
          <div className="col-span-full py-16 text-center border border-editorial-line border-dashed">
            <div className="w-12 h-12 border border-editorial-line flex items-center justify-center mx-auto mb-4">
              <Search className="w-5 h-5 text-editorial-muted" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-editorial-ink mb-1">No se encontraron insumos</h3>
            <p className="text-editorial-muted text-sm">Agrega tu primer insumo para comenzar a trackear precios.</p>
          </div>
        )}
      </div>

      {/* Add Ingredient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-editorial-ink/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-editorial-bg border-2 border-editorial-line w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-editorial-line">
              <h2 className="font-serif italic text-2xl text-editorial-ink">Nuevo Insumo</h2>
              <p className="text-xs uppercase tracking-wider text-editorial-muted mt-2">Agrega un ingrediente a tu lista maestra.</p>
            </div>
            <form onSubmit={handleAddIngredient} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-editorial-ink mb-2">Nombre</label>
                <input 
                  type="text" 
                  required
                  value={newIngName}
                  onChange={e => setNewIngName(e.target.value)}
                  placeholder="Ej. Pechuga de Pollo"
                  className="w-full px-3 py-2.5 bg-transparent border border-editorial-line rounded-none focus:ring-1 focus:ring-editorial-ink focus:border-editorial-ink outline-none text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-editorial-ink mb-2">Categoría</label>
                  <select 
                    value={newIngCategory}
                    onChange={e => setNewIngCategory(e.target.value)}
                    className="w-full px-3 py-2.5 bg-transparent border border-editorial-line rounded-none focus:ring-1 focus:ring-editorial-ink focus:border-editorial-ink outline-none text-sm"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-editorial-ink mb-2">Unidad</label>
                  <select 
                    value={newIngUnit}
                    onChange={e => setNewIngUnit(e.target.value as Unit)}
                    className="w-full px-3 py-2.5 bg-transparent border border-editorial-line rounded-none focus:ring-1 focus:ring-editorial-ink focus:border-editorial-ink outline-none text-sm"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 border border-editorial-line text-editorial-ink rounded-none text-xs font-bold uppercase tracking-wider hover:bg-editorial-line/10 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-editorial-ink text-editorial-bg rounded-none text-xs font-bold uppercase tracking-wider hover:bg-editorial-line transition-colors"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Price Modal */}
      {selectedIngredientId && (
        <div className="fixed inset-0 bg-editorial-ink/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-editorial-bg border-2 border-editorial-line w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-editorial-line">
              <h2 className="font-serif italic text-2xl text-editorial-ink">Registrar Precio</h2>
              <p className="text-xs uppercase tracking-wider text-editorial-muted mt-2">
                {ingredients.find(i => i.id === selectedIngredientId)?.name} 
                ({ingredients.find(i => i.id === selectedIngredientId)?.unit})
              </p>
            </div>
            <form onSubmit={handleAddPrice} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-editorial-ink mb-2">Comercio</label>
                  <select 
                    value={newPriceStore}
                    onChange={e => setNewPriceStore(e.target.value as Store)}
                    className="w-full px-3 py-2.5 bg-transparent border border-editorial-line rounded-none focus:ring-1 focus:ring-editorial-ink focus:border-editorial-ink outline-none text-sm"
                  >
                    {STORES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-editorial-ink mb-2">Precio (UYU)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-editorial-muted font-mono">$</span>
                    <input 
                      type="number" 
                      required
                      min="0"
                      step="0.1"
                      value={newPriceValue}
                      onChange={e => setNewPriceValue(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-2.5 bg-transparent border border-editorial-line rounded-none focus:ring-1 focus:ring-editorial-ink focus:border-editorial-ink outline-none font-mono text-sm"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-wider font-bold text-editorial-ink mb-2">Notas (Opcional)</label>
                <input 
                  type="text" 
                  value={newPriceNotes}
                  onChange={e => setNewPriceNotes(e.target.value)}
                  placeholder="Ej. Oferta llevando 2..."
                  className="w-full px-3 py-2.5 bg-transparent border border-editorial-line rounded-none focus:ring-1 focus:ring-editorial-ink focus:border-editorial-ink outline-none text-sm"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setSelectedIngredientId(null)}
                  className="flex-1 px-4 py-3 border border-editorial-line text-editorial-ink rounded-none text-xs font-bold uppercase tracking-wider hover:bg-editorial-line/10 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-3 bg-editorial-ink text-editorial-bg rounded-none text-xs font-bold uppercase tracking-wider hover:bg-editorial-line transition-colors"
                >
                  Guardar Precio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
