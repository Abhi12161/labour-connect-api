const mongoose = require("mongoose");

const fullTimeCustomerJobSchema = new mongoose.Schema(
    {
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true,
        },

        category: {
            type: String,
            required: true,
            trim: true,
        },

        role: {
            type: String,
            required: true,
            trim: true,
        },

        city: {
            type: String,
            required: true,
            trim: true,
        },

        experience: {
            type: String,
            required: true,
        },

        salaryFrom: {
            type: Number,
            default: 0,
        },

        salaryTo: {
            type: Number,
            default: 0,
        },

        vacancies: {
            type: Number,
            default: 1,
        },

        workingHours: {
            type: String,
            default: "",
        },

        description: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: ["Draft", "Published", "Closed"],
            default: "Draft",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model(
    "FullTimeCustomerJob",
    fullTimeCustomerJobSchema
);