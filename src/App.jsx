import React, { useState, useEffect } from 'react';
import { auth, loginWithGoogle, ALLOWED_USERS } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Calendar, Utensils, Star, LogOut, ChevronRight, CheckCircle, Plus } from 'lucide-react';
import MealModal from './components/MealModal';
import RecipeStudio from './views/RecipeStudio';
import RecipeDetail from './components/RecipeDetail';
import { getWeeklyPlan, addMealToPlan, updateMealStatus } from './services/calendarService';
import { getRecipe } from './services/recipeService';

export default function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentView, setCurrentView] = useState('calendar'); // 'calendar' or 'recipes'
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [plans, setPlans] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser && ALLOWED_USERS.includes(currentUser.email)) {
                setUser(currentUser);
            } else {
                setUser(null);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (user) {
            loadPlans();
        }
    }, [user, currentView]); // Reload when switching views to sync state

    const loadPlans = async () => {
        try {
            const data = await getWeeklyPlan(new Date());
            setPlans(data);
        } catch (err) {
            console.error("Error loading plans:", err);
        }
    };

    const handleLogin = async () => {
        try {
            setError(null);
            await loginWithGoogle();
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLogout = () => signOut(auth);

    const getWeekDays = () => {
        const days = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const day = new Date(today);
            day.setDate(today.getDate() + i);
            days.push(day);
        }
        return days;
    };

    const toggleCooked = async (planId, currentStatus) => {
        try {
            setPlans(prev => prev.map(p =>
                p.id === planId ? { ...p, wasCooked: !currentStatus } : p
            ));
            await updateMealStatus(planId, !currentStatus);
        } catch (err) {
            console.error("Update failed:", err);
            loadPlans();
        }
    };

    const handleAddMeal = async (recipe) => {
        try {
            const mealData = {
                title: recipe.title,
                recipeId: recipe.id,
                date: selectedDate,
                mealType: 'Dinner',
            };
            const newDoc = await addMealToPlan(mealData);
            setPlans(prev => [...prev, { ...mealData, id: newDoc.id, wasCooked: false }]);
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to add meal:", err);
        }
    };

    const handleViewRecipe = async (meal) => {
        if (!meal.recipeId) return;
        try {
            const recipeData = await getRecipe(meal.recipeId);
            setSelectedRecipe(recipeData);
        } catch (err) {
            console.error("Failed to load recipe detail:", err);
        }
    };

    const weekDays = getWeekDays();
    const selectedPlans = plans.filter(p =>
        new Date(p.date).toDateString() === selectedDate.toDateString()
    );

    if (loading) {
        return (
            <div className="center-flex" style={{ background: 'var(--bg-color)', color: 'white', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Preparing the Kitchen...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="login-container glass-bg">
                <div className="glass login-card">
                    <h1 className="hero-text">Sara & Sunit</h1>
                    <p className="subtitle">Our Shared Kitchen & Menu Planner</p>
                    {error && <p className="error-msg">{error}</p>}
                    <button onClick={handleLogin} className="glow-btn">Login with Google</button>
                </div>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <nav className="tab-bar glass">
                <div
                    className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`}
                    onClick={() => setCurrentView('calendar')}
                >
                    <Calendar size={24} color={currentView === 'calendar' ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                    <span className="nav-label">Calendar</span>
                </div>
                <div
                    className={`nav-item ${currentView === 'recipes' ? 'active' : ''}`}
                    onClick={() => setCurrentView('recipes')}
                >
                    <Utensils size={24} color={currentView === 'recipes' ? 'var(--accent-color)' : 'var(--text-secondary)'} />
                    <span className="nav-label">Recipes</span>
                </div>
                <div className="nav-item">
                    <Star size={24} color="var(--text-secondary)" />
                    <span className="nav-label">Favorites</span>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={24} />
                </button>
            </nav>

            <main className="content-area">
                <header className="main-header">
                    <div className="user-info">
                        <h2 className="title-text">Hi, {user.displayName.split(' ')[0]}</h2>
                        <p className="date-text">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
                    </div>
                    <img src={user.photoURL} alt="Profile" className="avatar" />
                </header>

                {currentView === 'calendar' ? (
                    <>
                        <section className="week-picker">
                            {weekDays.map((date, i) => {
                                const isSelected = date.toDateString() === selectedDate.toDateString();
                                return (
                                    <div
                                        key={i}
                                        className={`day-card glass ${isSelected ? 'selected' : ''}`}
                                        onClick={() => setSelectedDate(date)}
                                    >
                                        <span className="day-name">{date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                                        <span className="day-number">{date.getDate()}</span>
                                    </div>
                                );
                            })}
                        </section>

                        <section className="day-view">
                            <div className="section-header">
                                <h3>{selectedDate.toDateString() === new Date().toDateString() ? "Today's Menu" : selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}</h3>
                            </div>

                            {selectedPlans.length > 0 ? (
                                selectedPlans.map(plan => (
                                    <div key={plan.id} className={`meal-card glass ${plan.wasCooked ? 'cooked-mode' : ''}`} onClick={() => handleViewRecipe(plan)} style={{ cursor: 'pointer' }}>
                                        <div className="meal-image-placeholder">
                                            {plan.wasCooked ? <CheckCircle color="var(--accent-color)" size={32} /> : <Utensils color="var(--text-secondary)" size={32} />}
                                        </div>
                                        <div className="meal-details">
                                            <h4>{plan.title}</h4>
                                            <p>Tap to view recipe</p>
                                            <div className="meal-actions">
                                                <button
                                                    className={`cooked-toggle ${plan.wasCooked ? 'is-cooked' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleCooked(plan.id, plan.wasCooked);
                                                    }}
                                                >
                                                    {plan.wasCooked ? 'Cooked! ✨' : 'Mark as Cooked'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="meal-card glass" style={{ opacity: 0.6, borderStyle: 'dashed' }}>
                                    <div className="meal-image-placeholder">
                                        <Plus color="var(--text-secondary)" size={32} />
                                    </div>
                                    <div className="meal-details">
                                        <h4>No meal planned</h4>
                                        <p>Tap "Add Meal" below to schedule</p>
                                    </div>
                                </div>
                            )}

                            <div className="action-grid">
                                <div className="action-card glass" onClick={() => setCurrentView('recipes')}>
                                    <Star size={24} color="#FFD700" />
                                    <p>Browse Box</p>
                                </div>
                                <div className="action-card glass" onClick={() => setIsModalOpen(true)}>
                                    <Plus size={24} color="var(--accent-color)" />
                                    <p>Add Meal</p>
                                </div>
                            </div>
                        </section>
                    </>
                ) : (
                    <RecipeStudio onViewRecipe={(recipe) => setSelectedRecipe(recipe)} />
                )}
            </main>

            {selectedRecipe && (
                <RecipeDetail
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(null)}
                />
            )}

            <MealModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddMeal}
                onCreate={() => {
                    setIsModalOpen(false);
                    setCurrentView('recipes');
                }}
                date={selectedDate}
            />

            <style>{`
                .app-layout { color: white; display: flex; flex-direction: column; height: 100vh; }
                .content-area { flex: 1; padding: 25px; overflow-y: auto; padding-bottom: 100px; }
                .main-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
                .avatar { width: 45px; height: 45px; border-radius: 50%; border: 2px solid var(--accent-color); }
                .title-text { font-size: 1.8rem; font-weight: 600; }
                .date-text { color: var(--text-secondary); font-size: 0.9rem; }

                .week-picker { display: flex; gap: 15px; margin-bottom: 35px; overflow-x: auto; padding-bottom: 10px; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; }
                .day-card { min-width: 65px; padding: 15px 10px; display: flex; flex-direction: column; align-items: center; gap: 8px; cursor: pointer; transition: all 0.3s ease; scroll-snap-align: start; }
                .day-card.selected { background: var(--accent-color); color: #121212; border-color: var(--accent-color); }
                .day-name { font-size: 0.75rem; text-transform: uppercase; opacity: 0.8; }
                .day-number { font-size: 1.2rem; font-weight: 600; }

                .meal-card { display: flex; gap: 15px; padding: 15px; margin-top: 15px; align-items: center; transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .meal-card.cooked-mode { border-color: var(--accent-color); background: rgba(46, 204, 113, 0.05); }
                .meal-image-placeholder { width: 80px; height: 80px; border-radius: 12px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; }
                .meal-details h4 { font-size: 1.1rem; margin-bottom: 4px; }
                .meal-details p { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px; }
                
                .cooked-toggle { background: transparent; border: 1px solid var(--accent-color); color: var(--accent-color); padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
                .cooked-toggle.is-cooked { background: var(--accent-color); color: #121212; border-color: var(--accent-color); box-shadow: 0 0 15px rgba(46, 204, 113, 0.4); }

                .action-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 30px; }
                .action-card { padding: 25px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; cursor: pointer; }

                .tab-bar { position: fixed; bottom: 0; left: 0; right: 0; height: 75px; display: flex; justify-content: space-around; align-items: center; z-index: 1000; border-radius: 20px 20px 0 0; }
                .nav-item { display: flex; flex-direction: column; align-items: center; gap: 4px; opacity: 0.5; cursor: pointer; }
                .nav-item.active { opacity: 1; color: var(--accent-color); }
                .nav-label { font-size: 0.7rem; }
                .logout-btn { background: none; border: none; color: var(--text-secondary); cursor: pointer; padding: 10px; }

                @media (min-width: 768px) {
                    .app-layout { flex-direction: row; }
                    .tab-bar { position: static; width: 100px; height: 100vh; flex-direction: column; border-radius: 0; padding-top: 40px; justify-content: flex-start; gap: 30px; }
                    .content-area { padding: 60px; max-width: 1000px; margin: 0 auto; }
                    .logout-btn { margin-top: auto; margin-bottom: 30px; }
                }

                .glass-bg { background: radial-gradient(circle at top left, #1a1a1a, #0a0a0a); height: 100vh; display: flex; align-items: center; justify-content: center; }
                .login-card { padding: 50px; text-align: center; max-width: 400px; width: 90%; }
                .hero-text { font-size: 2.8rem; margin-bottom: 10px; letter-spacing: -1px; }
                .subtitle { color: var(--text-secondary); margin-bottom: 40px; }
            `}</style>
        </div>
    );
}
