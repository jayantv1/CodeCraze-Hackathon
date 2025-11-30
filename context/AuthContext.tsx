"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthContextType {
    user: User | null;
    userData: any | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    userData: null,
    loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userData, setUserData] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("AuthContext: db is", db ? "defined" : "undefined");
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser && db) {
                // Fetch additional user data from Firestore
                try {
                    // Check root collection first
                    const rootUserDoc = await getDoc(doc(db, "users", currentUser.uid));

                    if (rootUserDoc.exists()) {
                        const rootData = rootUserDoc.data();
                        console.log("Found user in root collection:", rootData);

                        if (rootData.organizationId) {
                            // Try to fetch from organization collection
                            const orgUserRef = doc(db, "organizations", rootData.organizationId, "users", currentUser.uid);
                            const orgUserDoc = await getDoc(orgUserRef);

                            if (orgUserDoc.exists()) {
                                console.log("Found user in org collection");
                                setUserData(orgUserDoc.data());
                            } else {
                                console.log("User found in root but not in org collection. Migrating...");
                                // Migrate data to org collection
                                await setDoc(orgUserRef, rootData);
                                setUserData(rootData);
                            }
                        } else {
                            // Legacy user without org ID, assign default and migrate
                            const defaultOrgId = 'default-org';
                            const updatedData = { ...rootData, organizationId: defaultOrgId };

                            await setDoc(doc(db, "users", currentUser.uid), { organizationId: defaultOrgId }, { merge: true });
                            await setDoc(doc(db, "organizations", defaultOrgId, "users", currentUser.uid), updatedData);

                            setUserData(updatedData);
                        }
                    } else {
                        console.log("User document does not exist, creating...");
                        const defaultOrgId = 'default-org';
                        const defaultUserData = {
                            uid: currentUser.uid,
                            email: currentUser.email,
                            name: currentUser.displayName || 'New User',
                            organizationId: defaultOrgId,
                            organizationName: 'Default Organization',
                            role: 'admin', // Default to admin for dev
                            createdAt: new Date().toISOString()
                        };

                        // Create root pointer
                        await setDoc(doc(db, "users", currentUser.uid), {
                            uid: currentUser.uid,
                            organizationId: defaultOrgId
                        });

                        // Create org user
                        await setDoc(doc(db, "organizations", defaultOrgId, "users", currentUser.uid), defaultUserData);

                        setUserData(defaultUserData);
                        console.log("Created new user in org structure:", defaultUserData);
                    }
                } catch (error) {
                    console.error("Error fetching/creating user data:", error);
                }
            } else {
                setUserData(null);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, userData, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
