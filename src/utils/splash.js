export const hideSplashScreen = () => {
    const splash = document.getElementById('splash-screen');
    if (splash && !splash.classList.contains('fade-out')) {
        splash.classList.add('fade-out');
        setTimeout(() => {
            splash.remove();
        }, 600);
    }
};
