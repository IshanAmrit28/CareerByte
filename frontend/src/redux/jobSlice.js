import { createSlice } from "@reduxjs/toolkit";

const jobSlice = createSlice({
    name:"job",
    initialState:{
        allJobs:[],
        allAdminJobs:[],
        singleJob:null, 
        searchJobByText:"",
        allAppliedJobs:[],
        filterCriteria: {
            keyword: "",
            location: "",
            company: "",
            experience: "",
            salary: "",
            isExternal: false
        },
    },
    reducers:{
        // actions
        setAllJobs:(state,action) => {
            state.allJobs = action.payload;
        },
        setSingleJob:(state,action) => {
            state.singleJob = action.payload;
        },
        setAllAdminJobs:(state,action) => {
            state.allAdminJobs = action.payload;
        },
        setSearchJobByText:(state,action) => {
            state.searchJobByText = action.payload;
        },
        setAllAppliedJobs:(state,action) => {
            state.allAppliedJobs = action.payload;
        },
        setFilterCriteria:(state,action) => {
            if (!state.filterCriteria) {
                state.filterCriteria = {
                    keyword: "",
                    location: "",
                    company: "",
                    experience: "",
                    salary: "",
                    isExternal: false
                };
            }
            state.filterCriteria = { ...state.filterCriteria, ...action.payload };
        },
        clearFilters:(state) => {
            state.filterCriteria = {
                keyword: "",
                location: "",
                company: "",
                experience: "",
                salary: "",
                isExternal: false
            };
        }
    }
});
export const {
    setAllJobs, 
    setSingleJob, 
    setAllAdminJobs,
    setSearchJobByText, 
    setAllAppliedJobs,
    setFilterCriteria,
    clearFilters
} = jobSlice.actions;
export default jobSlice.reducer;