import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { db, storage } from "./firebase";

// ==========================================
// TYPES
// ==========================================

export interface ClinicSettings {
  id?: string;
  clinicName: string;
  doctorName: string;
  qualification: string;
  experience: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  openingHours: string;
  emergencyContact: string;
  googleMapsUrl: string;
  heroImage: string;
  logo: string;
  aboutDoctor: string;
  clinicDescription: string;
}

export interface DentalService {
  id?: string;
  name: string;
  desc: string;
  price: string;
  iconName: string; // Stethoscope, Sparkles, Wrench, etc.
  isVisible: boolean;
  orderIndex: number;
  imageUrl?: string;
}

export interface GalleryItem {
  id?: string;
  imageUrl: string;
  alt: string;
  tall: boolean;
  orderIndex: number;
}

export interface DoctorAvailability {
  morningSession: string;
  eveningSession: string;
  status: "available" | "unavailable" | "vacation" | "holiday" | "emergency-leave";
}

export interface NoticeBoard {
  content: string;
  updatedAt: string;
}

export interface Appointment {
  id?: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientAge?: string;
  patientGender?: string;
  date: string; // YYYY-MM-DD
  slot: string; // e.g. 09:00 AM
  reason: string;
  notes?: string;
  status: "Pending" | "Approved" | "Completed" | "Cancelled";
  createdAt: string;
}

export interface Review {
  id?: string;
  name: string;
  body: string;
  stars: number;
  isApproved: boolean;
  createdAt: string;
  appointmentId?: string;
}

export interface TimeSlot {
  id?: string;
  date: string; // YYYY-MM-DD
  slot: string; // e.g. 09:00 AM
  isBooked: boolean;
  bookedBy?: string;
}

// ==========================================
// DEFAULT / SEED DATA
// ==========================================

export const DEFAULT_SETTINGS: ClinicSettings = {
  clinicName: "Dr. Kalhyanie Dental Clinic",
  doctorName: "Dr. Kalhyanie",
  qualification: "BDS, MDS",
  experience: "12+ Years",
  phone: "+91 96037 76252",
  whatsapp: "+91 96037 76252",
  email: "hello@kalhyaniedental.com",
  address:
    "Shop No. 2, Near Muthyalu Complex, Suraram Market Road, Fish Market Road, Suraram, Hyderabad-500055, Telangana",
  openingHours: "Mon – Sat • 9 AM – 8 PM",
  emergencyContact: "+91 96037 76252",
  googleMapsUrl: "https://maps.google.com/maps?q=17.540793,78.434383&z=17&output=embed",
  heroImage: "", // Uses local fallback if empty
  logo: "",
  aboutDoctor:
    "A warm, family-focused dentist with over a decade of experience. Dr. Kalhyanie believes every patient deserves gentle, honest, and unhurried care — because a relaxed visit is the first step to a healthier smile.",
  clinicDescription:
    "Providing gentle, affordable, and trusted dental care for patients of all ages — from your child's first check-up to advanced treatments.",
};

