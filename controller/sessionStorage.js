class SessionStorage {
    getItem(key) {
      if (typeof window !== 'undefined') {
        return window.sessionStorage.getItem(key);
      }
      return null;
    }
  
    setItem(key, value) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, value);
      }
    }
  
    removeItem(key) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
      }
    }
  
    clear() {
      if (typeof window !== 'undefined') {
        window.sessionStorage.clear();
      }
    }
  }
  
  export const sessionStorage = new SessionStorage();
  