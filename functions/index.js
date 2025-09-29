const {onCall} = require('firebase-functions/v2/https');
const {setGlobalOptions} = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();

// Задаваме глобални настройки
setGlobalOptions({
  region: 'europe-west3',
  maxInstances: 10,
});

exports.createUser = onCall(async (request) => {
  console.log('📝 createUser function called');

  // Проверка за автентификация
  if (!request.auth) {
    throw new Error('Трябва да сте логнати');
  }

  try {
    const callerEmail = request.auth.token.email;
    
    if (!callerEmail) {
      throw new Error('Няма email в токена');
    }

    console.log(`👤 Caller: ${callerEmail}`);

    // Проверка за админ права
    const callerProfileRef = admin.firestore().doc(`users/${callerEmail}/profile/info`);
    const callerDoc = await callerProfileRef.get();
    
    if (!callerDoc.exists) {
      console.error(`❌ Profile not found for: ${callerEmail}`);
      throw new Error('Профилът не съществува');
    }
    
    const callerRole = callerDoc.data().role;
    
    console.log(`🔐 Caller role: ${callerRole}`);
    
    if (callerRole !== 'admin') {
      console.error(`❌ Permission denied for role: ${callerRole}`);
      throw new Error('Нямате админ права. Текуща роля: ' + callerRole);
    }

    const { email, password, displayName, role, courses } = request.data;

    // Валидации
    if (!email || !password) {
      throw new Error('Email и парола са задължителни');
    }

    if (password.length < 6) {
      throw new Error('Паролата трябва да е поне 6 символа');
    }

    // Нормализираме email
    const normalizedEmail = email.trim().toLowerCase();

    console.log(`📧 Creating user: ${normalizedEmail}`);
    console.log(`👔 Role: ${role}`);
    console.log(`📚 Courses: ${courses?.length || 0}`);

    // Създаване на потребител в Authentication
    const userRecord = await admin.auth().createUser({
      email: normalizedEmail,
      password: password,
      displayName: displayName || normalizedEmail.split('@')[0],
    });

    console.log(`✅ Auth user created: ${userRecord.uid}`);

    // Създаване на Firestore документи
    const userRef = admin.firestore().doc(`users/${normalizedEmail}`);
    
    // Parent document
    await userRef.set({
      email: normalizedEmail,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
      createdBy: callerEmail,
    });

    console.log(`✅ Parent document created`);

    // Profile info
    await userRef.collection('profile').doc('info').set({
      email: normalizedEmail,
      displayName: displayName || normalizedEmail.split('@')[0],
      role: role || 'student',
      joinDate: admin.firestore.FieldValue.serverTimestamp(),
      lastLogin: admin.firestore.FieldValue.serverTimestamp(),
      isActive: true,
    });

    console.log(`✅ Profile created with role: ${role}`);

    // Permissions
    await userRef.collection('permissions').doc('access').set({
      courses: courses || ['basic'],
      customPermissions: [],
    });

    console.log(`✅ Permissions set: ${courses?.join(', ')}`);

    return { 
      success: true, 
      uid: userRecord.uid,
      email: normalizedEmail,
      role: role,
      message: 'Потребителят е създаден успешно'
    };

  } catch (error) {
    console.error('❌ Error in createUser:', error);
    
    // По-добра обработка на грешки
    if (error.code === 'auth/email-already-exists') {
      throw new Error('Email адресът вече се използва');
    }
    
    throw new Error(error.message || 'Грешка при създаване на потребител');
  }
});