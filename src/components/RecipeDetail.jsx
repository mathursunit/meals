import React from 'react';
import { X, Clock, CheckCircle, List } from 'lucide-react';

export default function RecipeDetail({ recipe, onClose }) {
    if (!recipe) return null;

    return (
        <div className="detail-overlay">
            <div className="detail-content glass">
                <header className="detail-header">
                    <button onClick={onClose} className="back-btn"><X size={24} /></button>
                    <div className="title-section">
                        <h2>{recipe.title}</h2>
                        <div className="meta-row">
                            <span className="meta-tag"><Clock size={14} /> {recipe.time || 20} min</span>
                            <span className="meta-tag"><Star size={14} fill="var(--accent-color)" /> Favorite</span>
                        </div>
                    </div>
                </header>

                <div className="detail-body">
                    <section className="detail-section">
                        <h3 className="section-title"><List size={18} /> Ingredients</h3>
                        <ul className="ingredient-list">
                            {recipe.ingredients?.map((ing, i) => (
                                <li key={i} className="ingredient-row">
                                    <div className="checkbox-dummy"></div>
                                    <span>{ing}</span>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="detail-section" style={{ marginTop: '30px' }}>
                        <h3 className="section-title"><CheckCircle size={18} /> Instructions</h3>
                        <div className="instructions-text">
                            {recipe.instructions || "No instructions provided yet."}
                        </div>
                    </section>
                </div>
            </div>

            <style>{`
        .detail-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: var(--bg-color);
          z-index: 3000;
          display: flex;
          flex-direction: column;
        }
        .detail-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          padding: 30px;
          overflow-y: auto;
        }
        .detail-header {
          display: flex;
          gap: 20px;
          align-items: flex-start;
          margin-bottom: 40px;
        }
        .back-btn {
          background: var(--surface-color);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 12px;
          border-radius: 50%;
          cursor: pointer;
        }
        .title-section h2 { font-size: 2.2rem; margin-bottom: 8px; letter-spacing: -1px; }
        .meta-row { display: flex; gap: 15px; }
        .meta-tag { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; color: var(--text-secondary); background: rgba(255,255,255,0.05); padding: 5px 12px; border-radius: 20px; }

        .section-title { font-size: 1.3rem; display: flex; align-items: center; gap: 10px; margin-bottom: 20px; color: var(--accent-color); }
        .ingredient-list { list-style: none; display: flex; flex-direction: column; gap: 12px; }
        .ingredient-row { display: flex; align-items: center; gap: 15px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 12px; }
        .checkbox-dummy { width: 20px; height: 20px; border: 2px solid var(--glass-border); border-radius: 6px; }

        .instructions-text {
          line-height: 1.7;
          font-size: 1.1rem;
          color: rgba(255,255,255,0.9);
          white-space: pre-wrap;
          background: rgba(46, 204, 113, 0.03);
          padding: 20px;
          border-radius: 16px;
          border-left: 4px solid var(--accent-color);
        }

        @media (min-width: 768px) {
          .detail-content { max-width: 800px; margin: 0 auto; width: 100%; border-radius: 0; }
        }
      `}</style>
        </div>
    );
}

// Internal Star icon for the detail view
function Star({ size, fill }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
    );
}
