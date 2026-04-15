import React, { useState, useEffect } from 'react';
import { LayoutDashboard, ChefHat, LineChart, Wallet, Menu, X, Sparkles } from 'lucide-react';
import IngredientManager from './components/IngredientManager';
import AIAssistant from './components/AIAssistant';
import RecipeManager from './components/RecipeManager';
import Statistics from './components/Statistics';
import { Ingredient, PriceEntry, Recipe } from './types';
import { cn } from './lib/utils';

// Initial mock data for demonstration
const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: '1',
    name: 'Pechuga de Pollo',
    category: 'Carnes',
    unit: 'kg',
    prices: [
      { id: 'p1', store: 'Feria', price: 280, date: new Date().toISOString() },
      { id: 'p2', store: 'Tienda Inglesa', price: 350, date: new Date().toISOString() }
    ]
  },
  {
    id: '2',
    name: 'Papa',
    category: 'Verduras',
    unit: 'kg',
    prices: [
      { id: 'p3', store: 'Feria', price: 45, date: new Date().toISOString() },
      { id: 'p4', store: 'Tata', price: 65, date: new Date().toISOString() }
    ]
  },
  {
    id: '3',
    name: 'Arroz Blanco',
    category: 'Secos',
    unit: 'kg',
    prices: [
      { id: 'p5', store: 'Macro Mercado', price: 42, date: new Date().toISOString() }
    ]
  }
];

type Tab = 'insumos' | 'recetas' | 'estadisticas';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('insumos');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // State for ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem('smartprep_ingredients');
    return saved ? JSON.parse(saved) : INITIAL_INGREDIENTS;
  });

  // State for recipes
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('smartprep_recipes');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to local storage whenever ingredients change
  useEffect(() => {
    localStorage.setItem('smartprep_ingredients', JSON.stringify(ingredients));
  }, [ingredients]);

  // Save to local storage whenever recipes change
  useEffect(() => {
    localStorage.setItem('smartprep_recipes', JSON.stringify(recipes));
  }, [recipes]);

  const handleAddIngredient = (newIng: Ingredient) => {
    setIngredients(prev => [...prev, newIng]);
  };

  const handleAddPrice = (ingredientId: string, priceEntry: PriceEntry) => {
    setIngredients(prev => prev.map(ing => {
      if (ing.id === ingredientId) {
        return { ...ing, prices: [...ing.prices, priceEntry] };
      }
      return ing;
    }));
  };

  const handleBulkAdd = (extractedItems: any[]) => {
    setIngredients(prev => {
      let updated = [...prev];
      
      extractedItems.forEach(item => {
        // Find existing ingredient by name (case insensitive)
        const existingIndex = updated.findIndex(i => i.name.toLowerCase() === item.name.toLowerCase());
        
        const newPrice: PriceEntry = {
          id: crypto.randomUUID(),
          store: item.store,
          price: item.price,
          date: new Date().toISOString(),
          notes: 'Escaneado de ticket'
        };

        if (existingIndex >= 0) {
          // Add price to existing ingredient
          updated[existingIndex] = {
            ...updated[existingIndex],
            prices: [...updated[existingIndex].prices, newPrice]
          };
        } else {
          // Create new ingredient
          updated.push({
            id: crypto.randomUUID(),
            name: item.name,
            category: item.category,
            unit: item.unit,
            prices: [newPrice]
          });
        }
      });
      
      return updated;
    });
  };

  const handleAddRecipe = (newRecipe: Recipe) => {
    setRecipes(prev => [...prev, newRecipe]);
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  };

  const NavItem = ({ id, icon: Icon, label, disabled = false }: { id: Tab, icon: any, label: string, disabled?: boolean }) => (
    <button
      onClick={() => !disabled && setActiveTab(id)}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 py-3 text-xs uppercase font-bold tracking-wider transition-all border-b-2",
        activeTab === id 
          ? "border-editorial-ink text-editorial-ink" 
          : "border-transparent text-editorial-muted hover:border-editorial-line hover:text-editorial-ink",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
      {disabled && <span className="ml-auto text-[9px] bg-editorial-line text-editorial-bg px-1.5 py-0.5">PRONTO</span>}
    </button>
  );

  return (
    <div className="min-h-screen bg-editorial-bg flex font-sans text-editorial-ink">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-editorial-ink/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-80 bg-editorial-bg border-r-2 border-editorial-line transform transition-transform duration-300 ease-in-out lg:transform-none flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-8 flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <span className="text-[11px] uppercase tracking-[2px] font-bold border-b border-editorial-ink pb-1">Montevideo, UY • Abril 2026</span>
            <button className="lg:hidden text-editorial-ink" onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>
          <h1 className="font-serif text-5xl font-black tracking-tighter uppercase leading-[0.9]">Comida<br/>Casera<br/>Index.</h1>
          <p className="text-sm mt-5 leading-relaxed text-editorial-ink">
            Recopilación de precios de insumos básicos para optimización de presupuesto familiar.
          </p>
        </div>

        <nav className="flex-1 px-8 space-y-2 mt-4">
          <NavItem id="insumos" icon={LayoutDashboard} label="Insumos y Precios" />
          <NavItem id="recetas" icon={ChefHat} label="Recetas" />
          <NavItem id="estadisticas" icon={LineChart} label="Estadísticas" />
        </nav>

        <div className="p-0 mt-auto">
          <div className="bg-editorial-ink text-editorial-bg p-8">
            <h2 className="text-[10px] uppercase tracking-[1px] opacity-70 mb-4">Gasto Diario Actual</h2>
            <div className="font-serif text-[42px] italic mb-1 leading-none">$400<span className="text-base not-italic ml-1">UYU</span></div>
            <div className="text-editorial-accent font-bold text-sm mt-2">Meta: $200 / día (-50%)</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-editorial-bg border-b-2 border-editorial-line px-6 py-4 flex items-center gap-4 lg:hidden">
          <button onClick={() => setIsMobileMenuOpen(true)} className="text-editorial-ink hover:text-editorial-accent">
            <Menu className="w-6 h-6" />
          </button>
          <h2 className="font-serif italic font-bold text-lg text-editorial-ink">Index.</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-4 lg:p-10">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-end border-b border-editorial-ink pb-3">
              <h2 className="font-serif text-2xl italic text-editorial-ink">
                {activeTab === 'insumos' && 'Monitor de Insumos'}
                {activeTab === 'recetas' && 'Recetario y Costos'}
                {activeTab === 'estadisticas' && 'Análisis de Rendimiento'}
              </h2>
              <span className="text-[11px] font-bold uppercase tracking-wider text-editorial-muted hidden sm:inline-block">
                Última actualización: Hoy
              </span>
            </div>

            {activeTab === 'insumos' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2">
                  <IngredientManager 
                    ingredients={ingredients}
                    onAddIngredient={handleAddIngredient}
                    onAddPrice={handleAddPrice}
                    onBulkAdd={handleBulkAdd}
                  />
                </div>
                <div className="xl:col-span-1">
                  <div className="sticky top-10">
                    <AIAssistant />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'recetas' && (
              <RecipeManager 
                recipes={recipes}
                ingredients={ingredients}
                onAddRecipe={handleAddRecipe}
                onDeleteRecipe={handleDeleteRecipe}
                onAddIngredient={handleAddIngredient}
              />
            )}

            {activeTab === 'estadisticas' && (
              <Statistics 
                ingredients={ingredients}
                recipes={recipes}
                budget={200}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
