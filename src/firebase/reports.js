import { db } from './firestore';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';

function toLocalDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function getUserSessionsInRange(userEmail, startDate, endDate) {
  const email = userEmail.trim().toLowerCase();
  const endOfDay = new Date(endDate);
  endOfDay.setHours(23, 59, 59, 999);

  const sessionsRef = collection(db, 'users', email, 'activity');
  const q = query(
    sessionsRef,
    where('loginAt', '>=', Timestamp.fromDate(startDate)),
    where('loginAt', '<=', Timestamp.fromDate(endOfDay)),
    orderBy('loginAt', 'asc')
  );

  const snap = await getDocs(q);
  return snap.docs
    .map(doc => ({ id: doc.id, loginAt: doc.data().loginAt?.toDate() || null }))
    .filter(s => s.loginAt);
}

export async function getReportData(userEmails, startDate, endDate) {
  const results = await Promise.all(
    userEmails.map(async (email) => {
      const sessions = await getUserSessionsInRange(email, startDate, endDate);
      const byDay = {};
      sessions.forEach(s => {
        const key = toLocalDateKey(s.loginAt);
        if (!byDay[key]) byDay[key] = s.loginAt;
      });
      return { email, loginsByDay: byDay };
    })
  );
  return results;
}
