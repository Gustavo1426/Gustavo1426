import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, setDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCvwcIa2TmO2M1roel8Dz8hljvDbQPdwTQ",
  authDomain: "gen-lang-client-0593011966.firebaseapp.com",
  projectId: "gen-lang-client-0593011966",
  storageBucket: "gen-lang-client-0593011966.firebasestorage.app",
  messagingSenderId: "502096018820",
  appId: "1:502096018820:web:53c3f17aec0cc1f615f1d1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, "ai-studio-treinopro-524f80f6-512c-48e3-a990-cba57700b45b");

async function runTest() {
  console.log("Starting read/write test...");
  try {
    const testDocRef = doc(db, "students", "test-joao");
    await setDoc(testDocRef, {
      id: "test-joao",
      name: "João Teste",
      email: "joao@teste.com",
      phone: "11999999999",
      plan: "Mensal",
      status: "Ativo",
      joinedDate: new Date().toISOString()
    });
    console.log("Successfully wrote test-joao!");

    const q = collection(db, "students");
    const snapshot = await getDocs(q);
    console.log(`Successfully read back ${snapshot.size} documents from students.`);
    snapshot.forEach((doc) => {
      console.log(`Document ID: ${doc.id}, Name: ${doc.data().name}`);
    });
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

runTest();
