/**
 * Seeds the live Firestore with sample neighbour accounts and their reports,
 * comments, follows and fix confirmations — so the feed has real-looking data
 * from several different people.
 *
 *   npm run seed            # create accounts + data
 *   npm run seed -- --force # seed again even if sample data already exists
 *
 * Requirements:
 *   - Firebase Console → Authentication → Sign-in method → enable Email/Password.
 *   - SEED_PASSWORD=<8+ chars> in .env (used for all sample accounts).
 *   - Latest firestore.rules deployed.
 *
 * Every write goes through the normal security rules as the account that makes it.
 * Everything is tagged `sample: true`, so Moderator HQ → "Remove sample data" deletes it.
 */
import { initializeApp, type FirebaseOptions } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  query,
  setDoc,
  updateDoc,
  where,
  type Firestore,
} from "firebase/firestore";
import {
  SAMPLE_HOUR,
  SAMPLE_PEOPLE,
  SAMPLE_REPORTS,
  sampleDate,
  sampleDateTime,
} from "../src/data/sampleData.ts";

const env = process.env;
const config: FirebaseOptions = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};
const password = env.SEED_PASSWORD ?? "";
const force = process.argv.includes("--force");

function stop(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

if (!config.apiKey || !config.projectId) stop("Firebase keys missing — run with: npm run seed");
if (password.length < 8) stop("Add SEED_PASSWORD=<at least 8 characters> to .env (used for the sample accounts).");

type Session = { db: Firestore; uid: string; name: string };
const sessions = new Map<string, Session>();

// One Firebase app per person, so every account stays signed in at the same time.
async function signInPerson(person: (typeof SAMPLE_PEOPLE)[number]): Promise<Session> {
  const app = initializeApp(config, `seed-${person.key}`);
  const auth = getAuth(app);
  let uid: string;
  try {
    uid = (await signInWithEmailAndPassword(auth, person.email, password)).user.uid;
  } catch (err) {
    const code = (err as { code?: string }).code ?? "";
    if (code === "auth/operation-not-allowed") {
      stop("Email/Password sign-in is disabled. Enable it in Firebase Console → Authentication → Sign-in method.");
    }
    try {
      uid = (await createUserWithEmailAndPassword(auth, person.email, password)).user.uid;
    } catch (createErr) {
      const createCode = (createErr as { code?: string }).code ?? "";
      if (createCode === "auth/operation-not-allowed") {
        stop("Email/Password sign-in is disabled. Enable it in Firebase Console → Authentication → Sign-in method.");
      }
      if (createCode === "auth/email-already-in-use") {
        stop(`${person.email} already exists with a different password. Use the original SEED_PASSWORD.`);
      }
      throw createErr;
    }
  }

  const avatar = `https://api.dicebear.com/7.x/thumbs/svg?seed=${person.avatarSeed}`;
  await updateProfile(auth.currentUser!, { displayName: person.name, photoURL: avatar });
  const db = getFirestore(app);
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (snap.exists()) await updateDoc(ref, { name: person.name, avatar });
  else await setDoc(ref, { name: person.name, avatar, role: "member" });
  return { db, uid, name: person.name };
}

function who(key: string) {
  const session = sessions.get(key);
  if (!session) throw new Error(`No sample account for "${key}"`);
  return session;
}

async function main() {
  console.log(`Seeding project "${config.projectId}"…\n`);

  for (const person of SAMPLE_PEOPLE) {
    sessions.set(person.key, await signInPerson(person));
    console.log(`  👤 ${person.name} (${person.email})`);
  }

  const first = who(SAMPLE_PEOPLE[0].key);
  const existing = await getDocs(
    query(collection(first.db, "reports"), where("hidden", "==", false), where("sample", "==", true), limit(1))
  );
  if (!existing.empty && !force) {
    stop("Sample reports already exist. Remove them in Moderator HQ first, or run: npm run seed -- --force");
  }

  const now = Date.now();
  let reportCount = 0;
  let commentCount = 0;

  // Duplicates can only be linked by an admin, so that example is left to the in-app loader.
  for (const s of SAMPLE_REPORTS.filter((r) => !r.duplicateOfKey)) {
    const creator = who(s.creator);
    const createdMs = now - s.hoursAgo * SAMPLE_HOUR;
    const ref = doc(collection(creator.db, "reports"));

    await setDoc(ref, {
      title: s.title,
      description: s.description,
      category: s.category,
      status: "Open",
      createdAt: sampleDate(createdMs),
      createdAtMs: createdMs,
      creatorId: creator.uid,
      ...(s.photoUrl ? { photoUrl: s.photoUrl } : {}),
      location: s.location,
      ...(s.coords ? { coords: s.coords } : {}),
      followers: [creator.uid],
      flaggedBy: [],
      hidden: false,
      commentsLocked: false,
      resolutionConfirmations: [],
      sample: true,
    });
    reportCount++;

    // The reporter moves their report along the status flow.
    if (s.status !== "Open") await updateDoc(ref, { status: s.status });

    // Neighbours follow, flag and confirm as themselves.
    for (const key of s.followers.filter((k) => k !== s.creator)) {
      const p = who(key);
      await updateDoc(doc(p.db, "reports", ref.id), { followers: arrayUnion(p.uid) });
    }
    for (const key of s.flaggedBy ?? []) {
      const p = who(key);
      await updateDoc(doc(p.db, "reports", ref.id), { flaggedBy: arrayUnion(p.uid) });
    }
    for (const key of (s.confirmations ?? []).filter((k) => k !== s.creator)) {
      const p = who(key);
      await updateDoc(doc(p.db, "reports", ref.id), { resolutionConfirmations: arrayUnion(p.uid) });
    }

    // Comments, oldest first. Only the reporter's posts can be official updates.
    for (const c of [...s.comments].sort((a, b) => b.hoursAgo - a.hoursAgo)) {
      const author = who(c.by);
      const ms = now - c.hoursAgo * SAMPLE_HOUR;
      await addDoc(collection(author.db, "updates"), {
        reportId: ref.id,
        userId: author.uid,
        text: c.text,
        type: c.type === "update" && c.by === s.creator ? "update" : "comment",
        createdAt: sampleDateTime(ms),
        createdAtMs: ms,
        sample: true,
      });
      commentCount++;
    }
    console.log(`  📍 ${s.title} — ${s.status} (${s.comments.length} comments)`);
  }

  console.log(`\n✔ Done: ${SAMPLE_PEOPLE.length} accounts, ${reportCount} reports, ${commentCount} comments.\n`);
  process.exit(0);
}

main().catch((err) => {
  const code = (err as { code?: string }).code;
  if (code === "permission-denied") {
    stop("Permission denied by Firestore rules — deploy the latest rules: firebase deploy --only firestore:rules");
  }
  console.error(err);
  process.exit(1);
});
