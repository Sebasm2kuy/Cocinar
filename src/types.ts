export type Store = 'Feria' | 'Tata' | 'Tienda Inglesa' | 'Disco' | 'Devoto' | 'Macro Mercado' | 'Otro';

export type Unit = 'kg' | 'litro' | 'unidad' | '100g';

export interface PriceEntry {
  id: string;
  store: Store;
  price: number;
  date: string; // ISO string
  notes?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  unit: Unit;
  prices: PriceEntry[];
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: { ingredientId: string; quantity: number }[];
  portions: number;
  prepTimeMinutes: number;
  difficulty: number; // 0 to 20
  instructions: string;
}
