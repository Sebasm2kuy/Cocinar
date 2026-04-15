import React from 'react';
import { Ingredient, Recipe } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis } from 'recharts';
import { TrendingDown, Clock, ChefHat, Target } from 'lucide-react';

interface Props {
  ingredients: Ingredient[];
  recipes: Recipe[];
  budget: number;
}

export default function Statistics({ ingredients, recipes, budget }: Props) {
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

  // Metrics
  const totalRecipes = recipes.length;
  
  const recipeCosts = recipes.map(r => {
    const cost = calculateRecipeCost(r);
    const costPerPortion = r.portions > 0 ? cost / r.portions : 0;
    return { ...r, cost, costPerPortion };
  });

  const avgCostPerPortion = recipeCosts.length > 0 
    ? recipeCosts.reduce((sum, r) => sum + r.costPerPortion, 0) / recipeCosts.length 
    : 0;

  const mostEfficientRecipe = recipeCosts.length > 0
    ? recipeCosts.reduce((min, r) => r.costPerPortion < min.costPerPortion ? r : min, recipeCosts[0])
    : null;

  const avgPrepTime = recipes.length > 0
    ? recipes.reduce((sum, r) => sum + r.prepTimeMinutes, 0) / recipes.length
    : 0;

  // Chart Data: Cost vs Time
  const scatterData = recipeCosts.map(r => ({
    name: r.name,
    x: r.prepTimeMinutes, // Time
    y: r.costPerPortion,  // Cost
    z: r.difficulty       // Bubble size based on difficulty
  }));

  // Chart Data: Top 5 most expensive ingredients
  const ingredientCosts = ingredients.map(ing => ({
    name: ing.name,
    price: getLowestPrice(ing.prices)
  })).filter(i => i.price > 0).sort((a, b) => b.price - a.price).slice(0, 5);

  return (
    <div className="space-y-10">
      {/* Metrics Shelf */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-2 border-editorial-ink">
        <div className="p-6 border-b lg:border-b-0 lg:border-r border-editorial-ink bg-editorial-ink text-editorial-bg">
          <h3 className="text-[10px] uppercase tracking-widest text-editorial-muted mb-2 flex items-center gap-2">
            <Target className="w-3 h-3" /> Presupuesto Actual
          </h3>
          <div className="font-mono text-4xl font-bold">${budget}</div>
          <p className="text-xs mt-2 opacity-80">Meta diaria en UYU</p>
        </div>
        
        <div className="p-6 border-b lg:border-b-0 lg:border-r border-editorial-ink bg-editorial-bg">
          <h3 className="text-[10px] uppercase tracking-widest text-editorial-muted mb-2 flex items-center gap-2">
            <TrendingDown className="w-3 h-3" /> Promedio por Porción
          </h3>
          <div className="font-mono text-4xl font-bold text-editorial-ink">${avgCostPerPortion.toFixed(0)}</div>
          <p className="text-xs mt-2 text-editorial-muted">
            {avgCostPerPortion <= budget ? 'Dentro del presupuesto' : 'Excede el presupuesto'}
          </p>
        </div>

        <div className="p-6 border-b md:border-b-0 md:border-r border-editorial-ink bg-editorial-bg">
          <h3 className="text-[10px] uppercase tracking-widest text-editorial-muted mb-2 flex items-center gap-2">
            <ChefHat className="w-3 h-3" /> Receta más rentable
          </h3>
          <div className="font-sans text-xl font-bold text-editorial-ink leading-tight truncate">
            {mostEfficientRecipe ? mostEfficientRecipe.name : 'N/A'}
          </div>
          <p className="text-xs mt-2 text-editorial-accent font-mono font-bold">
            {mostEfficientRecipe ? `$${mostEfficientRecipe.costPerPortion.toFixed(2)} / porción` : '-'}
          </p>
        </div>

        <div className="p-6 bg-editorial-bg">
          <h3 className="text-[10px] uppercase tracking-widest text-editorial-muted mb-2 flex items-center gap-2">
            <Clock className="w-3 h-3" /> Tiempo Promedio
          </h3>
          <div className="font-mono text-4xl font-bold text-editorial-ink">{avgPrepTime.toFixed(0)}<span className="text-xl">m</span></div>
          <p className="text-xs mt-2 text-editorial-muted">Por receta</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Chart 1: Cost vs Time */}
        <div className="border border-editorial-line p-6 bg-editorial-bg">
          <div className="mb-6">
            <h3 className="font-serif italic text-2xl text-editorial-ink">Costo vs. Tiempo</h3>
            <p className="text-xs uppercase tracking-wider text-editorial-muted mt-1">Análisis de eficiencia de recetas</p>
          </div>
          <div className="h-[300px] w-full">
            {scatterData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" opacity={0.2} />
                  <XAxis type="number" dataKey="x" name="Tiempo" unit="m" stroke="#1A1A1A" tick={{fontFamily: 'Courier New', fontSize: 12}} />
                  <YAxis type="number" dataKey="y" name="Costo" unit="$" stroke="#1A1A1A" tick={{fontFamily: 'Courier New', fontSize: 12}} />
                  <ZAxis type="number" dataKey="z" range={[50, 400]} name="Dificultad" />
                  <Tooltip 
                    cursor={{strokeDasharray: '3 3'}}
                    contentStyle={{ backgroundColor: '#1A1A1A', color: '#F8F5F1', border: 'none', borderRadius: 0, fontFamily: 'Courier New', fontSize: '12px' }}
                    itemStyle={{ color: '#F8F5F1' }}
                  />
                  <Scatter name="Recetas" data={scatterData} fill="#D9534F" />
                </ScatterChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed border-editorial-line text-editorial-muted text-sm">
                Agrega recetas para ver el gráfico
              </div>
            )}
          </div>
        </div>

        {/* Chart 2: Most Expensive Ingredients */}
        <div className="border border-editorial-line p-6 bg-editorial-bg">
          <div className="mb-6">
            <h3 className="font-serif italic text-2xl text-editorial-ink">Insumos más Caros</h3>
            <p className="text-xs uppercase tracking-wider text-editorial-muted mt-1">Top 5 por precio unitario</p>
          </div>
          <div className="h-[300px] w-full">
            {ingredientCosts.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ingredientCosts} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#2A2A2A" opacity={0.2} />
                  <XAxis type="number" stroke="#1A1A1A" tick={{fontFamily: 'Courier New', fontSize: 12}} />
                  <YAxis dataKey="name" type="category" stroke="#1A1A1A" tick={{fontFamily: 'Helvetica Neue', fontSize: 12}} width={100} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', color: '#F8F5F1', border: 'none', borderRadius: 0, fontFamily: 'Courier New', fontSize: '12px' }}
                    itemStyle={{ color: '#F8F5F1' }}
                    formatter={(value: number) => [`$${value}`, 'Precio']}
                  />
                  <Bar dataKey="price" fill="#1A1A1A" barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center border border-dashed border-editorial-line text-editorial-muted text-sm">
                Agrega insumos para ver el gráfico
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