export const DEFAULT_SERVICES: DentalService[] = [
  {
    name: "General Consultation",
    desc: "Comprehensive dental exam and honest advice.",
    price: "₹300",
    iconName: "Stethoscope",
    isVisible: true,
    orderIndex: 0,
  },
  {
    name: "Teeth Cleaning",
    desc: "Professional scaling and polishing for fresh breath.",
    price: "₹1,500",
    iconName: "Sparkles",
    isVisible: true,
    orderIndex: 1,
  },
  {
    name: "Dental Fillings",
    desc: "Tooth-colored fillings that look completely natural.",
    price: "₹1,200",
    iconName: "Wrench",
    isVisible: true,
    orderIndex: 2,
  },
  {
    name: "Root Canal Treatment",
    desc: "Painless, single-sitting root canal treatments.",
    price: "₹4,500",
    iconName: "Zap",
    isVisible: true,
    orderIndex: 3,
  },
  {
    name: "Crowns & Bridges",
    desc: "Durable ceramic and zirconia crowns.",
    price: "₹6,000",
    iconName: "Award",
    isVisible: true,
    orderIndex: 4,
  },
  {
    name: "Braces & Aligners",
    desc: "Metal, ceramic and clear aligner options.",
    price: "₹25,000",
    iconName: "Smile",
    isVisible: true,
    orderIndex: 5,
  },
  {
    name: "Teeth Whitening",
    desc: "Safe, in-clinic whitening for a brighter smile.",
    price: "₹5,000",
    iconName: "Star",
    isVisible: true,
    orderIndex: 6,
  },
  {
    name: "Wisdom Tooth Extraction",
    desc: "Careful surgical extractions with recovery care.",
    price: "₹3,500",
    iconName: "Wrench",
    isVisible: true,
    orderIndex: 7,
  },
  {
    name: "Dental Implants",
    desc: "Permanent tooth replacement that feels natural.",
    price: "₹25,000",
    iconName: "BadgeCheck",
    isVisible: true,
    orderIndex: 8,
  },
  {
    name: "Children's Dentistry",
    desc: "Kid-friendly appointments with lots of patience.",
    price: "₹400",
    iconName: "Baby",
    isVisible: true,
    orderIndex: 9,
  },
  {
    name: "Emergency Dental Care",
    desc: "Same-day appointments for urgent pain.",
    price: "On call",
    iconName: "LifeBuoy",
    isVisible: true,
    orderIndex: 10,
  },
];

export const DEFAULT_GALLERY: Omit<GalleryItem, "id">[] = [
  {
    imageUrl: "/src/assets/gallery-reception.jpg",
    alt: "Reception area",
    tall: false,
    orderIndex: 0,
  },
  {
    imageUrl: "/src/assets/gallery-equipment.jpg",
    alt: "Sterile dental instruments",
    tall: true,
    orderIndex: 1,
  },
  {
    imageUrl: "/src/assets/gallery-treatment.jpg",
    alt: "Treatment room",
    tall: false,
    orderIndex: 2,
  },
  {
    imageUrl: "/src/assets/gallery-waiting.jpg",
    alt: "Waiting lounge",
    tall: false,
    orderIndex: 3,
  },
  {
    imageUrl: "/src/assets/gallery-patient.jpg",
    alt: "Doctor treating a young patient",
    tall: false,
    orderIndex: 4,
  },
  {
    imageUrl: "/src/assets/gallery-exterior.jpg",
    alt: "Clinic exterior",
    tall: true,
    orderIndex: 5,
  },
];

export const DEFAULT_REVIEWS: Omit<Review, "id">[] = [
  {
    name: "Anita R.",
    body: "I used to dread the dentist. Dr. Kalhyanie is so patient and kind — my kids actually look forward to their appointments now!",
    stars: 5,
    isApproved: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: "Rahul M.",
    body: "Had a root canal last month. Absolutely painless and the pricing was completely transparent. Highly recommend.",
    stars: 5,
    isApproved: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: "Priya S.",
    body: "Clean clinic, modern equipment, and a team that actually listens. My cleaning felt spa-like.",
    stars: 5,
    isApproved: true,
    createdAt: new Date().toISOString(),
  },
  {
    name: "Vikram T.",
    body: "Got braces done here. The team explained every step and check-ups were always on time. Very happy with the result.",
    stars: 5,
    isApproved: true,
    createdAt: new Date().toISOString(),
  },
];

// ==========================================
// FILE UPLOADER HELPER
// ==========================================

export async function uploadImage(file: File, folder: string): Promise<string> {
  const timestamp = Date.now();
  const fileRef = ref(storage, `${folder}/${timestamp}_${file.name}`);
  const snapshot = await uploadBytes(fileRef, file);
  const downloadUrl = await getDownloadURL(snapshot.ref);
  return downloadUrl;
}

