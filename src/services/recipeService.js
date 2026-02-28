import { db } from '../firebase';
import {
    collection,
    getDocs,
    query,
    where,
    orderBy,
    addDoc,
    Timestamp,
    doc,
    getDoc
} from 'firebase/firestore';

const RECIPES_COLLECTION = 'recipes';

export const getRecipe = async (id) => {
    const docRef = doc(db, RECIPES_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
};

export const getFavoriteRecipes = async () => {
    const q = query(
        collection(db, RECIPES_COLLECTION)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs
        .map(doc => ({
            id: doc.id,
            ...doc.data()
        }))
        // Filter and Sort in-memory to avoid needing Firestore Composite Indexes
        .filter(r => r.isFavorite)
        .sort((a, b) => a.title.localeCompare(b.title));
};

export const addRecipe = async (recipeData) => {
    return await addDoc(collection(db, RECIPES_COLLECTION), {
        ...recipeData,
        createdAt: Timestamp.now()
    });
};
