import React, { useState, useEffect } from 'react';
import { X, Search, Plus, Star } from 'lucide-react';
import { getFavoriteRecipes } from '../services/recipeService';

export default function MealModal({ isOpen, onClose, onAdd, onCreate, date }) {
    const [recipes, setRecipes] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            loadRecipes();
        }
    }, [isOpen]);

    const loadRecipes = async () => {
        setLoading(true);
        try {
            const data = await getFavoriteRecipes();
            setRecipes(data);
        } catch (err) {
            // If no recipes yet, we'll show empty state
            setRecipes([]);
        }
        setLoading(false);
    };

    if (!isOpen) return null;

    const filteredRecipes = recipes.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="modal-overlay">
            <div className="modal-content glass">
                <header className="modal-header">
                    <div>
                        <h3>Add to Menu</h3>
                        <p>{date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                    </div>
                    <button onClick={onClose} className="close-btn"><X /></button>
                </header>

                <div className="search-box glass">
                    <Search size={18} opacity={0.5} />
                    <input
                        type="text"
                        placeholder="Search your favorites..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="recipe-scroll">
                    {loading ? (
                        <p className="status-msg">Loading recipes...</p>
                    ) : filteredRecipes.length > 0 ? (
                        filteredRecipes.map(recipe => (
                            <div key={recipe.id} className="recipe-item glass" onClick={() => onAdd(recipe)}>
                                <div className="recipe-info">
                                    <h4>{recipe.title}</h4>
                                    <p>{recipe.time || '20'} mins</p>
                                </div>
                                <Plus size={20} color="var(--accent-color)" />
                            </div>
                        ))
                    ) : (
                        <div className="empty-state">
                            <p>No recipes found.</p>
                            <button
                                className="glow-btn"
                                style={{ marginTop: '15px' }}
                                onClick={onCreate}
                            >
                                + Create New Recipe
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.8);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-content {
          width: 100%;
          max-width: 500px;
          max-height: 80vh;
          display: flex;
          flex-direction: column;
          padding: 25px;
          border-radius: 24px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
        }
        .close-btn { background: none; border: none; color: white; cursor: pointer; }
        
        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          margin-bottom: 20px;
          border-radius: 12px;
        }
        .search-box input {
          background: none;
          border: none;
          color: white;
          outline: none;
          flex: 1;
        }

        .recipe-scroll {
          overflow-y: auto;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-right: 8px; /* Space for the sleek scrollbar */
        }
        .recipe-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        .recipe-item:hover { transform: scale(1.02); }
        .recipe-info h4 { margin-bottom: 2px; }
        .recipe-info p { font-size: 0.8rem; color: var(--text-secondary); }
        
        .empty-state {
          text-align: center;
          padding: 40px 0;
          color: var(--text-secondary);
        }
      `}</style>
        </div>
    );
}
