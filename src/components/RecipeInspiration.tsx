import React, { useState } from 'react';
import { Search, Loader2, Download, Globe, Clock, Flame, BookOpen } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Ingredient, Recipe, Unit } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  ingredients: Ingredient[];
  onAddRecipe: (recipe: Recipe) => void;
  onAddIngredient: (ingredient: Ingredient) => void;
}

export default function RecipeInspiration({ ingredients, onAddRecipe, onAddIngredient }: Props) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsSearching(true);
    setError(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        Actúa como un buscador de recetas de blogs de cocina e Instagram. El usuario busca: "${query}".
        Devuelve 3 opciones de recetas económicas ideales para batch cooking y ahorro en Uruguay.
        Devuelve ÚNICAMENTE un array JSON válido con esta estructura exacta, sin markdown ni texto adicional:
        [
          {
            "name": "Nombre de la receta",
            "source": "Ej. @cocina_uruguaya en Instagram o Blog RecetasUy",
            "prepTimeMinutes": 45,
            "difficulty": 8,
            "portions": 4,
            "instructions": "Pasos de preparación...",
            "ingredients": [
              { "name": "Papa", "quantity": 1, "unit": "kg" }
            ]
          }
        ]
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      let jsonText = response.text || '[]';
      jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsedResults = JSON.parse(jsonText);
      setResults(parsedResults);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError('Hubo un error al buscar recetas. Intenta con otra búsqueda.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveRecipe = (aiRecipe: any) => {
    const recipeIngredients: { ingredientId: string; quantity: number }[] = [];

    aiRecipe.ingredients.forEach((aiIng: any) => {
      // Try to find existing ingredient
      const existing = ingredients.find(i => i.name.toLowerCase().includes(aiIng.name.toLowerCase()) || aiIng.name.toLowerCase().includes(i.name.toLowerCase()));
      
      if (existing) {
        recipeIngredients.push({ ingredientId: existing.id, quantity: aiIng.quantity });
      } else {
        // Create new ingredient
        const newIngId = uuidv4();
        const newIng: Ingredient = {
          id: newIngId,
          name: aiIng.name,
          category: 'Otro',
          unit: (aiIng.unit as Unit) || 'unidad',
          prices: [] // Starts with no prices
        };
        onAddIngredient(newIng);
        recipeIngredients.push({ ingredientId: newIngId, quantity: aiIng.quantity });
      }
    });

    const newRecipe: Recipe = {
      id: uuidv4(),
      name: `${aiRecipe.name} (de ${aiRecipe.source})`,
      portions: aiRecipe.portions || 1,
      prepTimeMinutes: aiRecipe.prepTimeMinutes || 30,
      difficulty: aiRecipe.difficulty || 5,
      instructions: aiRecipe.instructions || '',
      ingredients: recipeIngredients
    };

    onAddRecipe(newRecipe);
    
    // Remove from results to show it was saved
    setResults(prev => prev.filter(r => r.name !== aiRecipe.name));
  };

  return (
    <div className="space-y-6">
      <div className="bg-editorial-ink text-editorial-bg p-8">
        <h2 className="font-serif italic text-2xl mb-2 flex items-center gap-2">
          <Globe className="w-6 h-6" />
          Inspiración Web
        </h2>
        <p className="text-sm opacity-80 mb-6">Busca ideas en blogs e Instagram y guárdalas en tu recetario adaptadas a tus insumos.</p>
        
        <form onSubmit={handleSearch} className="flex gap-3">
          <input 
            type="text"
            placeholder="Ej. Guiso barato, Pollo al horno, Batch cooking verduras..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 px-4 py-3 bg-editorial-bg text-editorial-ink border-none rounded-none focus:outline-none font-sans text-sm"
          />
          <button 
            type="submit"
            disabled={isSearching || !query.trim()}
            className="bg-editorial-accent text-white px-6 py-3 rounded-none text-xs font-bold uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Buscar
          </button>
        </form>
      </div>

      {error && (
        <div className="p-4 border border-editorial-accent text-editorial-accent bg-editorial-accent/5 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {results.map((recipe, idx) => (
          <div key={idx} className="border border-editorial-line flex flex-col bg-editorial-bg">
            <div className="p-5 border-b border-editorial-line">
              <div className="text-[10px] uppercase tracking-wider text-editorial-accent font-bold mb-2">
                Fuente: {recipe.source}
              </div>
              <h3 className="font-bold text-editorial-ink text-lg leading-tight mb-3">{recipe.name}</h3>
              <div className="flex gap-3 text-[10px] uppercase tracking-wider text-editorial-muted">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {recipe.prepTimeMinutes} min</span>
                <span className="flex items-center gap-1"><Flame className="w-3 h-3"/> Dif: {recipe.difficulty}/20</span>
                <span>• {recipe.portions} porciones</span>
              </div>
            </div>
            
            <div className="p-5 flex-1 bg-editorial-ink/5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-editorial-ink mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> Insumos Sugeridos
              </h4>
              <ul className="space-y-1 mb-4">
                {recipe.ingredients.map((ing: any, i: number) => (
                  <li key={i} className="text-sm text-editorial-ink flex justify-between">
                    <span>{ing.name}</span>
                    <span className="font-mono text-editorial-muted">{ing.quantity} {ing.unit}</span>
                  </li>
                ))}
              </ul>
              <p className="text-xs text-editorial-muted line-clamp-3 italic">
                {recipe.instructions}
              </p>
            </div>

            <div className="p-4 border-t border-editorial-line">
              <button 
                onClick={() => handleSaveRecipe(recipe)}
                className="w-full py-3 border border-editorial-ink text-editorial-ink hover:bg-editorial-ink hover:text-editorial-bg transition-colors text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Guardar en Mis Recetas
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