export async function deleteImage(imageUrl: string): Promise<void> {
  try {
    if (!imageUrl.includes("firebasestorage.googleapis.com")) return;
    const fileRef = ref(storage, imageUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error("Error deleting image from storage:", error);
  }
}

// ==========================================
// CLINIC SETTINGS SERVICE
// ==========================================

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, fallback: T): Promise<T> {
  return new Promise<T>((resolve) => {
    let completed = false;
    const timer = setTimeout(() => {
      if (!completed) {
        completed = true;
        console.warn(`Firestore operation timed out after ${timeoutMs}ms, returning fallback.`);
        resolve(fallback);
      }
    }, timeoutMs);

    promise
      .then((res) => {
        if (!completed) {
          completed = true;
          clearTimeout(timer);
          resolve(res);
        }
      })
      .catch((err) => {
        if (!completed) {
          completed = true;
          clearTimeout(timer);
          console.warn("Firestore operation failed, returning fallback:", err);
          resolve(fallback);
        }
      });
  });
}

function withWriteTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMsg: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    let completed = false;
    const timer = setTimeout(() => {
      if (!completed) {
        completed = true;
        reject(new Error(errorMsg));
      }
    }, timeoutMs);

    promise
      .then((res) => {
        if (!completed) {
          completed = true;
          clearTimeout(timer);
          resolve(res);
        }
      })
      .catch((err) => {
        if (!completed) {
          completed = true;
          clearTimeout(timer);
          reject(err);
        }
      });
  });
}

export async function getClinicSettings(): Promise<ClinicSettings> {
  const fetchPromise = (async () => {
    try {
      const docRef = doc(db, "settings", "main");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as ClinicSettings;
        let needsUpdate = false;
        const updatedData = { ...data };

        if (
          data.phone === "+91 99999 99999" ||
          data.phone === "9999999999" ||
          data.phone === "+91 9999999999" ||
          !data.phone
        ) {
          updatedData.phone = DEFAULT_SETTINGS.phone;
          needsUpdate = true;
        }
        if (
          data.whatsapp === "+91 99999 99999" ||
          data.whatsapp === "9999999999" ||
          data.whatsapp === "+91 9999999999" ||
          !data.whatsapp
        ) {
          updatedData.whatsapp = DEFAULT_SETTINGS.whatsapp;
          needsUpdate = true;
        }
        if (data.emergencyContact === "+91 88888 88888" || !data.emergencyContact) {
          updatedData.emergencyContact = DEFAULT_SETTINGS.emergencyContact;
          needsUpdate = true;
        }
        if (
          data.address === "123 Green Park Road, New Delhi 110016" ||
          data.address?.includes("Green Park") ||
          !data.address
        ) {
          updatedData.address = DEFAULT_SETTINGS.address;
          needsUpdate = true;
        }
        if (
          data.googleMapsUrl?.includes("Green+Park") ||
          data.googleMapsUrl?.includes("New+Delhi") ||
          !data.googleMapsUrl
        ) {
          updatedData.googleMapsUrl = DEFAULT_SETTINGS.googleMapsUrl;
          needsUpdate = true;
        }
        if (data.clinicName === "Hari Ohm Vatsalla Dental Clinic" || !data.clinicName) {
          updatedData.clinicName = DEFAULT_SETTINGS.clinicName;
          needsUpdate = true;
        }
        if (data.doctorName === "Dr. Vatsalla" || !data.doctorName) {
          updatedData.doctorName = DEFAULT_SETTINGS.doctorName;
          needsUpdate = true;
        }

        if (needsUpdate) {
          try {
            await setDoc(docRef, updatedData, { merge: true });
            console.info("Successfully migrated old clinic settings to new defaults in Firestore.");
          } catch (writeErr) {
            console.warn(
              "Could not auto-migrate settings in Firestore (likely unauthorized):",
              writeErr,
            );
          }
          return { id: docSnap.id, ...updatedData } as ClinicSettings;
        }

        return { id: docSnap.id, ...data } as ClinicSettings;
      } else {
        // Seed and return default settings
        try {
          await setDoc(docRef, DEFAULT_SETTINGS);
        } catch (writeErr) {
          console.warn("Could not seed default settings (client offline/unauthorized):", writeErr);
        }
        return { id: "main", ...DEFAULT_SETTINGS };
      }
    } catch (error) {
      console.warn("Error fetching clinic settings, using fallback:", error);
      return { id: "main", ...DEFAULT_SETTINGS };
    }
  })();

  return withTimeout(fetchPromise, 2500, { id: "main", ...DEFAULT_SETTINGS });
}

