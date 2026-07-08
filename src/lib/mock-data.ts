// Centralized mock data for the House of Valerion HR portal.

export type Role = "employee" | "manager" | "hr" | "admin";

export interface RoleProfile {
  role: Role;
  name: string;
  title: string;
  email: string;
  avatar: string;
  department: string;
  employeeId: string;
}

export const ROLES: Record<Role, RoleProfile> = {
  employee: {
    role: "employee",
    name: "Elena Marchetti",
    title: "Senior Atelier Designer",
    email: "elena.marchetti@valerion.com",
    avatar: "EM",
    department: "Haute Couture",
    employeeId: "HOV-2041",
  },
  manager: {
    role: "manager",
    name: "Alessandro Rossi",
    title: "Head of Atelier",
    email: "a.rossi@valerion.com",
    avatar: "AR",
    department: "Haute Couture",
    employeeId: "HOV-1082",
  },
  hr: {
    role: "hr",
    name: "Isabelle Laurent",
    title: "HR Director",
    email: "i.laurent@valerion.com",
    avatar: "IL",
    department: "People & Culture",
    employeeId: "HOV-0421",
  },
  admin: {
    role: "admin",
    name: "Marcus Valerion",
    title: "System Administrator",
    email: "m.valerion@valerion.com",
    avatar: "MV",
    department: "Technology",
    employeeId: "HOV-0001",
  },
};

export const DEPARTMENTS = [
  { name: "Haute Couture", headcount: 42, lead: "Alessandro Rossi", color: "#D4AF37" },
  { name: "Leather Atelier", headcount: 28, lead: "Sofia Bianchi", color: "#0A1F44" },
  { name: "Retail & Boutique", headcount: 156, lead: "James Whitfield", color: "#123A82" },
  { name: "Marketing & Brand", headcount: 34, lead: "Chloé Dubois", color: "#8B5CF6" },
  { name: "People & Culture", headcount: 18, lead: "Isabelle Laurent", color: "#EC4899" },
  { name: "Technology", headcount: 22, lead: "Marcus Valerion", color: "#10B981" },
  { name: "Finance", headcount: 16, lead: "Henrik Voss", color: "#F59E0B" },
  { name: "Supply Chain", headcount: 47, lead: "Priya Ananth", color: "#06B6D4" },
];

