// lib/api.ts

// --- Data Types ---
export type Company = {
  id: string;
  name: string;
  country: string;
  emissions: GhgEmission[];
};

export type GhgEmission = {
  id?: number;
  yearMonth: string;
  source?: string | null;
  emissions: number;
};

export type Post = {
  id: string;
  title: string;
  resourceUid: string;
  dateTime: string;
  content: string;
};

// --- Mock Data ---
const initialCompanies: Company[] = [
  {
    id: "c1",
    name: "Acme Corp",
    country: "US",
    emissions: [
      { yearMonth: "2024-01", emissions: 120 },
      { yearMonth: "2024-02", emissions: 110 },
      { yearMonth: "2024-03", emissions: 95 }
    ]
  },
  {
    id: "c2",
    name: "Globex",
    country: "DE",
    emissions: [
      { yearMonth: "2024-01", emissions: 80 },
      { yearMonth: "2024-02", emissions: 105 },
      { yearMonth: "2024-03", emissions: 120 }
    ]
  }
];

const initialPosts: Post[] = [
  {
    id: "p1",
    title: "Sustainability Report",
    resourceUid: "c1",
    dateTime: "2024-02",
    content: "Quarterly CO2 update"
  }
];

const initialCountries = [
  { code: "US", name: "United States" },
  { code: "DE", name: "Germany" },
  { code: "KR", name: "South Korea" }
];

// --- Internal State (Fake DB) ---
let _countries = [...initialCountries];
let _companies = [...initialCompanies];
let _posts = [...initialPosts];

// --- Utilities ---
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
const jitter = () => 200 + Math.random() * 600;
const maybeFail = () => Math.random() < 0.15;

// --- API Functions ---
export async function fetchCountries() {
  await delay(jitter());
  return _countries;
}

export async function fetchCompanies() {
  await delay(jitter());
  return _companies;
}

export async function fetchPosts() {
  await delay(jitter());
  return _posts;
}

export async function createOrUpdatePost(p: Omit<Post, "id"> & { id?: string }) {
  await delay(jitter());
  if (maybeFail()) throw new Error("Save failed");
  
  if (p.id) {
    const existingIndex = _posts.findIndex(x => x.id === p.id);
    if (existingIndex > -1) {
      const updated = { ...p, id: p.id } as Post;
      _posts[existingIndex] = updated;
      return updated;
    }
  }
  
  const created: Post = { 
    ...p, 
    id: p.id || Math.random().toString(36).substring(2, 11) 
  };
  _posts = [..._posts, created];
  return created;
}
