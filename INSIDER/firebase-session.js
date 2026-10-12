window.signOutFirebaseUser = async function () {
    const config = window.FIREBASE_CONFIG;
    if (!config) return;

    const [appSdk, authSdk] = await Promise.all([
        import('https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js')
    ]);
    const app = appSdk.getApps().find((candidate) => candidate.options.projectId === config.projectId)
        || appSdk.initializeApp(config);

    await authSdk.signOut(authSdk.getAuth(app));
};