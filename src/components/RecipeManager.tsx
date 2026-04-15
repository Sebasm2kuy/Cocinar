import React, { useState } from 'react';
import { Plus, Search, Clock, ChefHat, Flame, Trash2, BookOpen, Globe } from 'lucide-react';
import { Ingredient, Recipe } from '../types';
import { v4 as uuidv4 } from 'uuid';
import RecipeInspiration from './RecipeInspiration';

interface Props {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onAddRecipe: (recipe: Recipe) => void;
  onDeleteRecipe: (id: string) => void;
  onAddIngredient: (ingredient: Ingredient) => void;
}

export default function RecipeManager({ recipes, ingredients, onAddRecipe, onDeleteRecipe, onAddIngredient }: Props) {
  const [activeSubTab, setActiveSubTab] = useState<'mis-recetas' | 'inspiracion'>('mis-recetas');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Recipe State
  const [name, setName] = useState('');
  const [portions, setPortions] = useState(1);
  const [prepTime, setPrepTime] = useState(30);
  const [difficulty, setDifficulty] = useState(5);
  const [instructions, setInstructions] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState<{ ingredientId: string; quantity: number }[]>([]);

  const filteredRecipes = recipes.filter(r => r.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const getLowestPrice = (prices: any[]) => {
    if (!prices || prices.length === 0) return 0;
    return prices.reduce((min, p) => p.price < min.price ? p : min, prices[0]).price;
  };

  const calculateRecipeCost = (recipe: Recipe) => {
    let total = 0;
    recipe.ingredients.forEach(ri => {
      const ing = ingredients.find(i => i.id === ri.ingredientId);
      if (ing) {
        const bestPrice = getLowestPrice(ing.prices);
        total += bestPrice * ri.quantity;
      }
    });
    return total;
  };

  const handleAddIngredientRow = () => {
    if (ingredients.length === 0) return;
    setRecipeIngredients([...recipeIngredients, { ingredientId: ingredients[0].id, quantity: 1 }]);
  };

  const handleUpdateIngredientRow = (index: number, field: 'ingredientId' | 'quantity', value: any) => {
    const updated = [...recipeIngredients];
    updated[index] = { ...updated[index], [field]: value };
    setRecipeIngredients(updated);
  };

  const handleRemoveIngredientRow = (index: number) => {
    setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || recipeIngredients.length === 0) return;

    const newRecipe: Recipe = {
      id: uuidv4(),
      name,
      portions,
      prepTimeMinutes: prepTime,
      difficulty,
      instructions,
      ingredients: recipeIngredients
    };

    onAddRecipe(newRecipe);
    
    // Reset form
    setName('');
    setPortions(1);
    setPrepTime(30);
    setDifficulty(5);
    setInstructions('');
    setRecipeIngredients([]);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-8">
      {/* Sub Navigation */}
      <div className="flex border-b-2 border-editorial-line mb-8">
        <button
          onClick={() => setActiveSubTab('mis-recetas')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 -mb-[2px] ${
            activeSubTab === 'mis-recetas'
              ? 'border-editorial-ink text-editorial-ink'
              : 'border-transparent text-editorial-muted hover:text-editorial-ink'
          }`}
        >
          <ChefHat className="w-4 h-4" /> Mis Recetas
        </button>
        <button
          onClick={() => setActiveSubTab('inspiracion')}
          className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-2 border-b-2 -mb-[2px] ${
            activeSubTab === 'inspiracion'
              ? 'border-editorial-ink text-editorial-ink'
              : 'border-transparent text-editorial-muted hover:text-editorial-ink'
          }`}
        >
          <Globe className="w-4 h-4" /> Inspiración Web
        </button>
      </div>

      {activeSubTab === 'inspiracion' ? (
        <RecipeInspiration 
          ingredients={ingredients} 
          onAddRecipe={onAddRecipe} 
          onAddIngredient={onAddIngredient} 
        />
      ) : (
        <>
          {/* Header Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-editorial-muted w-4 h-4" />
              <input 
                type="text"
                placeholder="Buscar recetas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-transparent border border-editorial-line rounded-none focus:outline-none focus:border-editorial-ink focus:ring-1 focus:ring-editorial-ink transition-all font-sans text-sm"
              />
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-editorial-ink hover:bg-editorial-line text-editorial-bg px-5 py-3 rounded-none text-xs font-bold uppercase tracking-wider transition-colors w-full sm:w-auto justify-center"
            >
              <Plus className="w-4 h-4" />
              Nueva Receta
            </button>
          </div>

          {/* Recipes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecipes.map(recipe => {
          const totalCost = calculateRecipeCost(recipe);
          const costPerPortion = recipe.portions > 0 ? totalCost / recipe.portions : 0;

          return (
            <div key={recipe.id} className="bg-transparent border border-editorial-line p-0 flex flex-col group hover:bg-editorial-accent/5 transition-colors">
              <div className="p-5 border-b border-editorial-line flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-editorial-ink text-lg mb-1">{recipe.name}</h3>
                  <div className="flex gap-3 text-[10px] uppercase tracking-wider text-editorial-muted">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {recipe.prepTimeMinutes} min</span>
                    <span className="flex items-center gap-1"><Flame className="w-3 h-3"/> Dificultad: {recipe.difficulty}/20</span>
                  </div>
                </div>
                <button 
                  onClick={() => onDeleteRecipe(recipe.id)}
                  className="text-editorial-muted hover:text-editorial-accent transition-colors"
                  title="Eliminar receta"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 grid grid-cols-2 gap-4 bg-editorial-ink/5">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-editorial-muted block mb-1">Costo Total</span>
                  <div className="font-mono font-bold text-xl text-editorial-ink">${totalCost.toFixed(2)}</div>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-editorial-muted block mb-1">Por Día / Porción ({recipe.portions})</span>
                  <div className="font-mono font-bold text-xl text-editorial-accent">${costPerPortion.toFixed(2)}</div>
                </div>
              </div>

              <div className="p-5 flex-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-editorial-ink mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Insumos
                </h4>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ri, idx) => {
                    const ing = ingredients.find(i => i.id === ri.ingredientId);
                    return (
                      <li key={idx} className="text-sm flex justify-between border-b border-editorial-line/20 pb-1">
                        <span className="text-editorial-ink">{ing?.name || 'Desconocido'}</span>
                        <span className="font-mono text-editorial-muted">{ri.quantity} {ing?.unit}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          );
        })}

        {filteredRecipes.length === 0 && (
          <div className="col-span-full py-16 text-center border border-editorial-line border-dashed">
            <div className="w-12 h-12 border border-editorial-line flex items-center justify-center mx-auto mb-4">
              <ChefHat className="w-5 h-5 text-editorial-muted" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-editorial-ink mb-1">No hay recetas</h3>
            <p className="text-editorial-muted text-sm">Crea tu primera receta para calcular costos por porción.</p>
          </div>
        )}
      </div>

      {/* Add Recipe Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-editorial-ink/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-editorial-bg border-2 border-editorial-line w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-editorial-line">
              <h2 className="font-serif italic text-2xl text-editorial-ink">Nueva Receta</h2>
              <p className="text-xs uppercase tracking-wider text-editorial-muted mt-2">Diseña tu comida y calcula su rendimiento.</p>
            </div>
            
            <div className="overflow-y-auto p-6 flex-1">
              <form id="recipe-form" onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-editorial-ink mb-2">Nombre de la Receta</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ej. Guiso de Lentejas (Batch Cooking)"
                    className="w-full px-3 py-2.5 bg-transparent border border-editorial-line rounded-none focus:ring-1 focus:ring-editorial-ink focus:border-editorial-ink outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-editorial-ink mb-2">Porciones / Días</label>
                    <input 
                      type="number" 
                      required min="1"
                      value={portions}
                      onChange={e => setPortions(parseInt(e.target.value) || 1)}
                      className="w-full px-3 py-2.5 bg-transparent border border-editorial-line rounded-none focus:ring-1 focus:ring-editorial-ink focus:border-editorial-ink outline-none text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-editorial-ink mb-2">Tiempo (Min)</label>
                    <input 
                      type="number" 
                      required min="1"
                      value={prepTime}
                      onChange={e => setPrepTime(parseInt(e.target.value) || 30)}
                      className="w-full px-3 py-2.5 bg-transparent border border-editorial-line rounded-none focus:ring-1 focus:ring-editorial-ink focus:border-editorial-ink outline-none text-sm font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-editorial-ink mb-2">Dificultad (0-20)</label>
                    <input 
                      type="number" 
                      required min="0" max="20"
                      value={difficulty}
                      onChange={e => setDifficulty(parseInt(e.target.value) || 5)}
                      className="w-full px-3 py-2.5 bg-transparent border border-editorial-line rounded-none focus:ring-1 focus:ring-editorial-ink focus:border-editorial-ink outline-none text-sm font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-[11px] uppercase tracking-wider font-bold text-editorial-ink">Insumos Necesarios</label>
                    <button 
                      type="button"
                      onClick={handleAddIngredientRow}
                      className="text-[10px] uppercase tracking-wider font-bold text-editorial-accent hover:text-editorial-ink transition-colors"
                    >
                      + Agregar Insumo
                    </button>
                  </div>
                  
                  {ingredients.length === 0 ? (
                    <div className="text-sm text-editorial-muted italic border border-editorial-line p-4">
                      Primero debes agregar insumos en la pestaña "Insumos y Precios".
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recipeIngredients.map((ri, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                          <select 
                            value={ri.ingredientId}
                            onChange={e => handleUpdateIngredientRow(idx, 'ingredientId', e.target.value)}
                            className="flex-1 px-3 py-2 bg-transparent border border-editorial-line rounded-none focus:ring-1 focus:ring-editorial-ink focus:border-editorial-ink outline-none text-sm"
                          >
                            {ingredients.map(ing => (
                              <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                            ))}
                          </select>
                          <input 
                            type="number" 
                            required min="0.01" step="0.01"
                            value={ri.quantity}
                            onChange={e => handleUpdateIngredientRow(idx, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="Cant."
                            className="w-24 px-3 py-2 bg-transparent border border-editorial-line rounded-none focus:ring-1 focus:ring-editorial-ink focus:border-editorial-ink outline-none text-sm font-mono"
                          />
                          <button 
                            type="button"
                            onClick={() => handleRemoveIngredientRow(idx)}
                            className="p-2 text-editorial-muted hover:text-editorial-accent transition-colors border border-transparent hover:border-editorial-accent"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {recipeIngredients.length === 0 && (
                        <div className="text-xs text-editorial-muted uppercase tracking-wider border border-editorial-line border-dashed p-4 text-center">
                          No hay insumos agregados.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider font-bold text-editorial-ink mb-2">Instrucciones (Opcional)</label>
                  <textarea 
                    rows={3}
                    value={instructions}
                    onChange={e => setInstructions(e.target.value)}
                    placeholder="Pasos para preparar..."
                    className="w-full px-3 py-2.5 bg-transparent border border-editorial-line rounded-none focus:ring-1 focus:ring-editorial-ink focus:border-editorial-ink outline-none text-sm resize-none"
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-editorial-line flex gap-3 bg-editorial-bg">
              <button 
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-3 border border-editorial-line text-editorial-ink rounded-none text-xs font-bold uppercase tracking-wider hover:bg-editorial-line/10 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                form="recipe-form"
                disabled={recipeIngredients.length === 0}
                className="flex-1 px-4 py-3 bg-editorial-ink text-editorial-bg rounded-none text-xs font-bold uppercase tracking-wider hover:bg-editorial-line transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar Receta
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}