export async function updateClinicSettings(settings: Partial<ClinicSettings>): Promise<void> {
  const docRef = doc(db, "settings", "main");
  await setDoc(docRef, settings, { merge: true });
}

// ==========================================
// SERVICES SERVICE
// ==========================================

export async function getServices(): Promise<DentalService[]> {
  const fallbackData = DEFAULT_SERVICES.map((s, i) => ({ id: `default_${i}`, ...s }));

  const fetchPromise = (async () => {
    try {
      const q = query(collection(db, "services"), orderBy("orderIndex", "asc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Seed default services
        const services: DentalService[] = [];
        for (const service of DEFAULT_SERVICES) {
          try {
            const docRef = await addDoc(collection(db, "services"), service);
            services.push({ id: docRef.id, ...service });
          } catch (writeErr) {
            console.warn("Could not seed service (client offline/unauthorized):", writeErr);
          }
        }
        return services.length > 0 ? services : fallbackData;
      }

      const allServices = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DentalService[];

      const seenNames = new Set<string>();
      const uniqueServices: DentalService[] = [];
      const duplicatesToDelete: string[] = [];

      for (const service of allServices) {
        const normalizedName = service.name.trim().toLowerCase();
        if (seenNames.has(normalizedName)) {
          if (service.id && !service.id.startsWith("default_")) {
            duplicatesToDelete.push(service.id);
          }
        } else {
          seenNames.add(normalizedName);
          uniqueServices.push(service);
        }
      }

      if (duplicatesToDelete.length > 0) {
        console.info(
          `Found ${duplicatesToDelete.length} duplicate services. Deleting redundant records from Firestore...`,
        );
        for (const dupId of duplicatesToDelete) {
          try {
            await deleteDoc(doc(db, "services", dupId));
          } catch (deleteErr) {
            console.warn(`Failed to delete duplicate service ${dupId}:`, deleteErr);
          }
        }
      }

      return uniqueServices;
    } catch (error) {
      console.warn("Error fetching services, using fallback:", error);
      return fallbackData;
    }
  })();

  return withTimeout(fetchPromise, 2500, fallbackData);
}

export async function addService(service: Omit<DentalService, "id">): Promise<DentalService> {
  const docRef = await addDoc(collection(db, "services"), service);
  return { id: docRef.id, ...service };
}

export async function updateService(id: string, service: Partial<DentalService>): Promise<void> {
  const docRef = doc(db, "services", id);
  await updateDoc(docRef, service);
}

export async function deleteService(id: string, imageUrl?: string): Promise<void> {
  if (imageUrl) {
    await deleteImage(imageUrl);
  }
  const docRef = doc(db, "services", id);
  await deleteDoc(docRef);
}

// ==========================================
// GALLERY SERVICE
// ==========================================

export async function getGallery(): Promise<GalleryItem[]> {
  const fallbackData = DEFAULT_GALLERY.map((g, i) => ({ id: `default_${i}`, ...g }) as GalleryItem);

  const fetchPromise = (async () => {
    try {
      const q = query(collection(db, "gallery"), orderBy("orderIndex", "asc"));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        // Seed gallery metadata (urls point to standard local files initially)
        const gallery: GalleryItem[] = [];
        for (const item of DEFAULT_GALLERY) {
          try {
            const docRef = await addDoc(collection(db, "gallery"), item);
            gallery.push({ id: docRef.id, ...item });
          } catch (writeErr) {
            console.warn("Could not seed gallery item (client offline/unauthorized):", writeErr);
          }
        }
        return gallery.length > 0 ? gallery : fallbackData;
      }

      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as GalleryItem[];
    } catch (error) {
      console.warn("Error fetching gallery, using fallback:", error);
      return fallbackData;
    }
  })();

  return withTimeout(fetchPromise, 2500, fallbackData);
}

export async function addGalleryItem(item: Omit<GalleryItem, "id">): Promise<GalleryItem> {
  const docRef = await addDoc(collection(db, "gallery"), item);
  return { id: docRef.id, ...item };
}

