import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import firebaseConfig from './firebaseConfig';
import DrawerNavigator from './routes';

const App = () => {
  const [user, setUser] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        fetchContacts();
      } else {
        setUser(null);
        setContacts([]);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      fetchContacts();
    }
  }, [user]);

  const fetchContacts = async () => {
    if (!user) return;

    const db = getFirestore();
    const userContactsRef = collection(db, 'users', user.uid, 'contacts');

    try {
      const contactsSnapshot = await getDocs(userContactsRef);
      const contactList = [];
      contactsSnapshot.forEach((doc) => {
        contactList.push({ id: doc.id, ...doc.data() });
      });
      setContacts(contactList);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const addContact = async (contact) => {
    if (!user) return;

    const db = getFirestore();
    const userContactsRef = collection(db, 'users', user.uid, 'contacts');

    try {
      const docRef = await setDoc(doc(userContactsRef), contact);
      const newContact = { id: docRef.id, ...contact };
      setContacts([...contacts, newContact]);
    } catch (error) {
      console.log(error);
    }
  };

  const deleteContact = async (contactId) => {
    if (!user) return;

    const db = getFirestore();
    const userContactsRef = collection(db, 'users', user.uid, 'contacts');
    const contactDocRef = doc(userContactsRef, contactId);

    try {
      await deleteDoc(contactDocRef);
      const updatedContacts = contacts.filter((contact) => contact.id !== contactId);
      setContacts(updatedContacts);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <NavigationContainer>
      <DrawerNavigator
        user={user}
        contacts={contacts}
        fetchContacts={fetchContacts}
        addContact={addContact}
        deleteContact={deleteContact}
        isLoading={isLoading}
        favorites={favorites}
        setFavorites={setFavorites}
        setIsLoading={setIsLoading}
      />
    </NavigationContainer>
  );
};

export default App;