export const EMPLOYEES = Array.from({ length: 32 }).map((_, i) => {
  const first = ["Elena","Marco","Sofia","Aria","Luca","Chiara","Noah","Zara","Idris","Amara","Yuki","Diego","Isla","Léo","Nadia","Omar","Petra","Quinn","Rania","Silas","Tara","Ugo","Vera","Wren","Xavi","Yasmin","Zayd","Alba","Bruno","Céline","Dario","Emilia"][i % 32];
  const last = ["Marchetti","Rossi","Bianchi","Laurent","Whitfield","Dubois","Voss","Ananth","Kobayashi","Okafor","Nakamura","Fernández","Sørensen","Petit","Haddad","Novak","Kowalski","O'Connor","Silva","Reyes","Iyer","Costa","Weiss","Blackwood","Amari","Sultan","Farouk","Bergström","Cavalli","Delacroix","Escobar","Fioretti"][i % 32];
  const departments = DEPARTMENTS.map(d => d.name);
  const roles = ["Designer","Artisan","Boutique Manager","Analyst","Coordinator","Director","Associate","Specialist","Lead","Consultant"];
  return {
    id: `HOV-${2000 + i}`,
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g,'')}@valerion.com`,
    avatar: `${first[0]}${last[0]}`,
    department: departments[i % departments.length],
    title: `${["Senior","Lead","Principal","Associate","Junior"][i % 5]} ${roles[i % roles.length]}`,
    status: (["Active","Active","Active","On Leave","Active","Remote"] as const)[i % 6],
    location: ["Milan","Paris","New York","London","Tokyo","Dubai"][i % 6],
    joined: `202${(i % 6) + 0}-0${(i % 9) + 1}-1${i % 9}`,
    performance: 3.5 + ((i * 13) % 15) / 10,
    salary: 65000 + ((i * 4137) % 120000),
  };
});

export const NOTIFICATIONS = [
  { id: 1, title: "Leave request approved", desc: "Your 3-day leave has been approved by Alessandro.", time: "2m ago", unread: true, type: "success" },
  { id: 2, title: "Performance review scheduled", desc: "Q3 review with your manager on Fri, 10:00.", time: "1h ago", unread: true, type: "info" },
  { id: 3, title: "New payslip available", desc: "November payslip is ready to download.", time: "3h ago", unread: true, type: "info" },
  { id: 4, title: "Training due", desc: "Complete 'Luxury Client Experience' by Dec 15.", time: "Yesterday", unread: false, type: "warning" },
  { id: 5, title: "Welcome aboard", desc: "3 new colleagues joined Haute Couture atelier.", time: "2d ago", unread: false, type: "info" },
];

export const ANNOUNCEMENTS = [
  { title: "Milan Fashion Week Preparations", body: "All atelier teams — final fittings begin Monday. Access badges have been renewed.", author: "Alessandro Rossi", tag: "Atelier" },
  { title: "Q4 Wellness Programme", body: "Complimentary yoga & meditation sessions every Thursday at 18:00 in the Terrace lounge.", author: "People & Culture", tag: "Wellbeing" },
  { title: "New Boutique Opening — Dubai", body: "Grand opening on Dec 22. Team travel arrangements available in the portal.", author: "Retail Division", tag: "News" },
];

export const HOLIDAYS = [
  { date: "Dec 24", name: "Christmas Eve" },
  { date: "Dec 25", name: "Christmas Day" },
  { date: "Dec 31", name: "New Year's Eve" },
  { date: "Jan 1", name: "New Year's Day" },
  { date: "Jan 6", name: "Epiphany" },
];

export const TASKS = [
  { id: 1, title: "Approve Autumn/Winter mood board", due: "Today", priority: "High", done: false },
  { id: 2, title: "Sign off on artisan hours — week 47", due: "Tomorrow", priority: "Medium", done: false },
  { id: 3, title: "Client review — Maison Deveraux", due: "Fri", priority: "High", done: false },
  { id: 4, title: "Update portfolio images", due: "Next week", priority: "Low", done: true },
  { id: 5, title: "Complete GDPR refresher training", due: "Dec 12", priority: "Medium", done: false },
];

export const ATTENDANCE_TREND = Array.from({ length: 12 }).map((_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  present: 88 + ((i * 7) % 10),
  absent: 4 + (i % 5),
  remote: 12 + ((i * 3) % 8),
}));

export const HEADCOUNT_TREND = Array.from({ length: 12 }).map((_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  headcount: 320 + i * 8 + ((i * 13) % 12),
  hires: 6 + (i % 8),
  exits: 2 + (i % 4),
}));

export const PAYROLL_TREND = Array.from({ length: 12 }).map((_, i) => ({
  month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
  base: 1_820_000 + i * 22_000,
  bonus: 180_000 + ((i * 37_000) % 260_000),
  tax: 520_000 + i * 6_400,
}));

export const RECRUITMENT_FUNNEL = [
  { stage: "Applied", value: 1240 },
  { stage: "Screened", value: 486 },
  { stage: "Interview", value: 182 },
  { stage: "Offer", value: 42 },
  { stage: "Hired", value: 28 },
];

export const OPEN_POSITIONS = [
  { title: "Senior Leather Artisan", dept: "Leather Atelier", location: "Milan", applicants: 47, status: "Active", posted: "2w ago" },
  { title: "Boutique Director", dept: "Retail & Boutique", location: "Dubai", applicants: 132, status: "Active", posted: "3d ago" },
  { title: "Brand Storyteller", dept: "Marketing & Brand", location: "Paris", applicants: 89, status: "Active", posted: "1w ago" },
  { title: "Data Engineer", dept: "Technology", location: "Remote", applicants: 214, status: "Screening", posted: "4d ago" },
  { title: "Client Experience Manager", dept: "Retail & Boutique", location: "New York", applicants: 61, status: "Interviewing", posted: "3w ago" },
  { title: "Supply Chain Analyst", dept: "Supply Chain", location: "Milan", applicants: 38, status: "Active", posted: "5d ago" },
];

export const CANDIDATES = [
  { name: "Yuki Nakamura", role: "Senior Leather Artisan", stage: "Interview", score: 92, source: "Referral" },
  { name: "Idris Okafor", role: "Boutique Director", stage: "Offer", score: 96, source: "LinkedIn" },
  { name: "Amara Silva", role: "Brand Storyteller", stage: "Screening", score: 85, source: "Careers" },
  { name: "Léo Petit", role: "Data Engineer", stage: "Interview", score: 88, source: "Referral" },
  { name: "Nadia Haddad", role: "Client Experience Manager", stage: "Offer", score: 94, source: "Agency" },
  { name: "Petra Novak", role: "Supply Chain Analyst", stage: "Screening", score: 79, source: "Careers" },
];

export const LEAVE_TYPES = [
  { type: "Annual", used: 12, total: 26, color: "#D4AF37" },
  { type: "Sick", used: 3, total: 12, color: "#EC4899" },
  { type: "Personal", used: 2, total: 6, color: "#8B5CF6" },
  { type: "Parental", used: 0, total: 90, color: "#06B6D4" },
];

export const LEAVE_REQUESTS = [
  { id: 1, employee: "Marco Rossi", type: "Annual", from: "Dec 20", to: "Dec 27", days: 5, status: "Pending" },
  { id: 2, employee: "Sofia Bianchi", type: "Sick", from: "Dec 4", to: "Dec 5", days: 2, status: "Approved" },
  { id: 3, employee: "Chloé Dubois", type: "Personal", from: "Dec 12", to: "Dec 12", days: 1, status: "Pending" },
  { id: 4, employee: "Diego Fernández", type: "Annual", from: "Jan 2", to: "Jan 9", days: 6, status: "Pending" },
  { id: 5, employee: "Aria Kobayashi", type: "Parental", from: "Feb 1", to: "May 1", days: 90, status: "Approved" },
];

export const PROJECTS = [
  { name: "Spring/Summer '26 Collection", lead: "Alessandro Rossi", team: 12, progress: 68, deadline: "Feb 14, 2026", status: "On Track" },
  { name: "Dubai Flagship Boutique", lead: "James Whitfield", team: 24, progress: 92, deadline: "Dec 22, 2025", status: "On Track" },
  { name: "Digital Clienteling Platform", lead: "Marcus Valerion", team: 8, progress: 45, deadline: "Mar 30, 2026", status: "At Risk" },
  { name: "Sustainable Leather Initiative", lead: "Sofia Bianchi", team: 15, progress: 30, deadline: "Jun 1, 2026", status: "On Track" },
];

export const TICKETS = [
  { id: "TKT-4821", subject: "Access to design cloud folder", requester: "Elena Marchetti", priority: "High", status: "Open", updated: "5m" },
  { id: "TKT-4820", subject: "Laptop replacement request", requester: "Marco Rossi", priority: "Medium", status: "In Progress", updated: "1h" },
  { id: "TKT-4819", subject: "VPN connection issue", requester: "Chloé Dubois", priority: "High", status: "Open", updated: "2h" },
  { id: "TKT-4818", subject: "Payslip clarification", requester: "Sofia Bianchi", priority: "Low", status: "Resolved", updated: "1d" },
  { id: "TKT-4817", subject: "Business card reorder", requester: "Léo Petit", priority: "Low", status: "Closed", updated: "2d" },
];

export const COURSES = [
  { title: "Luxury Client Experience", provider: "Valerion Academy", duration: "6h", progress: 72, category: "Client Service" },
  { title: "Sustainable Fashion Practices", provider: "Kering Institute", duration: "12h", progress: 40, category: "Sustainability" },
  { title: "Leadership at Valerion", provider: "INSEAD", duration: "20h", progress: 15, category: "Leadership" },
  { title: "GDPR & Data Ethics", provider: "Valerion Compliance", duration: "2h", progress: 100, category: "Compliance" },
  { title: "Italian for Boutique Teams", provider: "Berlitz", duration: "40h", progress: 55, category: "Language" },
  { title: "Advanced Pattern Making", provider: "Central Saint Martins", duration: "30h", progress: 28, category: "Craft" },
];

export const ASSETS = [
  { id: "AST-1042", type: "Laptop", model: "MacBook Pro 16″ M3 Max", assignedTo: "Elena Marchetti", assignedDate: "2024-03-12", status: "Assigned" },
  { id: "AST-1043", type: "Phone", model: "iPhone 15 Pro", assignedTo: "Elena Marchetti", assignedDate: "2024-03-12", status: "Assigned" },
  { id: "AST-1044", type: "Monitor", model: "Studio Display 27″", assignedTo: "Alessandro Rossi", assignedDate: "2023-11-01", status: "Assigned" },
  { id: "AST-1045", type: "Tablet", model: "iPad Pro 12.9″", assignedTo: "Sofia Bianchi", assignedDate: "2024-06-20", status: "Assigned" },
  { id: "AST-1046", type: "Laptop", model: "MacBook Air 15″ M3", assignedTo: "—", assignedDate: "—", status: "In Stock" },
  { id: "AST-1047", type: "Headphones", model: "AirPods Max", assignedTo: "Chloé Dubois", assignedDate: "2024-09-05", status: "Assigned" },
];

export const DOCUMENTS = [
  { name: "Employment Contract.pdf", category: "Contracts", size: "1.2 MB", updated: "Jan 12, 2024" },
  { name: "November Payslip.pdf", category: "Payroll", size: "340 KB", updated: "Nov 30, 2025" },
  { name: "Q3 Performance Review.pdf", category: "Performance", size: "820 KB", updated: "Oct 4, 2025" },
  { name: "Health Insurance Policy.pdf", category: "Benefits", size: "2.1 MB", updated: "Jan 1, 2025" },
  { name: "Passport Copy.pdf", category: "Identity", size: "540 KB", updated: "Mar 22, 2023" },
  { name: "Training Certificate — GDPR.pdf", category: "Training", size: "220 KB", updated: "Aug 15, 2025" },
];

export const AUDIT_LOGS = [
  { time: "12:42:11", user: "Marcus Valerion", action: "Updated role permissions", target: "role:manager", ip: "10.42.1.8" },
  { time: "12:38:04", user: "Isabelle Laurent", action: "Approved leave request", target: "req:1284", ip: "10.42.1.14" },
  { time: "12:31:22", user: "System", action: "Nightly payroll sync completed", target: "job:payroll-nightly", ip: "internal" },
  { time: "12:14:57", user: "Alessandro Rossi", action: "Signed performance review", target: "emp:HOV-2041", ip: "10.42.1.22" },
  { time: "11:58:03", user: "Chloé Dubois", action: "Uploaded document", target: "doc:contract-v3", ip: "10.42.1.31" },
  { time: "11:22:41", user: "Marcus Valerion", action: "Rotated API key", target: "key:integration-slack", ip: "10.42.1.8" },
];

export const LIFECYCLE = [
  { stage: "Recruitment", icon: "Search" },
  { stage: "Interview", icon: "MessageSquare" },
  { stage: "Offer", icon: "FileSignature" },
  { stage: "Onboarding", icon: "Sparkles" },
  { stage: "Active", icon: "Briefcase" },
  { stage: "Performance", icon: "TrendingUp" },
  { stage: "Promotion", icon: "Award" },
  { stage: "Training", icon: "GraduationCap" },
  { stage: "Payroll", icon: "Wallet" },
  { stage: "Exit", icon: "LogOut" },
];