export async function deleteGalleryItem(id: string, imageUrl: string): Promise<void> {
  await deleteImage(imageUrl);
  const docRef = doc(db, "gallery", id);
  await deleteDoc(docRef);
}

export async function updateGalleryItemOrder(id: string, orderIndex: number): Promise<void> {
  const docRef = doc(db, "gallery", id);
  await updateDoc(docRef, { orderIndex });
}

// ==========================================
// DOCTOR AVAILABILITY & NOTICE SERVICE
// ==========================================

export async function getAvailability(): Promise<DoctorAvailability> {
  const defaultAvailability: DoctorAvailability = {
    morningSession: "9 AM – 1 PM",
    eveningSession: "4 PM – 8 PM",
    status: "available",
  };

  const fetchPromise = (async () => {
    try {
      const docRef = doc(db, "availability", "current");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as DoctorAvailability;
      } else {
        try {
          await setDoc(docRef, defaultAvailability);
        } catch (writeErr) {
          console.warn("Could not seed availability (client offline/unauthorized):", writeErr);
        }
        return defaultAvailability;
      }
    } catch (error) {
      console.warn("Error fetching availability, using fallback:", error);
      return defaultAvailability;
    }
  })();

  return withTimeout(fetchPromise, 2500, defaultAvailability);
}

export async function updateAvailability(availability: Partial<DoctorAvailability>): Promise<void> {
  const docRef = doc(db, "availability", "current");
  await setDoc(docRef, availability, { merge: true });
}

export async function getNotice(): Promise<NoticeBoard> {
  const defaultNotice: NoticeBoard = {
    content:
      "Doctor will be available from 11 AM onwards today. For emergencies, please call the clinic directly.",
    updatedAt: new Date().toISOString(),
  };

  const fetchPromise = (async () => {
    try {
      const docRef = doc(db, "notice", "current");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as NoticeBoard;
      } else {
        try {
          await setDoc(docRef, defaultNotice);
        } catch (writeErr) {
          console.warn("Could not seed notice (client offline/unauthorized):", writeErr);
        }
        return defaultNotice;
      }
    } catch (error) {
      console.warn("Error fetching notice, using fallback:", error);
      return defaultNotice;
    }
  })();

  return withTimeout(fetchPromise, 2500, defaultNotice);
}

export async function updateNotice(content: string): Promise<void> {
  const docRef = doc(db, "notice", "current");
  await setDoc(docRef, {
    content,
    updatedAt: new Date().toISOString(),
  });
}

// ==========================================
// REVIEWS SERVICE
// ==========================================

export async function getApprovedReviews(): Promise<Review[]> {
  const fallbackData = DEFAULT_REVIEWS.map((r, i) => ({ id: `default_${i}`, ...r }) as Review);

  const fetchPromise = (async () => {
    try {
      const q = query(collection(db, "reviews"), where("isApproved", "==", true));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        const reviews: Review[] = [];
        for (const r of DEFAULT_REVIEWS) {
          try {
            const docRef = await addDoc(collection(db, "reviews"), r);
            reviews.push({ id: docRef.id, ...r });
          } catch (writeErr) {
            console.warn("Could not seed review (client offline/unauthorized):", writeErr);
          }
        }
        return reviews.length > 0 ? reviews : fallbackData;
      }

      const fetchedReviews = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];
      return fetchedReviews.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (error) {
      console.warn("Error fetching reviews, using fallback:", error);
      return fallbackData;
    }
  })();

  return withTimeout(fetchPromise, 2500, fallbackData);
}

export async function getAllReviews(): Promise<Review[]> {
  const fetchPromise = (async () => {
    try {
      const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Review[];
    } catch (err) {
      console.warn("Error fetching all reviews:", err);
      return [];
    }
  })();
  return withTimeout(fetchPromise, 2500, []);
}

export async function submitReview(
  review: Omit<Review, "id" | "isApproved" | "createdAt">,
): Promise<Review> {
  const newReview = {
    ...review,
    isApproved: false, // Must be approved by admin
    createdAt: new Date().toISOString(),
  };
  const docRef = await addDoc(collection(db, "reviews"), newReview);
  return { id: docRef.id, ...newReview };
}

