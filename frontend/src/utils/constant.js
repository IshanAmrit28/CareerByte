// export const USER_API_END_POINT="https://jobboard-iscj.onrender.com/api/v1/user/";
// export const JOB_API_END_POINT="https://jobboard-iscj.onrender.com/api/v1/job/";
// export const APPLICATION_API_END_POINT="https://jobboard-iscj.onrender.com/api/v1/application/";
// export const COMPANY_API_END_POINT="https://jobboard-iscj.onrender.com/api/v1/company/";


export const USER_API_END_POINT="http://localhost:3000/api/v1/user/";
export const JOB_API_END_POINT="http://localhost:3000/api/v1/job/";
export const APPLICATION_API_END_POINT="http://localhost:3000/api/v1/application/";
export const COMPANY_API_END_POINT="http://localhost:3000/api/v1/company/";

// --- MOCK DATA START ---

// Companies Mock Data
export const MOCK_COMPANIES = [
    {
        _id: "67fb0bb7457895ce45ac5feb",
        name: "cisco",
        userId: "67fb0b92457895ce45ac5fdf",
        description: "tech company",
        location: "Pune",
        logo: "https://res.cloudinary.com/dwkhnnvan/image/upload/v1744505804/am95x1ko…",
        website: "www.cisco.com"
    },
    {
        _id: "67fba9631696bf683b6fe452",
        name: "microsoft",
        userId: "67fb0b92457895ce45ac5fdf",
        description: "tech company",
        location: "Hyderabadh",
        logo: "https://res.cloudinary.com/dwkhnnvan/image/upload/v1744546249/p6zgdhez…",
        website: "www.microsoft.com"
    },
    {
        _id: "67fbb5fd1696bf683b6fe64c",
        name: "Google",
        userId: "67fb0b92457895ce45ac5fdf",
        description: "tech company",
        location: "Hyderabadh",
        logo: "https://res.cloudinary.com/dwkhnnvan/image/upload/v1744549390/vyodtzxm…",
        website: "www.google.com"
    },
    {
        _id: "67fc1e05e92b73f14e1f2e8e",
        name: "IBM",
        userId: "67fb0b924345ead342f2ba2",
        description: "tech company",
        location: "Delhi NCR",
        logo: "https://res.cloudinary.com/dwkhnnvan/image/upload/v1744576034/ybnhlvh9…",
        website: "www.ibm.com"
    }
];

// Jobs Mock Data
export const MOCK_JOBS = [
    {
        _id: "67fb9dbc1696bf683b6fe2da",
        title: "web dev intern",
        description: "tech company",
        requirements: ["react js"],
        salary: 5000,
        experienceLevel: 1,
        location: "Pune",
        jobType: "remote",
        position: 10,
        company: "67fb0bb7457895ce45ac5feb", // cisco
        created_by: "67fb0b92457895ce45ac5fdf",
        applications: ["67fb9e2e1696bf683b6fe311", "67fbb59c1696bf683b6fe60b"],
    },
    {
        _id: "67fb9de01696bf683b6fe2e0",
        title: "mobile dev",
        description: "android cross platform",
        requirements: [],
        salary: 50000,
        experienceLevel: 0,
        location: "delhi",
        jobType: "remote",
        position: 11,
        company: "67fb0bb7457895ce45ac5feb", // cisco
        created_by: "67fb0b92457895ce45ac5fdf",
        applications: ["67fb9e2b1696bf683b6fe306", "67fbb59a1696bf683b6fe602"],
    },
    {
        _id: "67fb9e161696bf683b6fe2ec",
        title: "senior developer",
        description: "software",
        requirements: ["dev ops"],
        salary: 10000,
        experienceLevel: 2,
        location: "mumbai",
        jobType: "wfk",
        position: 3,
        company: "67fb0bb7457895ce45ac5feb", // cisco
        created_by: "67fb0b92457895ce45ac5fdf",
        applications: ["67fb9e271696bf683b6fe2fb", "67fbb5961696bf683b6fe5f9"],
    },
    {
        _id: "67fbb5f11696bf683b6fe643",
        title: "UI/UX designer",
        description: "Non techenical",
        requirements: ["Adobe tools"],
        salary: 0.5,
        experienceLevel: 5,
        location: "pune",
        jobType: "part time",
        position: 5,
        company: "67fba9631696bf683b6fe452", // microsoft
        created_by: "67fb0b92457895ce45ac5fdf",
        applications: ["67fbb6241696bf683b6fe65c", "67fbb63a1696bf683b6fe67a"],
    }
];

// Applications Mock Data (Simplified to hold key application data)
export const MOCK_APPLICATIONS = [
    {
        _id: "67fb9e271696bf683b6fe2fb",
        job: "67fb9e161696bf683b6fe2ec", // senior developer
        applicant: "67fb029a43745ead342f2ba2",
        status: "accepted"
    },
    {
        _id: "67fb9e2b1696bf683b6fe306",
        job: "67fb9de01696bf683b6fe2e0", // mobile dev
        applicant: "67fb029a43745ead342f2ba2",
        status: "rejected"
    },
    {
        _id: "67fb9e2e1696bf683b6fe311",
        job: "67fb9dbc1696bf683b6fe2da", // web dev intern
        applicant: "67fb029a43745ead342f2ba2",
        status: "rejected"
    },
    {
        _id: "67fbb5961696bf683b6fe5f9",
        job: "67fb9e161696bf683b6fe2ec", // senior developer
        applicant: "67fbb5841696bf683b6fe5ec",
        status: "accepted"
    },
    {
        _id: "67fbb6241696bf683b6fe65c",
        job: "67fbb5f11696bf683b6fe643", // UI/UX designer
        applicant: "67fb029a43745ead342f2ba2",
        status: "pending"
    }
];

// User/Applicant Mock Data (Only two distinct applicants from the applications)
export const MOCK_APPLICANTS = [
    {
        _id: "67fb029a43745ead342f2ba2", // Hypothetical applicant 1 (not in USERS IN MONGODB, created for application mock)
        fullname: "Mock Applicant One",
        email: "mock1@example.com",
        role: "student",
    },
    {
        _id: "67fbb5841696bf683b6fe5ec", // Hypothetical applicant 2 (not in USERS IN MONGODB, created for application mock)
        fullname: "Mock Applicant Two",
        email: "mock2@example.com",
        role: "student",
    }
];

// --- MOCK DATA END ---
