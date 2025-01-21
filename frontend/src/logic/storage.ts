const USER_ID_LOCAL_STORAGE_KEY = '$$pixer_user_id';

const saveUserId = (userId: Uint8Array) =>
  localStorage.setItem(USER_ID_LOCAL_STORAGE_KEY, Array.from(userId).join(':'));

const clearSavedUserId = () => localStorage.removeItem(USER_ID_LOCAL_STORAGE_KEY);

function getSavedUserId() {
  const savedId = localStorage.getItem(USER_ID_LOCAL_STORAGE_KEY);
  if (savedId == null) return null;

  try {
    return new Uint8Array(savedId.split(':').map(n => parseInt(n)));
  } catch {}

  return null;
}

export { saveUserId, clearSavedUserId, getSavedUserId };
