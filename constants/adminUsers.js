const defaultAdmins = [
  {
    name: "One",
    email: "ad@gmail.com",
    mobile: "9000000001",
  },
  {
    name: "Admin Two",
    email: "admin2@example.com",
    mobile: "9000000002",
  },
  {
    name: "Admin Three",
    email: "admin3@example.com",
    mobile: "9000000003",
  },
  {
    name: "Admin Four",
    email: "admin4@example.com",
    mobile: "9000000004",
  },
  {
    name: "Admin Five",
    email: "admin5@example.com",
    mobile: "9000000005",
  },
];

const normalizeAdmin = (admin) => ({
  name: String(admin.name || "").trim(),
  email: String(admin.email || "").trim().toLowerCase(),
  mobile: String(admin.mobile || "").trim(),
});

const parseAdminsFromEnv = () => {
  if (!process.env.ADMIN_USERS) {
    return [];
  }

  try {
    const admins = JSON.parse(process.env.ADMIN_USERS);
    return Array.isArray(admins) ? admins.map(normalizeAdmin) : [];
  } catch (error) {
    console.error("Invalid ADMIN_USERS JSON");
    return [];
  }
};

const admins = parseAdminsFromEnv();
const ADMIN_USERS = admins.length > 0 ? admins : defaultAdmins.map(normalizeAdmin);

const findAdmin = ({ name, email, mobile }) => {
  const normalizedName = String(name || "").trim().toLowerCase();
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const normalizedMobile = String(mobile || "").trim();

  return ADMIN_USERS.find(
    (admin) =>
      admin.name.toLowerCase() === normalizedName &&
      admin.email === normalizedEmail &&
      admin.mobile === normalizedMobile
  );
};

const findAdminByEmail = (email) => {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return ADMIN_USERS.find((admin) => admin.email === normalizedEmail);
};

module.exports = {
  ADMIN_USERS,
  findAdmin,
  findAdminByEmail,
};