export async function approveReview(id: string, isApproved: boolean): Promise<void> {
  const docRef = doc(db, "reviews", id);
  await updateDoc(docRef, { isApproved });
}

export async function deleteReview(id: string): Promise<void> {
  const docRef = doc(db, "reviews", id);
  await deleteDoc(docRef);
}

// ==========================================
// APPOINTMENTS SERVICE
// ==========================================

export async function getPatientAppointments(patientId: string): Promise<Appointment[]> {
  const fetchPromise = (async () => {
    try {
      const q = query(collection(db, "appointments"), where("patientId", "==", patientId));
      const snapshot = await getDocs(q);
      const appointments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Appointment[];
      return appointments.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } catch (err) {
      console.warn("Error fetching patient appointments:", err);
      return [];
    }
  })();
  return withTimeout(fetchPromise, 2500, []);
}

export async function getAllAppointments(): Promise<Appointment[]> {
  const fetchPromise = (async () => {
    try {
      const q = query(collection(db, "appointments"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Appointment[];
    } catch (err) {
      console.warn("Error fetching all appointments:", err);
      return [];
    }
  })();
  return withTimeout(fetchPromise, 2500, []);
}

export async function createAppointment(
  app: Omit<Appointment, "id" | "createdAt" | "status">,
): Promise<Appointment> {
  const newApp = {
    ...app,
    status: "Pending" as const,
    createdAt: new Date().toISOString(),
  };

  const createPromise = (async () => {
    const docRef = await addDoc(collection(db, "appointments"), newApp);

    // Mark the slot as booked
    await setDoc(doc(db, "slots", `${app.date}_${app.slot}`), {
      date: app.date,
      slot: app.slot,
      isBooked: true,
      bookedBy: app.patientId,
    });

    return { id: docRef.id, ...newApp };
  })();

  return withWriteTimeout(
    createPromise,
    5000,
    "The appointment booking request timed out. Please check your internet connection or try logging in first.",
  );
}

export async function updateAppointmentStatus(
  id: string,
  status: "Pending" | "Approved" | "Completed" | "Cancelled",
  date: string,
  slot: string,
): Promise<void> {
  const docRef = doc(db, "appointments", id);
  await updateDoc(docRef, { status });

  // If completed/cancelled, free up the slot
  if (status === "Cancelled" || status === "Completed") {
    const slotDocRef = doc(db, "slots", `${date}_${slot}`);
    await setDoc(slotDocRef, { isBooked: false }, { merge: true });
  } else if (status === "Approved" || status === "Pending") {
    const slotDocRef = doc(db, "slots", `${date}_${slot}`);
    await setDoc(slotDocRef, { isBooked: true }, { merge: true });
  }
}

export async function rescheduleAppointment(
  id: string,
  oldDate: string,
  oldSlot: string,
  newDate: string,
  newSlot: string,
): Promise<void> {
  const docRef = doc(db, "appointments", id);
  await updateDoc(docRef, { date: newDate, slot: newSlot });

  // Free up old slot
  await setDoc(doc(db, "slots", `${oldDate}_${oldSlot}`), { isBooked: false }, { merge: true });

  // Book new slot
  await setDoc(doc(db, "slots", `${newDate}_${newSlot}`), {
    date: newDate,
    slot: newSlot,
    isBooked: true,
  });
}

// ==========================================
// SLOT BOOKING ENGINE SERVICE
// ==========================================

export async function getBookedSlotsForDate(date: string): Promise<string[]> {
  const fetchPromise = (async () => {
    try {
      const q = query(
        collection(db, "slots"),
        where("date", "==", date),
        where("isBooked", "==", true),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data().slot) as string[];
    } catch (err) {
      console.warn("Error fetching booked slots:", err);
      return [];
    }
  })();
  return withTimeout(fetchPromise, 2500, []);
}

export async function createSlot(date: string, slot: string): Promise<void> {
  await setDoc(doc(db, "slots", `${date}_${slot}`), {
    date,
    slot,
    isBooked: false,
  });
}
