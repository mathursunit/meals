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
            <div className="login-container">
                <div className="login-bg"></div>
                <div className="login-card">
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
            <nav className="tab-bar">
                <div className="nav-group">
                    <div
                        className={`nav-item ${currentView === 'calendar' ? 'active' : ''}`}
                        onClick={() => setCurrentView('calendar')}
                    >
                        <Calendar size={22} strokeWidth={2} />
                        <span className="nav-label">Plan</span>
                    </div>
                    <div
                        className={`nav-item ${currentView === 'recipes' ? 'active' : ''}`}
                        onClick={() => setCurrentView('recipes')}
                    >
                        <Utensils size={22} strokeWidth={2} />
                        <span className="nav-label">Studio</span>
                    </div>
                    <div className="nav-item">
                        <Star size={22} strokeWidth={2} />
                        <span className="nav-label">Browse</span>
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-btn">
                    <LogOut size={20} strokeWidth={2} />
                </button>
            </nav>

            <main className="content-area">
                <header className="main-header">
                    <div className="user-info">
                        <p className="date-text">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        <h2 className="title-text">Hi, {user.displayName.split(' ')[0]}</h2>
                    </div>
                    <img src={user.photoURL} alt="Profile" className="avatar" title="Logout" onClick={handleLogout} />
                </header>

                {currentView === 'calendar' ? (
                    <>
                        <section className="week-picker no-scrollbar">
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
                                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '16px' }}>
                                    {selectedDate.toDateString() === new Date().toDateString() ? "Tonight's Service" : selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                                </h3>
                            </div>

                            <div className="meal-grid">
                                {selectedPlans.length > 0 ? (
                                    selectedPlans.map(plan => (
                                        <div key={plan.id} className={`meal-card glass ${plan.wasCooked ? 'cooked-mode' : ''}`} onClick={() => handleViewRecipe(plan)} style={{ cursor: 'pointer' }}>
                                            <div className="meal-image-placeholder">
                                                {plan.wasCooked ? <CheckCircle color="var(--accent-color)" size={24} /> : <Utensils color="var(--text-secondary)" size={24} />}
                                            </div>
                                            <div className="meal-details">
                                                <h4>{plan.title}</h4>
                                                <p>Tap to view recipe</p>
                                                <button
                                                    className={`cooked-toggle ${plan.wasCooked ? 'is-cooked' : ''}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleCooked(plan.id, plan.wasCooked);
                                                    }}
                                                >
                                                    {plan.wasCooked ? 'Cooked! ✨' : 'Done'}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="meal-card glass" style={{ opacity: 0.3, borderStyle: 'dashed', justifyContent: 'center' }} onClick={() => setIsModalOpen(true)}>
                                        <div className="meal-details" style={{ textAlign: 'center' }}>
                                            <Plus size={24} style={{ marginBottom: '8px' }} />
                                            <h4>Add to Menu</h4>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="action-grid">
                                <div className="action-card glass" onClick={() => setIsModalOpen(true)}>
                                    <Plus size={20} color="var(--accent-color)" />
                                    <p>Schedule</p>
                                </div>
                                <div className="action-card glass" onClick={() => setCurrentView('recipes')}>
                                    <Star size={20} color="#FFD700" />
                                    <p>Box</p>
                                </div>
                                <div className="action-card glass">
                                    <Utensils size={20} color="var(--text-secondary)" />
                                    <p>Grocery</p>
                                </div>
                                <div className="action-card glass">
                                    <ChevronRight size={20} color="var(--text-secondary)" />
                                    <p>History</p>
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
        </div>
    );
}
