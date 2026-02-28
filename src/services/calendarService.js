import { db } from '../firebase';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    updateDoc,
    doc,
    orderBy,
    limit,
    Timestamp
} from 'firebase/firestore';

const CALENDAR_COLLECTION = 'calendar';

export const getWeeklyPlan = async (startDate) => {
    const q = query(collection(db, CALENDAR_COLLECTION));

    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate()
    }));

    // Filter and Sort in-memory to avoid 'Index Required' errors
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 7);

    return data
        .filter(item => item.date >= startDate && item.date <= endDate)
        .sort((a, b) => a.date - b.date);
};

export const updateMealStatus = async (mealId, cooked) => {
    const mealRef = doc(db, CALENDAR_COLLECTION, mealId);
    await updateDoc(mealRef, {
        wasCooked: cooked,
        updatedAt: Timestamp.now()
    });
};

export const addMealToPlan = async (mealData) => {
    return await addDoc(collection(db, CALENDAR_COLLECTION), {
        ...mealData,
        wasCooked: false,
        date: Timestamp.fromDate(new Date(mealData.date)),
        createdAt: Timestamp.now()
    });
};
