async function getFirebaseContext() {
    const config = window.FIREBASE_CONFIG;
    if (!config) return null;

    const [appSdk, authSdk, firestoreSdk] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js'),
        import('https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js')
    ]);
    const app = appSdk.getApps().find((candidate) => candidate.options.projectId === config.projectId)
        || appSdk.initializeApp(config);

    return {
        auth: authSdk.getAuth(app),
        authSdk,
        db: firestoreSdk.getFirestore(app),
        firestoreSdk
    };
}

function getCurrentFirebaseUser(auth, authSdk) {
    if (auth.currentUser) return Promise.resolve(auth.currentUser);

    return new Promise((resolve, reject) => {
        const unsubscribe = authSdk.onAuthStateChanged(auth, (user) => {
            unsubscribe();
            resolve(user);
        }, (error) => {
            unsubscribe();
            reject(error);
        });
    });
}

window.saveFirestoreProfile = async function (profile, user = null) {
    const context = await getFirebaseContext();
    if (!context) return false;

    const authUser = user || await getCurrentFirebaseUser(context.auth, context.authSdk);
    if (!authUser) return false;

    const allowedFields = [
        'name', 'role', 'location', 'email', 'about', 'skills', 'experience',
        'projects', 'achievements', 'education', 'github', 'linkedin', 'portfolio', 'cv', 'phone', 'provider'
    ];
    const profileData = Object.fromEntries(
        allowedFields.filter((field) => Object.hasOwn(profile, field)).map((field) => [field, profile[field]])
    );

    await context.firestoreSdk.setDoc(
        context.firestoreSdk.doc(context.db, 'users', authUser.uid),
        { ...profileData, uid: authUser.uid, updatedAt: context.firestoreSdk.serverTimestamp() },
        { merge: true }
    );
    return true;
};

window.loadFirestoreProfile = async function () {
    const context = await getFirebaseContext();
    if (!context) return null;

    const authUser = await getCurrentFirebaseUser(context.auth, context.authSdk);
    if (!authUser) return null;

    const snapshot = await context.firestoreSdk.getDoc(
        context.firestoreSdk.doc(context.db, 'users', authUser.uid)
    );
    return snapshot.exists() ? snapshot.data() : null;
};

window.signOutFirebaseUser = async function () {
    const context = await getFirebaseContext();
    if (!context) return;
    await context.authSdk.signOut(context.auth);
};