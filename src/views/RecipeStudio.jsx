import React, { useState, useEffect } from 'react';
import { Plus, Search, Sparkles, Save, X, Star } from 'lucide-react';
import { addRecipe, getFavoriteRecipes } from '../services/recipeService';

export default function RecipeStudio({ onViewRecipe }) {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [smartText, setSmartText] = useState('');
    const [ingredients, setIngredients] = useState([]);
    const [instructions, setInstructions] = useState('');
    const [saving, setSaving] = useState(false);
    const [recipes, setRecipes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRecipes();
    }, []);

    const loadRecipes = async () => {
        setLoading(true);
        try {
            const data = await getFavoriteRecipes();
            setRecipes(data);
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleSmartPaste = () => {
        const lines = smartText.split('\n').filter(line => line.trim() !== '');
        const parsed = lines.map(line => ({
            raw: line,
            item: line.replace(/^[0-9./\s]+(cup|tsp|tbsp|oz|lb|g|kg|ml|l)?\s+/i, '').trim()
        }));
        setIngredients(parsed);
    };

    const handleSave = async () => {
        if (!title) return alert("Please enter a title");
        setSaving(true);
        try {
            await addRecipe({
                title,
                ingredients: ingredients.map(i => i.raw),
                instructions,
                isFavorite: true,
                time: 30
            });
            setIsAdding(false);
            setTitle('');
            setSmartText('');
            setIngredients([]);
            setInstructions('');
            loadRecipes();
        } catch (err) {
            console.error(err);
        }
        setSaving(false);
    };

    return (
        <div className="recipe-studio">
            <header className="section-header">
                <h2>Your Recipe Box</h2>
                <button className="glow-btn" onClick={() => setIsAdding(true)}><Plus size={18} /> Add New</button>
            </header>

            {isAdding ? (
                <div className="add-overlay glass">
                    <header className="modal-header">
                        <h3>New Favorite</h3>
                        <button className="close-btn" onClick={() => setIsAdding(false)}><X /></button>
                    </header>

                    <input
                        type="text"
                        placeholder="Meal Name (e.g., Mom's Curry)"
                        className="title-input glass"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <div className="smart-paste-area glass">
                        <div className="paste-header">
                            <Sparkles size={16} color="var(--accent-color)" />
                            <span>Smart Paste Ingredients</span>
                        </div>
                        <textarea
                            placeholder="Paste ingredient list here..."
                            value={smartText}
                            onChange={(e) => setSmartText(e.target.value)}
                            onBlur={handleSmartPaste}
                        />
                    </div>

                    {ingredients.length > 0 && (
                        <div className="parsed-preview">
                            <p>Detected Ingredients:</p>
                            <ul>
                                {ingredients.map((ing, i) => <li key={i}>{ing.raw}</li>)}
                            </ul>
                        </div>
                    )}

                    <div className="instructions-area glass" style={{ marginTop: '20px' }}>
                        <div className="paste-header">
                            <span>Cooking Instructions</span>
                        </div>
                        <textarea
                            placeholder="Step 1: Fry bacon... Step 2: Whisk eggs..."
                            className="instructions-textarea"
                            value={instructions}
                            onChange={(e) => setInstructions(e.target.value)}
                        />
                    </div>

                    <button className="glow-btn save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : 'Save to Favorites'}
                    </button>
                </div>
            ) : (
                <div className="recipe-grid">
                    {loading ? (
                        <p style={{ textAlign: 'center', marginTop: '40px' }}>Loading your favorites...</p>
                    ) : recipes.length > 0 ? (
                        recipes.map(recipe => (
                            <div
                                key={recipe.id}
                                className="recipe-card glass"
                                onClick={() => onViewRecipe?.(recipe)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="recipe-badge"><Star size={12} fill="var(--accent-color)" color="var(--accent-color)" /></div>
                                <h4>{recipe.title}</h4>
                                <p>{recipe.ingredients?.length || 0} ingredients</p>
                            </div>
                        ))
                    ) : (
                        <div className="empty-box">
                            <p>Your recipe box is empty.</p>
                            <button className="outline-btn" style={{ marginTop: '10px' }} onClick={() => setIsAdding(true)}>Add your first meal</button>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .recipe-studio { padding-top: 10px; }
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
                
                .recipe-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .recipe-card { padding: 20px; position: relative; display: flex; flex-direction: column; gap: 8px; }
                .recipe-badge { position: absolute; top: 10px; right: 10px; }
                .recipe-card h4 { font-size: 1rem; }
                .recipe-card p { font-size: 0.8rem; color: var(--text-secondary); }

                .empty-box { grid-column: 1 / -1; text-align: center; padding: 60px 0; opacity: 0.6; }
                .outline-btn { background: none; border: 1px solid var(--accent-color); color: var(--accent-color); padding: 8px 16px; border-radius: 12px; cursor: pointer; }

                .add-overlay { margin-bottom: 30px; padding: 25px; border-radius: 24px; position: relative; }
                .title-input { width: 100%; padding: 15px; border-radius: 12px; font-size: 1.2rem; margin-bottom: 20px; border: none; outline: none; color: white; }
                
                .smart-paste-area { padding: 15px; border-radius: 12px; display: flex; flex-direction: column; gap: 10px; }
                .paste-header { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-secondary); }
                .smart-paste-area textarea { background: none; border: none; color: white; width: 100%; min-height: 100px; resize: vertical; outline: none; }

                .parsed-preview { margin-top: 15px; font-size: 0.9rem; }
                .parsed-preview p { color: var(--text-secondary); margin-bottom: 8px; }
                .parsed-preview ul { list-style: none; display: flex; flex-wrap: wrap; gap: 8px; }
                .parsed-preview li { background: rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 15px; font-size: 0.8rem; }

                .instructions-area { padding: 15px; border-radius: 12px; display: flex; flex-direction: column; gap: 10px; }
                .instructions-textarea { background: none; border: none; color: white; width: 100%; min-height: 120px; resize: vertical; outline: none; font-family: inherit; }

                .save-btn { width: 100%; margin-top: 25px; }
            `}</style>
        </div>
    );
}
