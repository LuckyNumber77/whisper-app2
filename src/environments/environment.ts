export const environment = {
  production: false,

  // ← rename this from "firebase" to "firebaseConfig"
  firebaseConfig: {
    apiKey: "AIzaSyAxL_AMTQptIuZy92yQs4eRkWjKjfK4thc",
    authDomain: "whisperapp-990c3.firebaseapp.com",
    projectId: "whisperapp-990c3",
    storageBucket: "whisperapp-990c3.appspot.com",
    messagingSenderId: "212388102451",
    appId: "1:212388102451:web:55d6223d8d3a1bc117e6d6"
  },

  // ← add this flag so our code knows to hit localhost
  useEmulators: true
};
