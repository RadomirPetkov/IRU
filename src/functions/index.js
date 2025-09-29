const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true }); // 🆕 Добавяме CORS

admin.initializeApp();

// 🆕 ВАРИАНТ 1: Callable Function (препоръчително - автоматично обработва CORS)
exports.createUser = functions.region('europe-west3').https.onCall(async (data, context) => {
  // Проверка за права
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Трябва да сте логнати');
  }

  try {
    // Вземаме email от токена
    const callerEmail = context.auth.token.email;
    
    if (!callerEmail) {
      throw new functions.https.HttpsError('unauthenticated', 'Няма email в токена');
    }

    // Проверка дали е админ
    const callerProfileRef = admin.firestore().doc(`users/${callerEmail}/profile/info`);
    const callerDoc = await callerProfileRef.get();
    
    if (!callerDoc.exists) {
      throw new functions.https.HttpsError('permission-denied', 'Профилът не съществува');
    }
    
    const callerRole = callerDoc.data().role;
    
    if (callerRole !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Нямате админ права');
    }

    const { email, password, displayName, role, courses } = data;

    // Валидации
    if (!email || !password) {
      throw new functions.https.HttpsError('invalid-argument', 'Email и парола са задължителни');
    }

    if (password.length < 6) {
      throw new functions.https.HttpsError('invalid-argument', 'Паролата трябва да е поне 6 символа');
    }

    // Нормализираме email
    const normalizedEmail = email.trim().toLowerCase();

    console.log(`📝 Създаване на потребител: ${normalizedEmail} от админ: ${callerEmail}`);

    // Създаване на потребител в Authentication
    const userRecord = await admin.auth().createUser({
      email: normalizedEmail,
      password: password,
      displayName: displayName || normalizedEmail.split('@')[0],
    });

    console.log(`✅ Потребител създаден в Auth: ${userRecord.uid}`);

    // Създаване на профил във Firestore
    const userRef = admin.firestore().doc(`users/${normalizedEmail}`);
    
    // Parent document
    await userRef.set({
      email: normalizedEmail,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      createdBy: callerEmail,
    });

    // Profile info
    await userRef.collection('profile').doc('info').set({
      email: normalizedEmail,
      displayName: displayName || normalizedEmail.split('@')[0],
      role: role || 'student',
      joinDate: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
    });

    // Permissions
    await userRef.collection('permissions').doc('access').set({
      courses: courses || ['basic'],
      customPermissions: [],
    });

    console.log(`✅ Firestore профил създаден за: ${normalizedEmail}`);

    return { 
      success: true, 
      uid: userRecord.uid,
      email: normalizedEmail,
      message: 'Потребителят е създаден успешно'
    };

  } catch (error) {
    console.error('❌ Error creating user:', error);
    
    // По-добра обработка на грешки
    if (error.code === 'auth/email-already-exists') {
      throw new functions.https.HttpsError('already-exists', 'Email адресът вече се използва');
    }
    
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    throw new functions.https.HttpsError('internal', error.message || 'Грешка при създаване на потребител');
  }
});

// 🆕 ВАРИАНТ 2: HTTP Function с CORS (ако callable не работи)
exports.createUserHTTP = functions.region('europe-west3').https.onRequest((req, res) => {
  cors(req, res, async () => {
    // Проверка за POST метод
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      // Вземаме Authorization header
      const authorization = req.headers.authorization;
      if (!authorization || !authorization.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const token = authorization.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      const callerEmail = decodedToken.email;

      // Проверка за админ права (копираме логиката от callable)
      const callerProfileRef = admin.firestore().doc(`users/${callerEmail}/profile/info`);
      const callerDoc = await callerProfileRef.get();
      
      if (!callerDoc.exists || callerDoc.data().role !== 'admin') {
        return res.status(403).json({ error: 'Permission denied' });
      }

      const { email, password, displayName, role, courses } = req.body;

      // Създаване на потребител (същата логика като callable)
      const normalizedEmail = email.trim().toLowerCase();
      
      const userRecord = await admin.auth().createUser({
        email: normalizedEmail,
        password: password,
        displayName: displayName || normalizedEmail.split('@')[0],
      });

      const userRef = admin.firestore().doc(`users/${normalizedEmail}`);
      
      await userRef.set({
        email: normalizedEmail,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
        createdBy: callerEmail,
      });

      await userRef.collection('profile').doc('info').set({
        email: normalizedEmail,
        displayName: displayName || normalizedEmail.split('@')[0],
        role: role || 'student',
        joinDate: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        isActive: true,
      });

      await userRef.collection('permissions').doc('access').set({
        courses: courses || ['basic'],
        customPermissions: [],
      });

      return res.status(200).json({ 
        success: true, 
        uid: userRecord.uid,
        email: normalizedEmail,
        message: 'Потребителят е създаден успешно'
      });

    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || 'Internal error'
      });
    }
  });
});