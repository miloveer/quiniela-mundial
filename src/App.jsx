import './firebase/firebaseConfig.js';
import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage.jsx';
import DashboardMock from './pages/DashboardMock.jsx';
import {
  listenToAuthChanges,
  logoutFirebaseUser,
} from './services/authService';
import {
  createOrUpdateUserProfile,
  getUserProfile,
  updateUserLeagueData,
} from './services/userService';
import {
  getStorageItem,
  removeStorageItem,
  setStorageItem,
  STORAGE_KEYS,
} from './utils/storageUtils';

function App() {
  const storedUser = getStorageItem(STORAGE_KEYS.USER, null);

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [currentUser, setCurrentUser] = useState(storedUser);

  const isAuthenticated = Boolean(currentUser);

  useEffect(() => {
    const unsubscribe = listenToAuthChanges(async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setCurrentUser(null);
          removeStorageItem(STORAGE_KEYS.USER);
          setIsCheckingSession(false);
          return;
        }

        const storedUserData = getStorageItem(STORAGE_KEYS.USER, {});
        const firestoreProfile = await getUserProfile(firebaseUser.uid);

        const userData = {
          ...firebaseUser,
          displayName:
            firestoreProfile?.displayName ||
            storedUserData?.displayName ||
            firebaseUser.displayName ||
            'Usuario',
          leagueCode:
            firestoreProfile?.leagueCode ??
            storedUserData?.leagueCode ??
            null,
          activeLeagueId:
            firestoreProfile?.activeLeagueId ??
            storedUserData?.activeLeagueId ??
            null,
          leagueName:
            firestoreProfile?.leagueName ??
            storedUserData?.leagueName ??
            null,
        };

        await createOrUpdateUserProfile(userData);

        setCurrentUser(userData);
        setStorageItem(STORAGE_KEYS.USER, userData);
      } catch (error) {
        console.error('Error cargando perfil de usuario:', error);

        const storedUserData = getStorageItem(STORAGE_KEYS.USER, {});

        const fallbackUser = {
          ...firebaseUser,
          displayName:
            storedUserData?.displayName ||
            firebaseUser?.displayName ||
            'Usuario',
          leagueCode: storedUserData?.leagueCode ?? null,
          activeLeagueId: storedUserData?.activeLeagueId ?? null,
          leagueName: storedUserData?.leagueName ?? null,
        };

        setCurrentUser(fallbackUser);
        setStorageItem(STORAGE_KEYS.USER, fallbackUser);
      } finally {
        setIsCheckingSession(false);
      }
    });

    return () => unsubscribe();
  }, []);

  async function handleLogin(userData) {
    try {
      const savedProfile = await createOrUpdateUserProfile(userData);

      const fullUserData = {
        ...userData,
        ...savedProfile,
      };

      setCurrentUser(fullUserData);
      setStorageItem(STORAGE_KEYS.USER, fullUserData);
    } catch (error) {
      console.error('Error guardando perfil al iniciar sesión:', error);

      setCurrentUser(userData);
      setStorageItem(STORAGE_KEYS.USER, userData);
    }
  }

  async function handleLogout() {
    try {
      await logoutFirebaseUser();
    } catch (error) {
      console.error('Error cerrando sesión en Firebase:', error);
    } finally {
      setCurrentUser(null);
      removeStorageItem(STORAGE_KEYS.USER);
    }
  }

  async function handleUpdateUser(updatedData) {
    const updatedUser = {
      ...currentUser,
      ...updatedData,
    };

    setCurrentUser(updatedUser);
    setStorageItem(STORAGE_KEYS.USER, updatedUser);

    if (updatedData.leagueCode && updatedUser?.uid) {
      try {
        await updateUserLeagueData({
          uid: updatedUser.uid,
          leagueCode: updatedData.leagueCode,
          activeLeagueId: updatedData.activeLeagueId,
          leagueName: updatedData.leagueName,
        });
      } catch (error) {
        console.error('Error actualizando liga del usuario:', error);
      }
    }
  }

  if (isCheckingSession) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <section className="w-full max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-2xl">
          <div className="mx-auto mb-4 h-12 w-12 animate-pulse rounded-2xl bg-emerald-600" />

          <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-700">
            Quiniela Mundial
          </p>

          <h1 className="mt-2 text-2xl font-black text-slate-950">
            Validando sesión
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Estamos revisando tu acceso con Firebase.
          </p>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <DashboardMock
      user={currentUser}
      onLogout={handleLogout}
      onUpdateUser={handleUpdateUser}
    />
  );
}

export default App;